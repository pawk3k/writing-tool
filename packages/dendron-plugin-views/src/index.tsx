/* eslint-disable no-console, global-require, import/no-dynamic-require  */

import { renderOnDOM } from "./bootstrap";
import React from "react";

// Import all components directly to ensure they're included in the bundle
// import DendronNotePreview from "./components/DendronNotePreview";
import SampleComponent from "./components/SampleComponent";
// import DendronLookupPanel from "./components/DendronLookupPanel";
import DendronCalendarPanel from "./components/DendronCalendarPanel";
import DendronGraphPanel from "./components/DendronGraphPanel";
import DendronSchemaGraphPanel from "./components/DendronSchemaGraphPanel";
import DendronSideGraphPanel from "./components/DendronSideGraphPanel";
import SeedBrowser from "./components/SeedBrowser";
import DendronConfigure from "./components/DendronConfigure";

// Component registry that maps names to actual components
const COMPONENT_REGISTRY = {
  // DendronNotePreview,
  SampleComponent,
  // DendronLookupPanel,
  DendronCalendarPanel,
  // DendronGraphPanel,
  // DendronSchemaGraphPanel,
  // DendronSideGraphPanel,
  // SeedBrowser,
  // DendronConfigure,
};

const VALID_NAMES = Object.keys(COMPONENT_REGISTRY);

const elem = window.document.getElementById("root")!;
const VIEW_NAME = elem.getAttribute("data-name")! || "DendronCalendarPanel";

if (VALID_NAMES.includes(VIEW_NAME)) {
  console.log("NAME VALID: ", VIEW_NAME);

  // Get the component directly from our registry
  // @ts-expect-error error
  const View = COMPONENT_REGISTRY[VIEW_NAME];

  // Configure props
  let props = {
    padding: "inherit",
  };
  if (VIEW_NAME === "DendronNotePreview") {
    props = { padding: "33px" };
  }

  // Render the component
  renderOnDOM(View, props);
} else {
  console.log(
    `${VIEW_NAME} is an invalid or empty name. please use one of the following: ${VALID_NAMES.join(
      " "
    )}`
  );
}

// avoid --isolatedModules error
export {};
