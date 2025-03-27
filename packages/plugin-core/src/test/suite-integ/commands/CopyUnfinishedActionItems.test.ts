import { openNote } from "../../common/utils";
import { describeSingleWS } from "../../testUtilsV3";
import { ExtensionProvider } from "../../../ExtensionProvider";

import { expect } from "../../testUtilsv2";
import { NoteTestUtilsV4 } from "@dendronhq/common-test-utils";
import { CopyUnfinishedActionItemsCommand } from "../../../commands/CopyUnfinishedActionItemsCommand";

const completedTask = "- [x] Task 1";
const notATask = "1. Kek";

suite("CopyUnfinishedActionItems", () => {
  describeSingleWS(
    "WHEN copying action items from previous day",
    {
      postSetupHook: async ({ wsRoot, vaults }: any) => {
        // Create journal note for previous day with action items
        await NoteTestUtilsV4.createNote({
          wsRoot,
          vault: vaults[0],
          fname: "journal.2022.07.05",
          props: { traits: ["journalNote"] },
          body: `# Action Items\n${completedTask}\n- [ ] Task 2\n# Other Content\nSome text here\n1. Kek`,
        });

        // Create journal note for current day (empty)
        await NoteTestUtilsV4.createNote({
          wsRoot,
          vault: vaults[0],
          fname: "journal.2022.07.06",
          props: { traits: ["journalNote"] },
          body: "Initial content",
        });
      },
    },
    () => {
      test("THEN unfinished action items should be copied to current note", async () => {
        const ext = ExtensionProvider.getExtension();
        // Open the current day's note
        await openNote(ext, "journal.2022.07.06");

        const { data } = await new CopyUnfinishedActionItemsCommand().execute({
          direction: "prev",
        });

        const trimmedData = data?.trim();

        expect(trimmedData).toContain("- [ ] Task 2");

        if (trimmedData?.includes(completedTask)) {
          throw new Error("Should not include completed tasks");
        }

        if (trimmedData?.includes(notATask)) {
          throw new Error("Should not include regular list items");
        }
      });
    }
  );
});
