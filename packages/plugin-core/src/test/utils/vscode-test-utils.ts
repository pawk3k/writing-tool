import { tmpDir } from "@dendronhq/common-server";
import { stub } from "sinon";
import * as vscode from "vscode";
import { VSCodeUtils } from "../../vsCodeUtils";
import { DendronExtension } from "../../workspace";

export class VSCodeTestUtils {
  static mockUserConfigDir() {
    const dir = tmpDir().name;
    const getCodeUserConfigDurStub = stub(VSCodeUtils, "getCodeUserConfigDir");
    getCodeUserConfigDurStub.callsFake(() => {
      const wrappedMethod = getCodeUserConfigDurStub.wrappedMethod;
      const originalOut = wrappedMethod();
      return {
        userConfigDir: [dir, originalOut.delimiter].join(""),
        delimiter: originalOut.delimiter,
        osName: originalOut.osName,
      };
    });
    return getCodeUserConfigDurStub;
  }

  static stubWSFolders(wsRoot: string | undefined) {
    if (wsRoot === undefined) {
      const workspaceFoldersStub = stub(
        vscode.workspace,
        "workspaceFolders"
      ).value(undefined);
      DendronExtension.workspaceFolders = () => undefined;
      return workspaceFoldersStub;
    }
    const wsFolders = [
      {
        name: "root",
        index: 0,
        uri: vscode.Uri.parse(wsRoot),
      },
    ];
    const mockWorkspaceFolders = stub(
      vscode.workspace,
      "workspaceFolders"
    ).value(wsFolders);
    DendronExtension.workspaceFolders = () => wsFolders;
    return mockWorkspaceFolders;
  }
}
