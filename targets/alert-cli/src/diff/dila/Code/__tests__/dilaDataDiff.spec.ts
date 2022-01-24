import { describe, expect } from "@jest/globals";
import type { Commit } from "nodegit";

import ProcessCodeChanges from "../ProcessCodeChanges";
import type { CodeFileChange } from "../types";
import irrevelantChanges from "./dataset/filechanges_kali_code_irrevelant_changes.json";
import noChanges from "./dataset/filechanges_kali_code_no_changes.json";
import revelantChanges from "./dataset/filechanges_kali_code_revelant_changes.json";

describe("Calcul des différences sur les conventions collectives (kali-data)", () => {
  describe("Aucun changement dans une convention collective", () => {
    it("doit détecter aucun changement", async () => {
      const result = await ProcessCodeChanges(
        { commit: {} as Commit, ref: "" },
        noChanges as unknown as CodeFileChange[],
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
      const result = await ProcessCodeChanges(
        { commit: {} as Commit, ref: "" },
        irrevelantChanges as unknown as CodeFileChange[],
        async () => Promise.resolve([])
      );
      expect(result).toHaveLength(1);
      const diff = result[0];
      expect(diff.added).toHaveLength(0);
      expect(diff.modified).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
    });
  });

  describe("changement du contenu d'articles (LEGIARTI) du code", () => {
    it("doit détecter le changement sur les articles", async () => {
      const result = await ProcessCodeChanges(
        { commit: {} as Commit, ref: "" },
        revelantChanges as unknown as CodeFileChange[],
        async () => Promise.resolve([])
      );
      expect(result).toHaveLength(1);
      const diff = result[0];
      expect(diff.added).toHaveLength(0);
      expect(diff.modified).toHaveLength(1);
      expect(diff.modified[0].cid).toEqual("LEGIARTI000017961623");
      expect(diff.modified[0].diffs).toHaveLength(3);
      expect(diff.modified[0].diffs[0].type).toEqual("texte");
      expect(diff.modified[0].diffs[0].currentText).toContain("[CHANGE]");
      expect(diff.modified[0].diffs[0].previousText).not.toContain("[CHANGE]");

      expect(diff.modified[0].cid).toEqual("LEGIARTI000017961623");
      expect(diff.modified[0].diffs[1].type).toEqual("nota");
      expect(diff.modified[0].diffs[1].currentText).toEqual("[CHANGE] ");
      expect(diff.modified[0].diffs[1].previousText).toEqual("");

      expect(diff.modified[0].cid).toEqual("LEGIARTI000017961623");
      expect(diff.modified[0].diffs[2].type).toEqual("etat");
      expect(diff.modified[0].diffs[2].currentText).toEqual("[CHANGE] VIGUEUR");
      expect(diff.modified[0].diffs[2].previousText).toEqual("VIGUEUR");

      expect(diff.removed).toHaveLength(0);
    });
  });
});
