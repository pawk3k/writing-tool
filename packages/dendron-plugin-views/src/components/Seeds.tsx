import {
  CheckCircleOutlined,
  DisconnectOutlined,
  DownloadOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import {
  DMessageSource,
  SeedBrowserMessage,
  SeedBrowserMessageType,
} from "@dendronhq/common-all";
import { Tooltip } from "antd";
import { postVSCodeMessage } from "../utils/vscode";

/**
 * Component for the GoToSite button on a seed browser card
 * @param url - URL to open
 * @param inVscode - set if within vs code webview, do not set for browser.
 * @returns
 */
export function GoToSiteButton({
  url,
  inVscode,
}: {
  url: string | undefined;
  inVscode: boolean;
}) {
  const onClick = () => {
    if (url) {
      // If we're in VSCode, the webview does not allow popups, so send a
      // message back to the plugin and open the link from within the plugin
      if (inVscode) {
        postVSCodeMessage({
          type: SeedBrowserMessageType.onOpenUrl,
          data: { data: url },
          source: DMessageSource.webClient,
        } as SeedBrowserMessage);
      } else {
        // @ts-expect-error TS2304 - Cannot find name 'window'.
        window.open(url);
      }
    }
  };

  if (url) {
    return (
      // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
      <Tooltip placement="top" title="Go to Site">
        {/*
         // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
        <GlobalOutlined key="website" onClick={onClick} />
      </Tooltip>
    );
  } else {
    return (
      // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
      <Tooltip placement="top" title="Site Unavailable">
        {/*
         // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
        <DisconnectOutlined key="website" onClick={onClick} />
      </Tooltip>
    );
  }
}

/**
 * Component for Button to Add Seed to Workspace on a seed browser card
 * @param existsInWorkspace - does the seed already exist in the users workspace?
 * @param seedId - seed unique ID
 * @returns
 */
export function AddToWorkspaceButton({
  existsInWorkspace,
  seedId,
}: {
  existsInWorkspace: boolean;
  seedId: string;
}) {
  const onClick = () => {
    postVSCodeMessage({
      type: SeedBrowserMessageType.onSeedAdd,
      data: { data: seedId },
      source: DMessageSource.webClient,
    } as SeedBrowserMessage);
  };

  if (!existsInWorkspace) {
    return (
      // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
      <Tooltip placement="top" title="Add to Workspace">
        {/*
         // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
        <DownloadOutlined key="download" onClick={onClick} />
      </Tooltip>
    );
  }
  return (
    // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
    <Tooltip placement="top" title="Already in Workspace">
      {/*
       // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
      <CheckCircleOutlined key="installed" disabled />
    </Tooltip>
  );
}
