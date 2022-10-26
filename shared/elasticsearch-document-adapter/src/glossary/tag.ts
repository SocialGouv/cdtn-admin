/**
 * Supprime le tag de la chaîne de caractère
 * @param content est le tag html (eg: <div>test</div>)
 * @returns le contenu du tag (eg: test)
 */
export const removeTags = (content: string): string => {
  if (!content) return "";
  return content.replace(/<[^>]*>/g, "");
};

/**
 * Récupère la propriété d'un tag key=value
 * @param property est la propriété du tag (eg: <div propertyA='salut'>test</div>)
 * @returns la valeur de la propriété (eg: [propertyA='salut'])
 */
export const getAllTagsProperties = (tag: string): string[] => {
  if (!tag) return [];
  const regex = /(\w+)=['"]([^'"]*)['"]/g;
  const properties = [];
  let match = null;
  while ((match = regex.exec(tag)) !== null) {
    properties.push(match[0]);
  }
  return properties;
};

/**
 * Récupère la valeur d'une propriété d'un tag key=value
 * @param property est la propriété du tag (eg: "propertyA='salut'")
 * @returns la valeur de la propriété (eg: 'salut')
 */
export const getValueFromProperty = (property: string): string => {
  const regex = /(?<==')[^']*(?=')/g;
  const value = property.match(regex);
  return value?.[0] ?? "";
};

/**
 * Récupère la clé d'une propriété d'un tag key=value
 * @param property est la propriété du tag (eg: "propertyA='salut'")
 * @returns la clé de la propriété (eg: 'propertyA')
 */
export const getKeyFromProperty = (property: string): string => {
  const splitArr = property.split("=");
  if (splitArr.length === 2) {
    return splitArr[0];
  }
  return "";
};

/**
 * Supprime l'html présent dans les tags
 * @param tag est le tag html (eg: <div property='<div>yo</div>'>test</div>)
 * @returns le contenu du tag (eg: <div property='yo>test</div>)
 */
export const cleanTagHtmlProperty = (tag: string): string => {
  const properties = getAllTagsProperties(tag);
  for (const property of properties) {
    const key = getKeyFromProperty(property);
    const value = getValueFromProperty(property);
    const cleanValue = removeTags(value);
    tag = tag.replace(property, `${key}='${cleanValue}'`);
  }
  return tag;
};
