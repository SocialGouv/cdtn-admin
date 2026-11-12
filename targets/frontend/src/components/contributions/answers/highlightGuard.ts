import { HIGHLIGHT_ERROR_MESSAGE, hasHighlight } from "@shared/utils";

import { Status } from "../type";

/** Statuts à partir de « À valider » : le surlignage n'y est plus autorisé (cf. triggers Postgres). */
const STATUSES_WITHOUT_HIGHLIGHT: Status[] = [
  "REDACTED",
  "VALIDATING",
  "VALIDATED",
  "TO_PUBLISH",
  "PUBLISHING",
  "PUBLISHED",
];

/**
 * Le surlignage n'est contrôlé que pour le type « Afficher la réponse » (ANSWER) :
 * c'est le seul dont le contenu est publié. Pour les autres types, `content` n'est qu'un reste
 * d'un ancien type (ex. : template surligné) qui ne sera jamais publié.
 *
 * Le serveur applique la même règle ; ce contrôle donne le message explicite à l'utilisateur,
 * car en production Hasura ne remonte pas le détail de l'erreur Postgres
 * (« database query error »).
 */
export const getHighlightError = (
  status: Status,
  contentType: string | null | undefined,
  content: string | null | undefined
): string | undefined =>
  STATUSES_WITHOUT_HIGHLIGHT.includes(status) &&
  contentType === "ANSWER" &&
  hasHighlight(content)
    ? HIGHLIGHT_ERROR_MESSAGE
    : undefined;
