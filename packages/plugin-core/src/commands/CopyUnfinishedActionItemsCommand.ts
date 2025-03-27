import {
  DendronASTDest,
  DEngineClient,
  NotePropsMeta,
  ReducedDEngine,
  RespV3,
} from "@dendronhq/common-all";
import _ from "lodash";
import path from "path";
import { window } from "vscode";
import { PickerUtilsV2 } from "../components/lookup/utils";
import { ExtensionProvider } from "../ExtensionProvider";
import { MessageSeverity, VSCodeUtils } from "../vsCodeUtils";
import { BasicCommand } from "./base";

import { MDUtilsV5, ProcMode } from "@dendronhq/unified";
import { DConfig } from "@dendronhq/common-server";
import type { List, Root } from "mdast";

type Direction = "next" | "prev";

type CommandOutput = {
  msg: "ok" | "no_editor" | "no_siblings" | "other_error";
  data?: string;
};

export class CopyUnfinishedActionItemsCommand extends BasicCommand<
  never,
  CommandOutput
> {
  key = "dendron.copyActionItems";

  async gatherInputs(): Promise<any> {
    return {};
  }

  async execute(): Promise<CommandOutput> {
    // Check if editor exists
    const textEditor = VSCodeUtils.getActiveTextEditor();
    if (!textEditor) {
      window.showErrorMessage("You need to be in a note to use this command");
      return { msg: "no_editor" };
    }

    const fname = path.basename(textEditor.document.uri.fsPath, ".md");
    const ext = ExtensionProvider.getExtension();
    const workspace = ext.getDWorkspace();

    // Get active note
    const activeNote = await this.getActiveNote(workspace.engine, fname);
    if (!activeNote) {
      window.showErrorMessage("Please open a Dendron note to use this command");
      return { msg: "other_error" };
    }

    // Get sibling note
    const siblingResp = await this.getSiblingForJournalNote(
      workspace.engine,
      activeNote,
      "prev"
    );

    if (siblingResp.error) {
      VSCodeUtils.showMessage(
        MessageSeverity.WARN,
        siblingResp.error.message,
        {}
      );
      return { msg: "other_error" };
    }

    // Extract unfinished items from sibling note
    const siblingNote = siblingResp.data.sibling;
    const unfinishedItems = await this.extractUnfinishedItems(
      workspace,
      siblingNote
    );

    if (!unfinishedItems) {
      return { msg: "ok" };
    }

    // Insert unfinished items at the end of current note
    await textEditor.edit((callback) => {
      callback.insert(
        textEditor.document.lineAt(textEditor.document.lineCount - 1).range.end,
        `\n\n${unfinishedItems}`
      );
    });

    return { msg: "ok", data: unfinishedItems };
  }

  /**
   * Extract unfinished (unchecked) action items from a note
   */
  private async extractUnfinishedItems(
    workspace: any,
    note: NotePropsMeta
  ): Promise<string | null> {
    // Parse note content
    const config = DConfig.readConfigSync(workspace.engine.wsRoot);
    const proc = MDUtilsV5.procRemarkParse(
      { mode: ProcMode.FULL },
      {
        noteToRender: note,
        dest: DendronASTDest.MD_DENDRON,
        vault: note.vault,
        fname: note.fname,
        config,
      }
    );

    const ast: Root = proc.parse(note.body) as any;
    const lists = ast.children.filter((node) => node.type === "list");

    // Return early if no lists found
    if (lists.length === 0) {
      return null;
    }

    // Process all lists to keep only unchecked items
    const processedLists = lists.map((list) => this.filterCheckedItems(list));

    // Convert lists back to markdown and join them
    return processedLists
      .map((list) => proc().stringify(list as any))
      .join("\n\n");
  }

  /**
   * Recursively filter out checked items from a list
   */
  private filterCheckedItems(list: List): List {
    // Create a new list with only unchecked items
    const filteredChildren = list.children
      .filter((item: any) => {
        // Keep only unchecked items (not checked and has checkbox)
        return item.checked !== null && !item.checked;
      })
      .map((item: any) => {
        // Process nested lists if present
        if (item.children) {
          return {
            ...item,
            children: item.children.map((child: any) => {
              if (child.type === "list") {
                return this.filterCheckedItems(child as List);
              }
              return child;
            }),
          };
        }
        return item;
      });

    // Return new list with filtered children
    return {
      ...list,
      children: filteredChildren,
    };
  }

  /**
   * Get active note metadata
   */
  async getActiveNote(
    engine: DEngineClient,
    fname: string
  ): Promise<NotePropsMeta | null> {
    const vault = PickerUtilsV2.getVaultForOpenEditor();
    const notes = await engine.findNotesMeta({ fname, vault });
    return notes.length > 0 ? notes[0] : null;
  }

  /**
   * Get sibling journal note (next or previous)
   */
  private async getSiblingForJournalNote(
    engine: ReducedDEngine,
    currNote: NotePropsMeta,
    direction: Direction
  ): Promise<RespV3<{ sibling: NotePropsMeta }>> {
    // Get all journal notes
    const journalNotes = await this.getAllJournalNotes(engine, currNote);

    // Handle case with no siblings
    if (journalNotes.length <= 1) {
      return {
        error: {
          name: "no_siblings",
          message: "There is no sibling journal note available",
        },
      };
    }

    // Sort by date
    const sortedNotes = _.sortBy(journalNotes, [
      (note) => this.getDateFromJournalNote(note).valueOf(),
    ]);

    // Find current note index
    const currentIndex = _.findIndex(sortedNotes, { id: currNote.id });

    // Get next or previous sibling
    let siblingIndex: number;
    if (direction === "next") {
      siblingIndex =
        currentIndex === sortedNotes.length - 1 ? 0 : currentIndex + 1;
    } else {
      siblingIndex =
        currentIndex === 0 ? sortedNotes.length - 1 : currentIndex - 1;
    }

    return { data: { sibling: sortedNotes[siblingIndex] } };
  }

  /**
   * Get all journal notes in the hierarchy
   */
  private async getAllJournalNotes(
    engine: ReducedDEngine,
    currNote: NotePropsMeta
  ): Promise<NotePropsMeta[]> {
    if (!currNote.parent) {
      return [];
    }

    // Navigate up to find the journal root
    const monthNote = await engine.getNoteMeta(currNote.parent);
    if (!monthNote.data?.parent) return [];

    const yearNote = await engine.getNoteMeta(monthNote.data.parent);
    if (!yearNote.data?.parent) return [];

    const journalRoot = await engine.getNoteMeta(yearNote.data.parent);
    if (!journalRoot.data) return [];

    // Collect all day notes from all years and months
    const allDayNotes = await Promise.all(
      journalRoot.data.children.flatMap(async (yearId) => {
        const year = await engine.getNoteMeta(yearId);
        if (!year.data) return [];

        // Get all months in this year
        const months = await engine.bulkGetNotesMeta(year.data.children);

        // Get all days from all months
        const days = await Promise.all(
          months.data.map(async (month) => {
            const dayNotes = await engine.bulkGetNotesMeta(month.children);
            return dayNotes.data;
          })
        );

        return days.flat();
      })
    );

    // Return only non-stub notes
    return allDayNotes.flat().filter((note) => !note.stub);
  }

  /**
   * Extract date from journal note filename
   */
  private getDateFromJournalNote(note: NotePropsMeta): Date {
    const [year, month, day] = note.fname
      .split("")
      .slice(-3)
      .map((str) => parseInt(str, 10));
    return new Date(year, month - 1, day);
  }
}
