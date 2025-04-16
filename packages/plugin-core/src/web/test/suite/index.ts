// imports mocha for the browser, defining the `mocha` global.
// TODO: Please fix and remove the suppression
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("mocha/mocha");

export function run(): Promise<void> {
  return new Promise((c, e) => {
    mocha.setup({
      ui: "tdd",
      reporter: undefined,
    });

    // bundles all files in the current directory matching `*.test`
    // @ts-expect-error TODO: fix this supression
    const importAll = (r: __WebpackModuleApi.RequireContext) =>
      r.keys().forEach(r);

    // @ts-expect-error TODO: fix this supression
    importAll(require.context(".", true, /\.test$/));

    try {
      // Run the mocha test
      mocha.run((failures) => {
        if (failures > 0) {
          e(new Error(`${failures} tests failed.`));
        } else {
          c();
        }
      });
    } catch (err) {
      console.error(err);
      e(err);
    }
  });
}
