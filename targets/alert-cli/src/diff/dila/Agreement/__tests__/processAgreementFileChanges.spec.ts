import { describe, expect } from "@jest/globals";
import type { ConvenientPatch, Tree } from "nodegit";

import processAgreementFileChanges from "../ProcessAgreementFileChanges";

describe("Creation des AgreementFileChange à partir d'un patch", () => {
  const createPatch = (
    added: boolean,
    removed: boolean,
    modified: boolean
  ): ConvenientPatch => {
    const newFile = { path: () => "my-file.json" };
    return {
      isAdded: () => added,
      isDeleted: () => removed,
      isModified: () => modified,
      newFile: () => newFile,
    } as ConvenientPatch;
  };
  const agreementA = '{"type":"legi","data":{"etat":"VIGUEUR"},"children":[]}';
  const agreementB =
    '{"type":"legi","data":{"etat":"MODIFIED VIGUEUR"},"children":[]}';

  const createSubTree = (a: string): Tree => {
    return {
      getEntry: async () =>
        new Promise(function (resolve) {
          resolve({
            getBlob: async () =>
              new Promise(function (r) {
                r(a);
              }),
          });
        }),
    } as unknown as Tree;
  };

  it("pour un ajout", async () => {
    const patch = createPatch(true, false, false);
    const result = await processAgreementFileChanges(
      [patch],
      () => true,
      createSubTree(agreementA),
      createSubTree(agreementB)
    );
    expect(result).toHaveLength(1);
    const change = result[0];
    expect(change.file).toEqual("my-file.json");
    expect(change.previous).toEqual(undefined);
    expect(JSON.stringify(change.current)).toEqual(agreementB);
  });

  it("pour une modification", async () => {
    const patch = createPatch(false, false, true);

    const result = await processAgreementFileChanges(
      [patch],
      () => true,
      createSubTree(agreementA),
      createSubTree(agreementB)
    );
    expect(result).toHaveLength(1);
    const change = result[0];
    expect(change.file).toEqual("my-file.json");
    expect(JSON.stringify(change.previous)).toEqual(agreementA);
    expect(JSON.stringify(change.current)).toEqual(agreementB);
  });

  it("pour une suppression", async () => {
    const patch = createPatch(false, true, false);
    const result = await processAgreementFileChanges(
      [patch],
      () => true,
      createSubTree(agreementA),
      createSubTree(agreementB)
    );
    expect(result).toHaveLength(1);
    const change = result[0];
    expect(change.file).toEqual("my-file.json");
    expect(JSON.stringify(change.previous)).toEqual(agreementA);
    expect(change.current).toEqual(undefined);
  });
});
