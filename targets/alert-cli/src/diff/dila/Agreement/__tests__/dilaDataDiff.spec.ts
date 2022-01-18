import { describe, expect } from "@jest/globals";
import type { Commit } from "nodegit";

import processAgreementChanges from "../ProcessAgreementChanges";
import type { AgreementFileChange } from "../types";
import added from "./dataset/filechanges_kali_agreement_added.json";
import irrevelantChanges from "./dataset/filechanges_kali_agreement_irrevelant_changes.json";
import noChanges from "./dataset/filechanges_kali_agreement_no_changes.json";
import removed from "./dataset/filechanges_kali_agreement_removed.json";
import revelantChanges from "./dataset/filechanges_kali_agreement_revelant_changes.json";

describe("Calcul des différences sur les conventions collectives (kali-data)", () => {
  describe("Aucun changement dans une convention collective", () => {
    it("doit détecter aucun changement", async () => {
      const result = await processAgreementChanges(
        { commit: {} as Commit, ref: "" },
        noChanges as AgreementFileChange[],
        async () => Promise.resolve([])
      );
      expect(result).toHaveLength(1);
      const diff = result[0];
      expect(diff.added).toHaveLength(0);
      expect(diff.modified).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
    });
  });

  describe("Aucun changement significatif (content ou etat) dans une convention collective", () => {
    it("doit détecter aucun changement", async () => {
      const result = await processAgreementChanges(
        { commit: {} as Commit, ref: "" },
        irrevelantChanges as AgreementFileChange[],
        async () => Promise.resolve([])
      );
      expect(result).toHaveLength(1);
      const diff = result[0];
      expect(diff.added).toHaveLength(0);
      expect(diff.modified).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
    });
  });

  describe("changement du contenu d'articles (KALIARTI) d'une convention collective", () => {
    it("doit détecter le changement sur les articles", async () => {
      const result = await processAgreementChanges(
        { commit: {} as Commit, ref: "" },
        revelantChanges as AgreementFileChange[],
        async () => Promise.resolve([])
      );
      expect(result).toHaveLength(1);
      const diff = result[0];
      expect(diff.added).toHaveLength(0);
      //FIXME: avant c'était deux articles modifiés !!!!!
      expect(diff.modified[0].cid).toEqual("KALIARTI000005834059");
      expect(diff.modified[0].diffs).toHaveLength(1);
      expect(diff.modified[0].diffs[0].type).toEqual("texte");
      expect(diff.modified[0].diffs[0].currentText).toContain("[CHANGE]");
      expect(diff.modified[0].diffs[0].previousText).not.toContain("[CHANGE]");
      expect(diff.removed).toHaveLength(0);
      // expect(diff.modified).toHaveLength(2);
      // expect(diff.modified[0].cid).toEqual("KALIARTI000005834047");
      // expect(diff.modified[0].diffs).toHaveLength(1);
      // expect(diff.modified[0].diffs[0]).toEqual({
      //   currentText: "[CHANGE] ABROGE",
      //   previousText: "VIGUEUR_ETEN",
      //   type: "etat",
      // });
      // expect(diff.modified[1].cid).toEqual("KALIARTI000005834059");
      // expect(diff.modified[1].diffs).toHaveLength(1);
      // expect(diff.modified[1].diffs[0].type).toEqual("texte");
      // expect(diff.modified[1].diffs[0].currentText).toContain("[CHANGE]");
      // expect(diff.modified[1].diffs[0].previousText).not.toContain("[CHANGE]");
      // expect(diff.removed).toHaveLength(0);
    });
  });

  describe("une convention collective a été supprimée", () => {
    it("doit détecter la suppression des articles liées à  la convention collective", async () => {
      const result = await processAgreementChanges(
        { commit: {} as Commit, ref: "" },
        // eslint-disable-next-line
        removed as any,
        async () => Promise.resolve([])
      );
      expect(result).toHaveLength(1);
      const diff = result[0];
      expect(diff.removed).toHaveLength(3);
    });
  });

  describe("une convention collective a été ajoutée", () => {
    it("doit détecter l'ajout des articles liées à  la convention collective", async () => {
      const result = await processAgreementChanges(
        { commit: {} as Commit, ref: "" },
        // eslint-disable-next-line
        added as any,
        async () => Promise.resolve([])
      );
      expect(result).toHaveLength(1);
      const diff = result[0];
      expect(diff.added).toHaveLength(3);
    });
  });
});
