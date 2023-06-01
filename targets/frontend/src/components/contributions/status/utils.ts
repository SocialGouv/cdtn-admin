import { Status } from "../type";

export const initStatus = (answer: any) => {
  return answer.statuses?.[0] || { status: "TODO" };
};

export const getNextStatus = (status: string): Status => {
  switch (status) {
    case "REDACTED":
      return "VALIDATING";
    case "VALIDATING":
      return "VALIDATED";
    case "VALIDATED":
      return "PUBLISHED";
    case "TODO":
    case "REDACTING":
    default:
      return "REDACTED";
  }
};

export const getPrimaryButtonLabel = (status: string): string => {
  switch (status) {
    case "REDACTED":
      return "Commencer Validation";
    case "VALIDATING":
      return "Valider";
    case "VALIDATED":
      return "Publier";
    case "TODO":
    case "REDACTING":
    default:
      return "Soumettre";
  }
};

export const getSecondaryButtonLabel = (status: string): string => {
  switch (status) {
    case "REDACTED":
      return "Modifier";
    case "VALIDATING":
      return "Refuser";
    case "VALIDATED":
    case "PUBLISHED":
      return "Modifier";
    case "TODO":
    case "REDACTING":
    default:
      return "Sauvegarder";
  }
};
