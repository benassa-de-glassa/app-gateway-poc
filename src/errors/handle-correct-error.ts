export function handleCorrectError<T extends Error>(error: Error, toHandle: any): asserts error is T {
  if (error.constructor !== toHandle) {
    throw error;
  }
}
