import { DNoteLoc } from "@dendronhq/common-all";
import Unified, { Transformer } from "unified";
import { Node } from "unist";
import visit from "unist-util-visit";
import { VFile } from "vfile";
import { DendronASTTypes, NoteRefNoteV4, WikiLinkNoteV4 } from "../types";

type PluginOpts = {
  from: DNoteLoc;
  to: DNoteLoc;
};

/**
 * Used from renaming wikilinks
 */
function plugin(this: Unified.Processor, opts: PluginOpts): Transformer {
  function transformer(tree: Node, _file: VFile) {
    visit(tree, (node, _idx, _parent) => {
      if (node.type === DendronASTTypes.WIKI_LINK) {
        // @ts-expect-error TS2352 - Conversion of type 'Node<Data>' to type 'WikiLinkNoteV4' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
        const cnode = node as WikiLinkNoteV4;
        if (cnode.value.toLowerCase() === opts.from.fname.toLowerCase()) {
          cnode.value = opts.to.fname;
          // if alias the same, change that to
          if (
            cnode.data.alias.toLowerCase() === opts.from.fname.toLowerCase()
          ) {
            cnode.data.alias = opts.to.fname;
          }
        }
      }
      if (node.type === DendronASTTypes.REF_LINK_V2) {
        // @ts-expect-error TS2352 - Conversion of type 'Node<Data>' to type 'NoteRefNoteV4' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
        const cnode = node as NoteRefNoteV4;
        if (
          cnode.data.link.from.fname.toLowerCase() ===
          opts.from.fname.toLowerCase()
        ) {
          cnode.data.link.from.fname = opts.to.fname;
        }
      }
    });
    return tree;
  }
  return transformer;
}

export { plugin as transformLinks };
export { PluginOpts as TransformLinkOpts };
