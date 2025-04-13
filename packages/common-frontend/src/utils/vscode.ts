import {
  DMessageEnum,
  DMessageSource,
  type DMessage,
  type VSCodeMessage,
} from "@dendronhq/common-all/src/types";
import { useEffect } from "react";

/**
 * Listen to vscode messages
 * @param setMsgHook
 */
export const useVSCodeMessage = (setMsgHook: (msg: VSCodeMessage) => void) => {
  const listener = (msg: DMessage) => {
    const payload = msg.data || {}; // The JSON data our extension sent
    if (payload.source === "vscode") {
      setMsgHook(payload);
    }
  };
  useEffect(() => {
    // @ts-ignore
    window.addEventListener("message", listener);
    // @ts-expect-error TS2304 - Cannot find name 'window'.
    if (window.parent !== window) {
      // If using TypeScript, next line should be:
      // let listener = (e: KeyboardEvent) =>
      const keyListener = (e: any) => {
        console.log("sending key event");
        // @ts-expect-error TS2304 - Cannot find name 'window'.
        window.parent.postMessage(
          JSON.stringify({
            altKey: e.altKey,
            code: e.code,
            ctrlKey: e.ctrlKey,
            isComposing: e.isComposing,
            key: e.key,
            location: e.location,
            metaKey: e.metaKey,
            repeat: e.repeat,
            shiftKey: e.shiftKey,
          }),
          "*"
        );
      };

      // @ts-expect-error TS2304 - Cannot find name 'window'.
      if (!window.hasOwnProperty("keyhookInstalled")) {
        // @ts-expect-error TS2304 - Cannot find name 'window'.
        (window as any).keyhookInstalled = true;
        // @ts-expect-error TS2304 - Cannot find name 'window'.
        window.addEventListener("keydown", keyListener);
      }
    }

    postVSCodeMessage({
      type: DMessageEnum.MESSAGE_DISPATCHER_READY,
      data: {},
      source: DMessageSource.webClient,
    });

    return () => {
      // @ts-ignore
      window.removeEventListener("message", listener);
      // @ts-expect-error TS2304 - Cannot find name 'window'.
      delete (window as any)["keyhookInstalled"];
    };
  }, []);
};

export const postVSCodeMessage = (msg: DMessage) => {
  // @ts-ignore
  if (window) {
    // @ts-ignore
    window.parent.postMessage(msg, "*");
  }
};
