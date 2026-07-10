import { describe, expect, test } from "@jest/globals";
import fs from "fs";
import path from "path";

import { parseAccordXml } from "../parseAccordXml";

const fixture = (name: string): string =>
  fs.readFileSync(path.join(__dirname, "fixtures", name), "utf-8");

// Construit un XML d'accord minimal à partir d'un bloc META_ACCO.
const accordXml = (
  metaAcco: string,
  id = "ACCOTEXT000000000001"
): string => `<?xml version="1.0" encoding="UTF-8"?>
<TEXTE_ACCO>
<META>
<META_COMMUN>
<ID>${id}</ID>
<NATURE>ACCORD</NATURE>
</META_COMMUN>
<META_SPEC>
<META_ACCO>
${metaAcco}
</META_ACCO>
</META_SPEC>
</META>
</TEXTE_ACCO>`;

describe("parseAccordXml — fixtures réelles", () => {
  test("extrait tous les champs d'un accord (1 thème)", () => {
    const accord = parseAccordXml(fixture("accord-1-theme.xml"));
    expect(accord).toEqual({
      id: "ACCOTEXT000053935667",
      title:
        'ACCORD COLLECTIF FORMALISANT LE REGIME DE REMBOURSEMENT DES FRAIS DE SANTE AINSI QUE LE REGIME DE PREVOYANCE LOURDE "INCAPACITE - INVALIDITE - DECES" DE LA SOCIETE CLAYENS GENAS',
      siret: "32509072800057",
      dateMaj: "2026-04-21",
      dateDepot: "2026-03-26",
      dateEffet: "2026-04-01",
      dateFin: "2999-01-01",
      dateDiffusion: "2026-04-24",
      conformeVersionIntegrale: true,
      themes: ["Prévoyance collective, autre que santé maladie"],
      signataires: ["92"],
    });
  });

  test("extrait la liste des thèmes multiples", () => {
    const accord = parseAccordXml(fixture("accord-4-themes.xml"));
    expect(accord.themes).toEqual([
      "Durée collective du temps de travail",
      "Heures supplémentaires (contingent, majoration)",
      "Fixation des congés (jours fériés, ponts, RTT)",
      "Aménagement du temps de travail (modulation, annualisation, cycles)",
    ]);
  });
});

describe("parseAccordXml — cardinalité thèmes / signataires", () => {
  test("normalise un thème unique en tableau", () => {
    const accord = parseAccordXml(
      accordXml(
        `<THEMES><THEME><CODE>1</CODE><LIBELLE>Salaires</LIBELLE></THEME></THEMES>`
      )
    );
    expect(accord.themes).toEqual(["Salaires"]);
  });

  test("extrait plusieurs signataires", () => {
    const accord = parseAccordXml(
      accordXml(
        `<SIGNATAIRES><SIGNATAIRE>92</SIGNATAIRE><SIGNATAIRE>94</SIGNATAIRE></SIGNATAIRES>`
      )
    );
    expect(accord.signataires).toEqual(["92", "94"]);
  });

  test("retourne des tableaux vides pour THEMES/SIGNATAIRES auto-fermants", () => {
    const accord = parseAccordXml(accordXml(`<THEMES/><SIGNATAIRES/>`));
    expect(accord.themes).toEqual([]);
    expect(accord.signataires).toEqual([]);
  });

  test("retourne des tableaux vides pour THEMES/SIGNATAIRES absents", () => {
    const accord = parseAccordXml(accordXml(`<TITRE_TXT>Accord</TITRE_TXT>`));
    expect(accord.themes).toEqual([]);
    expect(accord.signataires).toEqual([]);
  });
});

describe("parseAccordXml — champs optionnels", () => {
  test("SIRET absent ou vide devient null", () => {
    expect(parseAccordXml(accordXml(`<SIRET/>`)).siret).toBeNull();
    expect(
      parseAccordXml(accordXml(`<TITRE_TXT>x</TITRE_TXT>`)).siret
    ).toBeNull();
  });

  test("dates absentes deviennent null", () => {
    const accord = parseAccordXml(accordXml(`<TITRE_TXT>x</TITRE_TXT>`));
    expect(accord.dateMaj).toBeNull();
    expect(accord.dateFin).toBeNull();
  });

  test("CONFORME_VERSION_INTEGRALE=false donne false", () => {
    const accord = parseAccordXml(
      accordXml(
        `<CONFORME_VERSION_INTEGRALE>false</CONFORME_VERSION_INTEGRALE>`
      )
    );
    expect(accord.conformeVersionIntegrale).toBe(false);
  });

  test("CONFORME_VERSION_INTEGRALE absent donne false", () => {
    const accord = parseAccordXml(accordXml(`<TITRE_TXT>x</TITRE_TXT>`));
    expect(accord.conformeVersionIntegrale).toBe(false);
  });

  test("conserve un SIRET numérique comme chaîne (pas de conversion)", () => {
    const accord = parseAccordXml(accordXml(`<SIRET>00509072800057</SIRET>`));
    expect(accord.siret).toBe("00509072800057");
  });
});

describe("parseAccordXml — robustesse", () => {
  test("lève une erreur si META_ACCO est absent", () => {
    const xml = `<?xml version="1.0"?><TEXTE_ACCO><META><META_COMMUN><ID>ACCOTEXT1</ID></META_COMMUN></META></TEXTE_ACCO>`;
    expect(() => parseAccordXml(xml)).toThrow(/invalide/i);
  });

  test("lève une erreur si l'ID est absent", () => {
    const xml = `<?xml version="1.0"?><TEXTE_ACCO><META><META_COMMUN/><META_SPEC><META_ACCO><TITRE_TXT>x</TITRE_TXT></META_ACCO></META_SPEC></META></TEXTE_ACCO>`;
    expect(() => parseAccordXml(xml)).toThrow(/invalide/i);
  });
});
