import { QuickPick } from "vscode";

export type DoctorScopeType = "workspace" | "file";

type DoctorQuickInput = {
  label: string;
  detail?: string;
  alwaysShow?: boolean;
};

export type DoctorQuickPickItem = QuickPick<DoctorQuickInput>;

type CreateQuickPickOpts = {
  title: string;
  placeholder: string;
  /**
   * QuickPick.ignoreFocusOut prop
   */
  ignoreFocusOut?: boolean;
  nonInteractive?: boolean;
};
