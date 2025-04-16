import { dump, JSON_SCHEMA, load, YAMLException } from "js-yaml";
import { fromThrowable, Result } from "neverthrow";
import { DendronError } from "./error";
import { AnyJson } from "./types/typesv2";
import { ERROR_SEVERITY } from "./constants";

const loadYAMLConfig = fromThrowable(load, (error) => {
  return new DendronError({
    message:
      error instanceof YAMLException
        ? `${error.name}: ${error.message}`
        : `YAMLException`,
    severity: ERROR_SEVERITY.FATAL,
    ...(error instanceof Error && { innerError: error }),
  });
});

const yamlDumpHandler = fromThrowable(dump, (error) => {
  return new DendronError({
    message:
      error instanceof YAMLException
        ? `${error.name}: ${error.message}`
        : `YAMLException`,
    severity: ERROR_SEVERITY.FATAL,
    ...(error instanceof Error && { innerError: error }),
  });
});

export const fromStr = (str: string, overwriteDuplicate?: boolean) => {
  return loadYAMLConfig(str, {
    schema: JSON_SCHEMA,
    json: overwriteDuplicate ?? false,
  }) as Result<AnyJson, DendronError>;
};

export const toStr = (data: any) => {
  return yamlDumpHandler(data, { indent: 4, schema: JSON_SCHEMA });
};
