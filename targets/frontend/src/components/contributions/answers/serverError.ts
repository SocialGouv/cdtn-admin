import { CombinedError } from "urql";

/**
 * Message métier d'une exception Postgres (ex. : trigger de blocage du surlignage).
 * Hasura le fournit dans `extensions.internal.error.message` ; son message
 * principal reste générique (« database query error »).
 */
export const getServerErrorMessage = (error: CombinedError): string => {
  for (const graphQLError of error.graphQLErrors ?? []) {
    const internalMessage = (graphQLError.extensions as any)?.internal?.error
      ?.message;
    if (typeof internalMessage === "string" && internalMessage.length > 0) {
      return internalMessage;
    }
  }
  return error.message;
};
