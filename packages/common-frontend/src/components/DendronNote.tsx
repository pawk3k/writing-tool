import React from "react";
import { createLogger } from "../utils/logger";

type Props = {
  noteContent: string;
};

export const useMermaid = ({
  noteRenderedBody,
}: {
  noteRenderedBody?: string;
}) => {
  React.useEffect(() => {
    const logger = createLogger("useMermaid");
    // @ts-expect-error fix types with window here
    const mermaid = (window as any)._mermaid;
    logger.info("mermaid created");
    if (mermaid) {
      logger.info("mermaid initialized");
      mermaid.init();
    }
  }, [noteRenderedBody]);
};

export function DendronNote({ noteContent, ...rest }: Props) {
  useMermaid({ noteRenderedBody: noteContent });
  const logger = createLogger("DendronNote");
  logger.info({ ctx: "DendronNote" });
  return <div dangerouslySetInnerHTML={{ __html: noteContent }} {...rest} />;
}
