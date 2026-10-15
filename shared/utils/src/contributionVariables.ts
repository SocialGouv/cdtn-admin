/**
 * Variables insérables dans les contenus des contributions (introductions,
 * template, réponses). Le contenu stocké porte la **clé** de la variable,
 * jamais sa valeur : la valeur est résolue à l'export, une version par CC.
 *
 * HTML : <span data-variable="agreement_name">Nom de la CC</span>
 */
export const CONTRIBUTION_VARIABLES = [
  { key: "agreement_name", label: "Nom de la CC" },
] as const;

export type ContributionVariableKey =
  (typeof CONTRIBUTION_VARIABLES)[number]["key"];

export type ContributionVariableValues = Partial<
  Record<ContributionVariableKey, string>
>;

export const CONTRIBUTION_VARIABLE_ATTRIBUTE = "data-variable";

const VARIABLE_REGEX =
  /<span\b[^>]*\bdata-variable="([^"]*)"[^>]*>[\s\S]*?<\/span>/g;

export const isContributionVariableKey = (
  key: string
): key is ContributionVariableKey =>
  CONTRIBUTION_VARIABLES.some((variable) => variable.key === key);

export const getContributionVariableLabel = (
  key: ContributionVariableKey
): string =>
  CONTRIBUTION_VARIABLES.find((variable) => variable.key === key)?.label ?? key;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Clés des variables présentes dans un contenu HTML (sans doublon).
 */
export const findContributionVariables = (
  html: string | undefined
): string[] => {
  if (!html) {
    return [];
  }
  const keys = new Set<string>();
  for (const match of html.matchAll(VARIABLE_REGEX)) {
    keys.add(match[1] ?? "");
  }
  return Array.from(keys);
};

/**
 * Remplace chaque variable par sa valeur.
 * Lève une erreur si la variable est inconnue du registre ou sans valeur :
 * on préfère bloquer l'export plutôt que publier un texte incomplet.
 */
export const replaceContributionVariables = (
  html: string,
  values: ContributionVariableValues
): string =>
  html.replace(VARIABLE_REGEX, (_match, key: string) => {
    if (!isContributionVariableKey(key)) {
      throw new Error(`Variable de contribution inconnue : "${key}"`);
    }
    const value = values[key];
    if (value === undefined) {
      throw new Error(
        `Aucune valeur fournie pour la variable de contribution "${key}"`
      );
    }
    return escapeHtml(value);
  });

/**
 * Le surlignage est produit uniquement par la balise <mark> de l'éditeur.
 */
export const hasHighlight = (html: string | null | undefined): boolean =>
  !!html && /<mark[ >]/.test(html);

export const countHighlights = (html: string | null | undefined): number =>
  html ? (html.match(/<mark[ >]/g) ?? []).length : 0;
