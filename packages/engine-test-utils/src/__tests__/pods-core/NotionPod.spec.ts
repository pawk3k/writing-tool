import { ENGINE_HOOKS } from "../../presets";
import { NotionExportPod } from "@dendronhq/pods-core";
import { runEngineTestV5 } from "../../engine";
import { VaultUtils } from "@dendronhq/common-all";

describe("GIVEN a Notion export pod", () => {
  const utilityMethods = {
    withProgressOpts: {
      withProgress: vi.fn().mockResolvedValue({ Page1: "sgwhwhwwie" }),
      location: "Notification",
    },
    getSelectionFromQuickpick: vi.fn().mockResolvedValue("Page1"),
  };
  describe("WHEN running the pod for a vault", () => {
    test("THEN notes must be parsed into Notion Blocks and should create pages in Notion", async () => {
      await runEngineTestV5(
        async ({ engine, vaults, wsRoot }) => {
          const pod = new NotionExportPod();
          const vaultName = VaultUtils.getName(vaults[0]);
          pod.createPagesInNotion = vi.fn();
          pod.getAllNotionPages = vi.fn();
          pod.convertMdToNotionBlock = vi.fn();
          await pod.execute({
            engine,
            vaults,
            wsRoot,
            config: {
              vault: vaultName,
              dest: "TODO",
              apiKey: "hddkeosndbfjw",
            },
            utilityMethods,
          });
          expect(pod.createPagesInNotion).toHaveBeenCalledTimes(1);
          expect(pod.convertMdToNotionBlock).toHaveBeenCalledTimes(1);
        },
        {
          expect,
          preSetupHook: ENGINE_HOOKS.setupBasic,
        }
      );
    });
  });
});
