import { fr } from "@codegouvfr/react-dsfr";

export const statusesMapping = {
  TODO: {
    color: fr.colors.decisions.text.default.error.default,
    text: "À traiter",
  },

  REDACTING: {
    color: fr.colors.decisions.text.actionHigh.blueCumulus.default,
    text: "En rédaction",
  },
  REDACTED: {
    color: fr.colors.decisions.text.default.info.default,
    text: "À validé",
  },
  VALIDATING: {
    color: fr.colors.decisions.text.default.warning.default,

    text: "En validation",
  },
  VALIDATED: {
    color: fr.colors.decisions.text.label.greenBourgeon.default,
    text: "Validé",
  },

  PUBLISHED: {
    color: fr.colors.decisions.text.default.success.default,
    text: "Publié",
  },
};
