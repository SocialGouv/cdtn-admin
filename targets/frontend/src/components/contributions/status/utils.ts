import { Status } from "../type";

export const initStatus = (answer: any) => {
  return answer.statuses?.[0] || { status: "TODO" };
};

export const getNextStatus = (status: Status): Status => {
  switch (status) {
    case Status.REDACTED:
      return Status.VALIDATING;
    case Status.VALIDATING:
      return Status.VALIDATED;
    case Status.VALIDATED:
      return Status.PUBLISHED;
    case Status.TODO:
    case Status.REDACTING:
    default:
      return Status.REDACTED;
  }
};

export const getPrimaryButtonLabel = (status: Status): string => {
  switch (status) {
    case Status.REDACTED:
      return "Commencer Validation";
    case Status.VALIDATING:
      return "Valider";
    case Status.VALIDATED:
      return "Publier";
    case Status.PUBLISHED:
      return "Publiée";
    case Status.TODO:
    case Status.REDACTING:
    default:
      return "Soumettre";
  }
};
