export function removeUndefinedKeys<T>(
  object: T extends object ? T : never
): T {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined)
  ) as T;
}
