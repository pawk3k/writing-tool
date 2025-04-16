import "reflect-metadata";
import { CONSTANTS, DendronConfig } from "@dendronhq/common-all";
import YAML from "js-yaml";
import * as vscode from "vscode";
import { Uri } from "vscode";

export async function getWorkspaceConfig(wsRoot: Uri) {
  const configPath = Uri.joinPath(wsRoot, CONSTANTS.DENDRON_CONFIG_FILE);
  const config = (await readYAML(configPath, true)) as DendronConfig;
  return config;
}

async function readYAML(path: Uri, overwriteDuplicate?: boolean): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore TODO: fix this supression cause we might have web problem
  const textDecoder = new TextDecoder(); // This line of code is browser specific. For Node, we need to use the utils version of TextDecoder
  const file = await vscode.workspace.fs.readFile(path);
  const bar = textDecoder.decode(file);
  return YAML.load(bar, {
    schema: YAML.JSON_SCHEMA,
    json: overwriteDuplicate ?? false,
  });
}
