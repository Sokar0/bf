/* eslint-disable no-promise-executor-return */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
