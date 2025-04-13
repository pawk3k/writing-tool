import { DMessage, VSCodeMessage } from "@dendronhq/common-all";

import { DMessageEnum, DMessageSource } from "@dendronhq/common-all/src/types";
import React from "react";

/**
 * Post message to VSCode process
 * @param msg
 */
export const postVSCodeMessage = (msg: DMessage) => {
  // @ts-ignore
  if (window.vscode) {
    // @ts-ignore
    window.vscode.postMessage(msg, "*");
  }
};

export const useVSCodeMessage = (setMsgHook: (msg: VSCodeMessage) => void) => {
  // @ts-expect-error TS2315 - Type 'MessageEvent' is not generic.
  const listener = React.useCallback((msg: MessageEvent<DMessage>) => {
    const payload = msg.data || {}; // The JSON data our extension sent
    if (payload.source === "vscode") {
      setMsgHook(payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    // set listener for all messages
    // @ts-expect-error TS2304 - Cannot find name 'window'.
    window.addEventListener("message", listener);

    postVSCodeMessage({
      type: DMessageEnum.MESSAGE_DISPATCHER_READY,
      data: {},
      source: DMessageSource.webClient,
    });

    return () => {
      // @ts-expect-error TS2304 - Cannot find name 'window'.
      window.removeEventListener("message", listener);
    };
  }, [listener]);
};
