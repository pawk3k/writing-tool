import _ from "lodash";
import { DENDRON_EMOJIS } from "@dendronhq/common-all";
import ora from "ora";

export class CLIUtils {
  /**
   * Takes an object like
   *     {
   *     		foo: "42",
   *     		bar: 10
   *     }
   * and returns "foo=42,bar=10"
   * @param ent: config object
   * @returns
   */
  static objectConfig2StringConfig = (ent: any): string => {
    return (
      _.map(ent, (v, k) => {
        if (_.isUndefined(v)) {
          return undefined;
        } else {
          return `${k}=${v}`;
        }
      }).filter((ent) => !_.isUndefined(ent)) as string[]
    ).join(",");
  };

  static getClientVersion() {
     
    const pkgJSON = require("@dendronhq/dendron-cli/package.json");
    return pkgJSON.version;
  }
}

export class SpinnerUtils {
  /**
   * Given a Ora spinner, render given text with optional symbol
   * Continue spinning.
   * @param opts
   */
  static renderAndContinue(opts: {
    spinner: typeof ora;
    text?: string;
    symbol?: string;
  }) {
    const { spinner, text, symbol } = opts;
    // @ts-expect-error TS2339 - Property 'stopAndPersist' does not exist on type '{ (options?: string | Options | undefined): Ora; promise(action: PromiseLike<unknown>, options?: string | Options | undefined): Ora; }'.
    spinner.stopAndPersist({
      text: text || undefined,
      symbol: symbol || DENDRON_EMOJIS.SEEDLING,
    });
    // @ts-expect-error TS2339 - Property 'start' does not exist on type '{ (options?: string | Options | undefined): Ora; promise(action: PromiseLike<unknown>, options?: string | Options | undefined): Ora; }'.
    spinner.start();
  }
}
