import type { DVault, WorkspaceOpts } from "@dendronhq/common-all";
import {
  type CreateNoteOptsV4,
  NoteTestUtilsV4,
} from "@dendronhq/common-test-utils";
import type { IDendronExtension } from "../../dendronExtensionInterface";
import { VSCodeUtils } from "../../vsCodeUtils";
import { WSUtilsV2 } from "../../WSUtilsV2";

const createNotes = async ({
  opts,
  fnames,
}: {
  opts: Omit<CreateNoteOptsV4, "fname">;
  fnames: string[];
}) => {
  Promise.all(
    fnames.map(async (fname) => NoteTestUtilsV4.createNote({ ...opts, fname }))
  );
};
export const getPostSetupHookForNonJournalNotes =
  (fnames: string[]) =>
  async ({ wsRoot, vaults }: WorkspaceOpts) => {
    await createNotes({
      opts: { wsRoot, vault: vaults[0] },
      fnames,
    });
  };
export const getPostHostSetupHookForJournalNotes =
  (fnames: string[]) =>
  async ({ wsRoot, vaults }: WorkspaceOpts) => {
    await createNotes({
      opts: { wsRoot, vault: vaults[0], props: { traits: ["journalNote"] } },
      fnames: fnames.map((name) => "journal." + name),
    });
  };
export const getActiveDocumentFname = () =>
  VSCodeUtils.getActiveTextEditor()?.document.uri.fsPath;
export const openNote = async (
  ext: IDendronExtension,
  fname: string,
  vault?: DVault
) => {
  const { engine } = ext.getDWorkspace();
  const hitNotes = await engine.findNotesMeta({ fname, vault });
  if (hitNotes.length === 0) throw Error("Cannot find the active note");
  await new WSUtilsV2(ext).openNote(hitNotes[0]);
};
