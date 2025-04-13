import { DendronComponent } from "../types";
import DendronGraphPanel from "./DendronGraphPanel";

/**
 * Wrapper component around DendronGraphPanel
 * @param props
 * @returns DendronGraphPanel component with ide.isSidePanel set to true
 */
const DendronSideGraphPanel: DendronComponent = (props) => {
  props = {
    ...props,
    isSidePanel: true,
  };
  // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
  return <DendronGraphPanel {...props} />;
};
export default DendronSideGraphPanel;
