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
type CommandOpts = { direction: Direction };
export { CommandOpts as GoToSiblingCommandOpts };

type CommandOutput = {
  msg: "ok" | "no_editor" | "no_siblings" | "other_error";
  data?: string;
};

export class CopyUnfinishedActionItemsCommand extends BasicCommand<
  CommandOpts,
  CommandOutput
> {
  key = "dendron.copyActionItems";

  async gatherInputs(): Promise<any> {
    return {};
  }

  async execute(opts: CommandOpts) {
    // check if editor exists
    const textEditor = VSCodeUtils.getActiveTextEditor();
    if (!textEditor) {
      window.showErrorMessage("You need to be in a note to use this command");
      return {
        msg: "no_editor" as const,
      };
    }

    const fname = path.basename(textEditor.document.uri.fsPath, ".md");
    const ext = ExtensionProvider.getExtension();
    const workspace = ext.getDWorkspace();
    const activeNote = await this.getActiveNote(workspace.engine, fname);

    // check if a Dendron note is active
    if (!activeNote) {
      window.showErrorMessage("Please open a Dendron note to use this command");
      return {
        msg: "other_error" as const,
      };
    }

    const resp = await this.getSiblingForJournalNote(
      workspace.engine,
      activeNote,
      opts.direction
    );

    if (resp.error) {
      VSCodeUtils.showMessage(MessageSeverity.WARN, resp.error.message, {});
      return { msg: "other_error" } as CommandOutput;
    }
    const siblingNote = resp.data.sibling;
    const note = siblingNote;

    const proc = MDUtilsV5.procRemarkParse(
      { mode: ProcMode.FULL },
      {
        noteToRender: note,
        dest: DendronASTDest.MD_DENDRON,
        vault: note.vault,
        fname: note.fname,
        config: DConfig.readConfigSync(workspace.engine.wsRoot),
      }
    );

    const ast: Root = proc.parse(note.body) as any;

    const lists = ast.children.filter((node) => node.type === "list");

    // Return early if no lists found
    if (lists.length === 0) {
      return { msg: "ok" as const };
    }

    // Create a recursive function to filter checked items at all levels
    const filterCheckedItemsRecursively = (node: List): any => {
      // Base case: if no children, return the node as is
      if (!node.children || node.children.length === 0) {
        return node;
      }

      // Filter unchecked items at this level
      const filteredChildren = node.children
        .filter((item) => item.checked !== null && !item.checked)
        .map((item) => {
          // If this item has children (potentially a nested list), process recursively
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: item.children.map((child) => {
                if (child.type === "list") {
                  return filterCheckedItemsRecursively(child as List);
                }
                return child;
              }),
            };
          }
          return item;
        });

      return {
        ...node,
        children: filteredChildren,
      };
    };

    // Process all lists, not just the first one
    const transformedLists = lists.map((list) =>
      filterCheckedItemsRecursively(list)
    );

    // Combine all lists into a single string
    const stringResults = transformedLists
      .map((list) => proc().stringify(list))
      .join("\n\n");

    textEditor.edit((callback) => {
      // Insert action items at the end
      callback.insert(
        textEditor.document.lineAt(textEditor.document.lineCount - 1).range.end,
        `\n\n${stringResults}`
      );
    });

    return { msg: "ok" as const, data: stringResults };
  }

  async getActiveNote(
    engine: DEngineClient,
    fname: string
  ): Promise<NotePropsMeta | null> {
    const vault = PickerUtilsV2.getVaultForOpenEditor();
    const hitNotes = await engine.findNotesMeta({ fname, vault });
    return hitNotes.length !== 0 ? hitNotes[0] : null;
  }

  private async getSiblingForJournalNote(
    engine: ReducedDEngine,
    currNote: NotePropsMeta,
    direction: Direction
  ): Promise<RespV3<{ sibling: NotePropsMeta }>> {
    const journalNotes = await this.getSiblingsForJournalNote(engine, currNote);
    // If the active note is the only journal note in the workspace, there is no sibling
    if (journalNotes.length === 1) {
      return {
        error: {
          name: "no_siblings",
          message:
            "There is no sibling journal note. Currently open note is the only journal note in the current workspace",
        },
      };
    }
    // Sort all journal notes in the workspace
    const sortedJournalNotes = _.sortBy(journalNotes, [
      (note) => this.getDateFromJournalNote(note).valueOf(),
    ]);
    const currNoteIdx = _.findIndex(sortedJournalNotes, { id: currNote.id });
    // Get the sibling based on the direction.
    let sibling: NotePropsMeta;
    if (direction === "next") {
      sibling =
        currNoteIdx !== sortedJournalNotes.length - 1
          ? sortedJournalNotes[currNoteIdx + 1]
          : // If current note is the latest journal note, get the earliest note as the sibling
            sortedJournalNotes[0];
    } else {
      sibling =
        currNoteIdx !== 0
          ? sortedJournalNotes[currNoteIdx - 1]
          : // If current note is the earliest journal note, get the last note as the sibling
            _.last(sortedJournalNotes)!;
    }
    return { data: { sibling } };
  }

  private getSiblingsForJournalNote = async (
    engine: ReducedDEngine,
    currNote: NotePropsMeta
  ): Promise<NotePropsMeta[]> => {
    if (!currNote.parent) {
      return [];
    }
    const monthNote = await engine.getNoteMeta(currNote.parent);
    if (!monthNote.data) {
      return [];
    }
    if (!monthNote.data.parent) {
      return [];
    }
    const yearNote = await engine.getNoteMeta(monthNote.data.parent);
    if (!yearNote.data) {
      return [];
    }
    if (!yearNote.data.parent) {
      return [];
    }
    const parentNote = await engine.getNoteMeta(yearNote.data.parent!);
    if (!parentNote.data) {
      return [];
    }

    const siblings = await Promise.all(
      parentNote.data.children.flatMap(async (yearNoteId) => {
        const yearNote = await engine.getNoteMeta(yearNoteId);
        if (yearNote.data) {
          const children = await engine.bulkGetNotesMeta(
            yearNote.data.children
          );
          const results = await Promise.all(
            children.data.flatMap(async (monthNote) => {
              const monthChildren = await engine.bulkGetNotesMeta(
                monthNote.children
              );

              return monthChildren.data;
            })
          );
          return results.flat();
        } else {
          return [];
        }
      })
    );
    // Filter out stub notes
    return siblings.flat().filter((note) => !note.stub);
  };

  private getDateFromJournalNote(note: NotePropsMeta): Date {
    const [year, month, date] = note.fname
      .split("")
      .slice(-3)
      .map((str) => parseInt(str, 10));
    return new Date(year, month - 1, date);
  }
}
