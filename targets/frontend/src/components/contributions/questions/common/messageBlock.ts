/**
 * Messages associés à une question (bloc de message affiché sur les pages de la contribution).
 *
 * Chaque contribution porte ses propres messages : une ligne `contribution.question_messages`
 * est créée pour chaque nouvelle contribution (la structure en base est inchangée).
 */

export type QuestionMessage = {
  id: string;
  label: string;
  contentAgreement?: string | null;
  contentAgreementWithoutLegal?: string | null;
  contentLegal?: string | null;
  contentNotHandled?: string | null;
  contentNotHandledWithoutLegal?: string | null;
  /** Nombre de questions qui utilisent cette ligne (les anciennes lignes sont partagées) */
  questions_aggregate?: { aggregate: { count: number } | null };
};

type ContentKey =
  | "contentAgreement"
  | "contentAgreementWithoutLegal"
  | "contentLegal"
  | "contentNotHandled"
  | "contentNotHandledWithoutLegal";

export const MESSAGE_FIELDS = [
  {
    formKey: "message_content_agreement",
    dbKey: "contentAgreement",
    label: "Texte applicable si la convention collective est traitée",
    help: "Affiché en bas de la page dans un bloc d'info. Affiché quand la réponse de la convention collective est affichée.",
  },
  {
    // Masqué à la création tant que le cas « pas de Code du travail » n'est pas géré à la création
    formKey: "message_content_agreement_without_legal",
    dbKey: "contentAgreementWithoutLegal",
    label:
      "Texte applicable si la convention collective est traitée et que le Code du travail ne prévoit rien",
    help: "Même cas que « la convention collective est traitée », quand la réponse générique indique que le Code du travail ne prévoit rien.",
    hiddenOnCreation: true,
  },
  {
    formKey: "message_content_not_handled",
    dbKey: "contentNotHandled",
    label:
      "Texte applicable si la convention collective ne prévoit rien ou renvoie au Code du travail",
    help: "Affiché en bas de la page dans un bloc d'info. Affiché aussi quand la convention collective est intégralement moins favorable que le Code du travail.",
  },
  {
    // Masqué à la création, pour la même raison que le cas « traitée » sans Code du travail
    formKey: "message_content_not_handled_without_legal",
    dbKey: "contentNotHandledWithoutLegal",
    label:
      "Texte applicable si la convention collective ne prévoit rien et que le Code du travail ne prévoit rien",
    help: "Même cas que « la convention collective ne prévoit rien », quand la réponse générique indique que le Code du travail ne prévoit rien.",
    hiddenOnCreation: true,
  },
  {
    formKey: "message_content_legal",
    dbKey: "contentLegal",
    label: "Texte applicable pour le code du travail",
    help: "Affiché en bas de la page dans un bloc d'info. Affiché aussi quand la convention collective n'est pas sélectionnée ou que sa réponse est dépubliée.",
  },
] as const satisfies readonly {
  formKey: string;
  dbKey: ContentKey;
  label: string;
  help: string;
  hiddenOnCreation?: boolean;
}[];

export type MessageFormKey = (typeof MESSAGE_FIELDS)[number]["formKey"];
export type MessageFormValues = Record<MessageFormKey, string>;

type ContentValues = Partial<Record<MessageFormKey, string | null | undefined>>;

/** Valeurs initiales des champs d'après un message existant (vides sans message). */
export const messageFormDefaults = (
  message?: Partial<QuestionMessage> | null
): MessageFormValues =>
  MESSAGE_FIELDS.reduce((acc, field) => {
    acc[field.formKey] = message?.[field.dbKey] ?? "";
    return acc;
  }, {} as MessageFormValues);

export const pickMessageValues = (values: ContentValues): MessageFormValues =>
  MESSAGE_FIELDS.reduce((acc, field) => {
    acc[field.formKey] = values[field.formKey] ?? "";
    return acc;
  }, {} as MessageFormValues);

const isBlank = (html: string | null | undefined): boolean =>
  !html || html.replace(/<[^>]*>|&nbsp;|\s/g, "") === "";

/** Aucun message renseigné : la question n'a pas de bloc de message. */
export const hasMessageContent = (values: ContentValues): boolean =>
  MESSAGE_FIELDS.some((field) => !isBlank(values[field.formKey]));

export type MessageContentInput = Record<ContentKey, string | null>;
type ContentInput = MessageContentInput;

/**
 * Colonnes de contenu. `content_agreement` est obligatoire en base : chaîne vide si non renseigné.
 * Les autres cas non renseignés sont enregistrés à `null` (repli géré à l'export).
 */
export const toMessageContent = (values: ContentValues): ContentInput =>
  MESSAGE_FIELDS.reduce((acc, field) => {
    const value = values[field.formKey];
    acc[field.dbKey] =
      isBlank(value) && field.dbKey !== "contentAgreement"
        ? null
        : (value ?? "");
    return acc;
  }, {} as ContentInput);

/** Suffixe aléatoire court pour rendre le libellé d'une ligne de message unique. */
export const shortId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

/** Libellé unique d'une ligne de message (le libellé est unique en base). */
export const buildMessageLabel = (order: number, suffix: string): string =>
  `Question ${order} (${suffix})`;

/** Les contenus saisis diffèrent-ils de ceux du message existant ? */
export const isMessageChanged = (
  values: ContentValues,
  message?: Partial<QuestionMessage> | null
): boolean => {
  const current = messageFormDefaults(message);
  return MESSAGE_FIELDS.some(
    (field) => (values[field.formKey] ?? "") !== current[field.formKey]
  );
};

/** Plusieurs questions utilisent la même ligne (héritage de la liste de choix). */
export const isMessageShared = (
  message?: Partial<QuestionMessage> | null
): boolean => (message?.questions_aggregate?.aggregate?.count ?? 0) > 1;

export type MessageSaveAction =
  | { type: "none"; messageId: string | null }
  | { type: "detach"; messageId: null }
  | { type: "create" }
  | { type: "update"; messageId: string };

/**
 * Que faire des messages à l'enregistrement d'une question existante ?
 * - aucun contenu : la question n'a plus de bloc de message ;
 * - pas de message ou message partagé avec d'autres questions : création d'une ligne propre
 *   (une modification ne doit pas changer les autres contributions) ;
 * - sinon : mise à jour de la ligne de la question.
 */
export const decideMessageSave = (
  values: ContentValues,
  message?: Partial<QuestionMessage> | null
): MessageSaveAction => {
  if (!hasMessageContent(values)) {
    return message?.id
      ? { type: "detach", messageId: null }
      : { type: "none", messageId: null };
  }
  if (!message?.id) {
    return { type: "create" };
  }
  if (!isMessageChanged(values, message)) {
    return { type: "none", messageId: message.id };
  }
  return isMessageShared(message)
    ? { type: "create" }
    : { type: "update", messageId: message.id };
};
