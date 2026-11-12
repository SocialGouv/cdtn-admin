import { CombinedError } from "urql";

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

// Les formulaires de création génèrent l'id une seule fois à leur ouverture :
// un second insert avec le même id veut dire que le contenu existe déjà.
export const isDuplicateIdError = (
  error: CombinedError | undefined,
  table: string
): boolean =>
  !!error?.graphQLErrors.some(
    (e) =>
      e.extensions?.code === "constraint-violation" &&
      (e.message.includes(`"${table}_pkey"`) ||
        e.message.includes(`"${table}_id_key"`))
  );
