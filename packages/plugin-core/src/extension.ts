import * as vscode from "vscode";
import { Logger } from "./logger";
import { DWorkspace } from "./workspacev2";

export function activate(context: vscode.ExtensionContext) {
  Logger.configure(context, "debug");
  // TODO: Please fix and remove the suppression
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./_extension").activate(context);  
  return {
    DWorkspace,
    Logger,
  };
}

export function deactivate() {
  // TODO: Please fix and remove the suppression
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("./_extension").deactivate();  
}
