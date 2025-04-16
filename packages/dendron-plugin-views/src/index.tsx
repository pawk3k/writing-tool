 

import { renderOnDOM } from "./bootstrap";

// Import all components directly to ensure they're included in the bundle
// import DendronNotePreview from "./components/DendronNotePreview";
// import DendronLookupPanel from "./components/DendronLookupPanel";
import DendronCalendarPanel from "./components/DendronCalendarPanel";
import DendronNotePreview from "./components/DendronNotePreview";

// Component registry that maps names to actual components
const COMPONENT_REGISTRY = {
  DendronNotePreview,
  // SampleComponent,
  // DendronLookupPanel,
  DendronCalendarPanel,
  // DendronGraphPanel,
  // DendronSchemaGraphPanel,
  // DendronSideGraphPanel,
  // SeedBrowser,
  // DendronConfigure,
};

const VALID_NAMES = Object.keys(COMPONENT_REGISTRY);

// Function to get component name from URL hash or data attribute
function getComponentName() {
  // @ts-expect-error TS2304 - Cannot find name 'window'.
  const elem = window.document.getElementById("root")!;
  // @ts-expect-error TS2304 - Cannot find name 'window'.
  const hashRoute = window.location.hash.slice(1); // Remove the # character

  // Check if we have a valid hash route
  if (hashRoute && VALID_NAMES.includes(hashRoute)) {
    return hashRoute;
  }

  // Fall back to data attribute
  return elem.getAttribute("data-name")! || "DendronCalendarPanel";
}

// Initial render
function renderComponent() {
  const VIEW_NAME = getComponentName();

  if (VALID_NAMES.includes(VIEW_NAME)) {
    console.log("NAME VALID: ", VIEW_NAME);

    // Get the component directly from our registry
    const View =
      COMPONENT_REGISTRY[VIEW_NAME as keyof typeof COMPONENT_REGISTRY];

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
}

// Listen for hash changes to support navigation
// @ts-expect-error TS2304 - Cannot find name 'window'.
window.addEventListener("hashchange", renderComponent);

// Initial render
renderComponent();

// avoid --isolatedModules error
export {};
