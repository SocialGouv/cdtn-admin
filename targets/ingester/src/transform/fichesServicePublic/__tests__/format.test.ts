import { describe, expect, test } from "@jest/globals";
import { ShortAgreement } from "../fetchAgreementsWithKaliId";
import { format } from "../format";
import fiche from "./data/ficheSP-mock.json";
import ficheWithRef from "./data/fiche-SP-with-external-ref.json";
import expected from "./data/formatted-raw-ficheSP.json";
import { referenceResolverMock } from "./parseReferences.test";

const agreements: ShortAgreement[] = [
  {
    id: "0123",
    kaliId: "KALICONT123",
    shortName: "convention 123",
  },
];

describe("format", () => {
  test("renvoi une fiche SP au bon format", () => {
    const formatted = format(fiche as any, referenceResolverMock, agreements);
    expect(formatted.date).toEqual("01/11/2024");
    expect(formatted.description).toEqual(
      "Le contrat d'apprentissage est un contrat de travail conclu entre un employeur et un salarié lui permettant de suivre une formation en alternance.",
    );
    expect(formatted.id).toEqual("F2918");
    expect(formatted.referencedTexts.length).toEqual(4);
    expect(formatted.text).toMatch(
      /Le contrat d'apprentissage est un contrat de travail qui permet de suivre par alternance des périodes de formation/,
    );
    expect(formatted.title).toEqual("Contrat d'apprentissage");
    expect(formatted.url).toEqual(
      "https://www.service-public.fr/particuliers/vosdroits/F2918",
    );

    const raw = JSON.parse(formatted.raw);
    expect(raw).toEqual(expected);
  });

  test("format bien toutes les references", () => {
    const formatted = format(
      ficheWithRef as any,
      referenceResolverMock,
      agreements,
    );

    expect(formatted.referencedTexts.length).toEqual(5);
    expect(formatted.referencedTexts[0]).toEqual({
      title: "Code de la sécurité sociale : articles L323-1 à L323-7",
      type: "external",
      url: "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006073189/LEGISCTA000006156085/",
    });
  });
});
