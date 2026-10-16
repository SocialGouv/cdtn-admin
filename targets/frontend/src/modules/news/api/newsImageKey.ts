import slugify from "@socialgouv/cdtn-slugify";

export const buildNewsImageBaseName = (title: string): string =>
  slugify(title) || "actualite";

export const findAvailableNewsImageKey = async (
  baseName: string,
  extension: string,
  exists: (key: string) => Promise<boolean>
): Promise<string> => {
  let key = `${baseName}.${extension}`;
  for (let suffix = 2; await exists(key); suffix++) {
    key = `${baseName}-${suffix}.${extension}`;
  }
  return key;
};
