// @ts-expect-error TODO: fix this supression
// NOTE: This file is ONLY used during debugging. In the webpacked production
// build, the file that is used is the version located at
// PROJECT_ROOT/packages/plugin-core/webpack-require-hack.js
const webpackRequire = (importPath) => {
  // First delete the import from the node module cache in case it exists. This
  // allows us to do 'hot-reloading' of the .js files in Traits.
  delete require.cache[require.resolve(importPath)];
  // TODO: Please fix and remove the suppression
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = require(importPath);
  return module;
};
module.exports = webpackRequire;
