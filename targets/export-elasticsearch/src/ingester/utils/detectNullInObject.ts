export function detectNullInObject(obj: any): boolean {
  if (obj === null) {
    return true;
  }

  if (typeof obj === "object") {
    for (const key in obj) {
      if (
        Object.prototype.hasOwnProperty.call(obj, key) &&
        detectNullInObject(obj[key])
      ) {
        return true;
      }
    }
  }

  return false;
}
