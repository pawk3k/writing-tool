import React from "react";
import { DendronProps, WorkspaceProps } from "../types";
import type { NoteProps } from "@dendronhq/common-all/src/types/foundation";
import { useEngineAppDispatch } from "@dendronhq/common-frontend/src/features/engine/hooks";
import { renderNote } from "@dendronhq/common-frontend/src/features/engine/slice";
import { createLogger } from "@dendronhq/common-frontend/src/utils/logger";

export const useCurrentTheme = () => {
  const [currentTheme, setCurrentTheme] = React.useState<"light" | "dark">(
    "light"
  );
  React.useEffect(() => {
    if (window.currentTheme) {
      setCurrentTheme(window.currentTheme);
    }
    // @ts-ignore
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.currentTheme]);
  return { currentTheme, setCurrentTheme };
};

export const useWorkspaceProps = (): [WorkspaceProps] => {
  const elem = window.document.getElementById("root")!;
  const url = elem.getAttribute("data-url")!;
  const ws = elem.getAttribute("data-ws")!;
  const isBrowser = elem.getAttribute("data-browser")! === "true";
  const theme = elem.getAttribute("data-browser")!;
  return [
    {
      url,
      ws,
      browser: isBrowser,
      theme,
    },
  ];
};

/**
 * Body of current note
 * @param param0 - if previewHTML is passed in, just return that HTML directly
 * and don't do any additional rendering.
 * @returns
 */
export const useRenderedNoteBody = ({
  engine,
  noteProps,
  workspace,
  previewHTML,
}: DendronProps & { noteProps?: NoteProps; previewHTML?: string }) => {
  const { id: noteId, contentHash } = noteProps || {
    id: undefined,
    contentHash: undefined,
  };

  let noteContent: string | undefined;

  if (previewHTML) {
    noteContent = previewHTML;
  } else {
    noteContent = noteId ? engine.notesRendered[noteId] : undefined;
  }
  const renderedNoteContentHash = React.useRef<string>();
  const dispatch = useEngineAppDispatch();

  React.useEffect(() => {
    if (!noteId) {
      return;
    }
    // if no "render to markdown" has happended or the note body changed
    if (
      !previewHTML &&
      (!noteContent || contentHash !== renderedNoteContentHash.current)
    ) {
      renderedNoteContentHash.current = contentHash;
      dispatch(renderNote({ ...workspace, id: noteId, note: noteProps }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, contentHash]);
  // }, [noteId, contentHash, dispatch, noteContent, workspace]);

  return [noteContent];
};

/**
 * Initialize mermaid if it is enabled in the config file.
 * Converts all divs with the class "mermaid" into svgs.
 *
 * https://mermaid-js.github.io/mermaid/#/
 */
export const useMermaid = ({
  themeType,
  mermaid,
  noteRenderedBody,
}: {
  themeType: "light" | "dark";
  mermaid: any;
  noteRenderedBody?: string;
}) => {
  React.useEffect(() => {
    const logger = createLogger("useMermaid");

    mermaid.initialize({
      startOnLoad: true,
      // Cast here because the type definitions seem to be incorrect. I can't
      // get a value for the mermaid Theme enum, it's always undefined at
      // runtime.
      theme: (themeType === "light" ? "forest" : "dark") as any,
    });
    // use for debugging
    // @ts-ignore
    window._mermaid = mermaid;
    // @ts-ignore
    mermaid.init();
    logger.info({ msg: "init mermaid library", themeType });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteRenderedBody, themeType]);
};

/**
 * Metadata about current note
 * @param param0
 * @returns
 */
const useNoteProps = ({
  engine,
  noteId,
}: DendronProps & { noteId: string }) => {
  const maybeNote = engine.notes[noteId];
  if (!maybeNote) {
    throw Error(`note with id ${noteId} not found`);
  }
  return [maybeNote];
};
