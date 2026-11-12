/**
 * Couleurs DSFR (variables CSS) utilisées par les contenus de contribution.
 * Ce sont des variables et non des valeurs figées : elles s'inversent
 * automatiquement entre le thème clair et le thème sombre (`data-fr-theme`),
 * ce qui garde le texte lisible sur les fonds colorés.
 */
export const CONTRIBUTION_COLORS = {
  /** Fond du surlignage (jaune clair en thème clair, jaune sombre en thème sombre) */
  highlightBackground: "var(--background-contrast-yellow-tournesol)",
  /** Fond d'une ligne d'avertissement (CC à renseigner) */
  warningBackground: "var(--background-contrast-warning)",
  /** Texte posé sur un fond de contraste */
  text: "var(--text-default-grey)",
  textMention: "var(--text-mention-grey)",
  textWarning: "var(--text-default-warning)",
  textSuccess: "var(--text-default-success)",
  border: "var(--border-default-grey)",
  /** Pastille de variable */
  variableBackground: "var(--background-contrast-blue-france)",
  variableText: "var(--text-action-high-blue-france)",
  variableBorder: "var(--border-default-blue-france)",
} as const;
