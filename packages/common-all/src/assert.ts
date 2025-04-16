import _ from "lodash";

export class AssertionError extends Error {}

export function assertExists<T = any>(val: T, msg: string): NonNullable<T> {
  if (_.isNull(val) || _.isUndefined(val)) {
    throw new AssertionError(msg);
  }
  // @ts-expect-error TODO: fix this supression
  return val;
}

export function assert(statement: boolean, msg: string) {
  if (!statement) {
    throw new AssertionError(msg);
  } else {
    return true;
  }
}
