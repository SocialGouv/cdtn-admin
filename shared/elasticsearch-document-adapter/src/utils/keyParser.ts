export const keyFunctionParser = (
  keyToModify: string,
  object: Record<string, any> | null,
  fn: (value: string) => string
): Record<string, any> | null => {
  if (!object) {
    return object;
  }
  Object.keys(object).forEach(function (key) {
    if (key === keyToModify) {
      object[key] = fn(object[key]);
    } else if (typeof object[key] === "object") {
      keyFunctionParser(keyToModify, object[key], fn);
    }
  });
  return object;
};
