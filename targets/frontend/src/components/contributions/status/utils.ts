import { Answer, Status } from "../type";

export const initStatus = (answer: Answer) => {
  return answer.statuses?.[0] || { status: "TODO" };
};

export const getNextStatus = (status: Status): Status => {
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

export const getPrimaryButtonLabel = (status: Status): string => {
  switch (status) {
    case "REDACTED":
      return "Commencer Validation";
    case "VALIDATING":
      return "Valider";
    case "VALIDATED":
      return "Publier";
    case "PUBLISHED":
      return "Publiée";
    case "TODO":
    case "REDACTING":
    default:
      return "Soumettre";
  }
};
