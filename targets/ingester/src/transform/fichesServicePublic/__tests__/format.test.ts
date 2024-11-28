import { describe, expect, test } from "@jest/globals";
import { ShortAgreement } from "../fetchAgreementsWithKaliId";
import { format } from "../format";
import fiche from "./ficheSP-mock.json";
import expected from "./formatted-raw-ficheSP.json";
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
});
