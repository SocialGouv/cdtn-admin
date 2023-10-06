const getElementsByPath = (obj: any, path: string[]): string[] => {
  const clonedKeys = [...path];
  const key = clonedKeys.shift();
  if (!key) return [];
  const objToParse = obj[key];
  if (!clonedKeys.length && objToParse && typeof objToParse !== "object") {
    return [objToParse];
  } else if (Array.isArray(objToParse)) {
    return objToParse.reduce((arr, item) => {
      return arr.concat(getElementsByPath(item, clonedKeys));
    }, []);
  } else if (typeof objToParse === "object") {
    return getElementsByPath(objToParse, clonedKeys);
  }
  return [];
};

export const getElementsToDelete = (
  oldObj: any,
  newObj: any,
  keys: string[]
) => {
  const oldIds = getElementsByPath(oldObj, keys);
  const newIds = getElementsByPath(newObj, keys);
  return oldIds.filter((el) => newIds.indexOf(el) === -1);
};
