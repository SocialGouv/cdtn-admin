import {
  buildMessageLabel,
  decideMessageSave,
  hasMessageContent,
  isMessageChanged,
  isMessageShared,
  messageFormDefaults,
  pickMessageValues,
  toMessageContent,
} from "../messageBlock";

const message = {
  id: "message-1",
  label: "Question 12 (abcd1234)",
  contentAgreement: "<p>traitée</p>",
  contentLegal: "<p>légal</p>",
  contentNotHandled: null,
  questions_aggregate: { aggregate: { count: 1 } },
};

describe("messageBlock", () => {
  it("construit les valeurs de formulaire d'un message (chaînes vides par défaut)", () => {
    expect(messageFormDefaults(message)).toEqual({
      message_content_agreement: "<p>traitée</p>",
      message_content_agreement_without_legal: "",
      message_content_not_handled: "",
      message_content_not_handled_without_legal: "",
      message_content_legal: "<p>légal</p>",
    });
    expect(
      Object.values(messageFormDefaults(undefined)).every((v) => v === "")
    ).toBe(true);
  });

  describe("hasMessageContent", () => {
    it("est faux quand tout est vide, y compris un éditeur vide", () => {
      expect(hasMessageContent(messageFormDefaults(undefined))).toBe(false);
      expect(hasMessageContent({ message_content_legal: "<p></p>" })).toBe(
        false
      );
      expect(
        hasMessageContent({ message_content_legal: "<p>&nbsp; </p>" })
      ).toBe(false);
    });
    it("est vrai dès qu'un cas est renseigné", () => {
      expect(
        hasMessageContent({ message_content_not_handled: "<p>rien</p>" })
      ).toBe(true);
    });
  });

  describe("toMessageContent", () => {
    it("enregistre null pour les cas vides, sauf le cas obligatoire en base", () => {
      expect(
        toMessageContent({ message_content_not_handled: "<p>rien</p>" })
      ).toEqual({
        contentAgreement: "",
        contentAgreementWithoutLegal: null,
        contentNotHandled: "<p>rien</p>",
        contentNotHandledWithoutLegal: null,
        contentLegal: null,
      });
    });
    it("conserve les contenus saisis", () => {
      const values = pickMessageValues({
        message_content_agreement: "<p>a</p>",
        message_content_legal: "<p>l</p>",
      });
      expect(toMessageContent(values)).toMatchObject({
        contentAgreement: "<p>a</p>",
        contentLegal: "<p>l</p>",
      });
    });
  });

  it("construit un libellé par contribution", () => {
    expect(buildMessageLabel(12, "abcd1234")).toBe("Question 12 (abcd1234)");
  });

  it("détecte un changement de contenu", () => {
    const same = messageFormDefaults(message);
    expect(isMessageChanged(same, message)).toBe(false);
    expect(
      isMessageChanged(
        { ...same, message_content_legal: "<p>autre</p>" },
        message
      )
    ).toBe(true);
  });

  it("détecte un message partagé entre plusieurs questions", () => {
    expect(isMessageShared(message)).toBe(false);
    expect(
      isMessageShared({
        ...message,
        questions_aggregate: { aggregate: { count: 33 } },
      })
    ).toBe(true);
    expect(isMessageShared(undefined)).toBe(false);
  });

  describe("decideMessageSave", () => {
    const values = messageFormDefaults(message);

    it("ne fait rien sans modification", () => {
      expect(decideMessageSave(values, message)).toEqual({
        type: "none",
        messageId: "message-1",
      });
    });

    it("met à jour la ligne propre à la question", () => {
      expect(
        decideMessageSave(
          { ...values, message_content_legal: "<p>modifié</p>" },
          message
        )
      ).toEqual({ type: "update", messageId: "message-1" });
    });

    it("crée une nouvelle ligne quand le message est partagé (les autres questions restent intactes)", () => {
      const shared = {
        ...message,
        questions_aggregate: { aggregate: { count: 33 } },
      };
      expect(
        decideMessageSave(
          { ...values, message_content_legal: "<p>modifié</p>" },
          shared
        )
      ).toEqual({ type: "create" });
    });

    it("ne crée rien pour un message partagé laissé tel quel", () => {
      const shared = {
        ...message,
        questions_aggregate: { aggregate: { count: 33 } },
      };
      expect(decideMessageSave(values, shared)).toEqual({
        type: "none",
        messageId: "message-1",
      });
    });

    it("crée une ligne pour une question qui n'avait pas de message", () => {
      expect(
        decideMessageSave(
          { ...values, message_content_legal: "<p>x</p>" },
          null
        )
      ).toEqual({ type: "create" });
    });

    it("détache le message quand tout est vidé, et ne fait rien sans message", () => {
      const empty = messageFormDefaults(undefined);
      expect(decideMessageSave(empty, message)).toEqual({
        type: "detach",
        messageId: null,
      });
      expect(decideMessageSave(empty, null)).toEqual({
        type: "none",
        messageId: null,
      });
    });
  });
});
