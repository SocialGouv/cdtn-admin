import { HIGHLIGHT_ERROR_MESSAGE } from "@shared/utils";

import { getHighlightError } from "../highlightGuard";

const withMark = "<p><mark>à relire</mark></p>";

describe("getHighlightError", () => {
  it.each(["REDACTED", "VALIDATING", "VALIDATED", "TO_PUBLISH"] as const)(
    "refuse une réponse « Afficher la réponse » surlignée au statut %s",
    (status) => {
      expect(getHighlightError(status, "ANSWER", withMark)).toBe(
        HIGHLIGHT_ERROR_MESSAGE
      );
    }
  );

  it.each(["TODO", "REDACTING"] as const)(
    "autorise le surlignage tant que la réponse est en rédaction (%s)",
    (status) => {
      expect(getHighlightError(status, "ANSWER", withMark)).toBeUndefined();
    }
  );

  it.each([
    "CDT",
    "NOTHING",
    "UNFAVOURABLE",
    "UNKNOWN",
    "SP",
    "GENERIC_NO_CDT",
  ])(
    "ne contrôle pas le surlignage pour le type %s : son contenu n'est jamais publié",
    (type) => {
      expect(getHighlightError("REDACTED", type, withMark)).toBeUndefined();
    }
  );

  it("accepte une réponse sans surlignage", () => {
    expect(
      getHighlightError("REDACTED", "ANSWER", "<p>propre</p>")
    ).toBeUndefined();
    expect(getHighlightError("REDACTED", "ANSWER", null)).toBeUndefined();
  });
});
