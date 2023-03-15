export function isObject(x: unknown): x is Record<PropertyKey, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

export const npmEndpoint = 'https://registry.npmjs.org/';

export function isDefined<T>(argument: T | undefined): argument is T {
  return typeof argument !== 'undefined';
}
