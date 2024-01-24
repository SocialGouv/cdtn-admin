import { describe, expect, it } from "@jest/globals";
import { getChanges } from "../index";

import oldFirstJuly from "./dataset/oldFirstJuly.json";
import newFirstJulyWithTechnicalChanges from "./dataset/newFirstJulyWithTechnicalChanges.json";
import newFirstAugustWithMajorChanges from "./dataset/newFirstAugustWithMajorChanges.json";

describe("getChanges", () => {
  describe("la date de modification ne change pas (le contenu est identique)", () => {
    it("ne doit pas détecté de changement", () => {
      expect(getChanges([oldFirstJuly], [oldFirstJuly])).toEqual({
        added: [],
        removed: [],
        modified: [],
        documents: [],
      });
    });
  });

  describe("la date de modification ne change pas mais le contenu change. Modification technique ou mineur (typo)", () => {
    it("ne doit pas détecté de changement", () => {
      expect(
        getChanges([oldFirstJuly], [newFirstJulyWithTechnicalChanges])
      ).toEqual({
        added: [],
        removed: [],
        modified: [],
        documents: [],
      });
    });
  });

  describe("la date de modification change", () => {
    it("on doit détecter les changements", () => {
      expect(
        getChanges([oldFirstJuly], [newFirstAugustWithMajorChanges])
      ).toEqual({
        added: [],
        documents: [],
        modified: [
          {
            addedSections: [],
            modifiedSections: [
              {
                currentText:
                  "La période d’essai et la possibilité de la renouveler ne se présument pas. La possibilité de renouveler la période d’essai doit également être stipulée dans l’un ou l’autre de ces documents.",
                previousText:
                  "La période d’essai et la possibilité de la renouveler ne se présument pas. Pour qu’il y ait une période d’essai, celle-ci doit être expressément stipulée dans la lettre d’engagement ou le contrat de travail. La possibilité de renouveler la période d’essai doit également être stipulée dans l’un ou l’autre de ces documents.",
                title:
                  "Quelles sont les conditions pour qu’il existe une période d’essai ?",
              },
            ],
            pubId: "article100977",
            removedSections: [],
            title: "La période d’essai",
            url: "https://travail-emploi.gouv.fr/droit-du-travail/la-vie-du-contrat-de-travail/article/la-periode-d-essai",
          },
        ],
        removed: [],
      });
    });
  });
});
