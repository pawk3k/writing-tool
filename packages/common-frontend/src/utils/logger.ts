import Amplify, { Logger } from "@aws-amplify/core";

export enum LOG_LEVEL {
  INFO = "INFO",
  }

export function createLogger(name: string) {
  return new Logger(name);
}

export function setLogLevel(lvl: LOG_LEVEL) {
  Amplify.Logger.LOG_LEVEL = lvl;
}
