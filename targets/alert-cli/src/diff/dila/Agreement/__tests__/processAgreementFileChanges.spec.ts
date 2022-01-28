import { describe, expect } from "@jest/globals";
import type { ConvenientPatch, Tree } from "nodegit";

import processAgreementFileChanges from "../ProcessAgreementFileChanges";

describe("Creation des AgreementFileChange à partir d'un patch", () => {
const createPatch = (
    added: boolean,
    removed: boolean,
    modified: boolean
  ): ConvenientPatch => {
    const newFile = { path: () => "my-file.json" } as DiffFile;
    return {
      isAdded: () => added,
      isDeleted: () => removed,
      isModified: () => modified,
      newFile: () => newFile,
    } as ConvenientPatch;
  };
  const mockAgreement = '{"type":"legi","data":{},"children":[]}';

  const mockedTree = {
    getEntry: async () =>
      new Promise(function (resolve) {
        resolve({
          getBlob: async () =>
            new Promise(function (r) {
              r(mockAgreement);
            }),
        });
      }),
  } as unknown as Tree;

  it("pour un ajout", async () => {
    const patch = createMockPatch(true, false, false);
    const result = await processAgreementFileChanges(
      [patch as ConvenientPatch],
      () => true,
      mockedTree,
      mockedTree
      // {} as Tree
    );
    expect(result).toHaveLength(1);
    const change = result[0];
    expect(change.file).toEqual("my-file.json");
    expect(JSON.stringify(change.current)).toEqual(mockAgreement);
    expect(change.previous).toEqual(undefined);
  });

  it("pour une modification", async () => {
    const patch = createMockPatch(false, false, true);

    const result = await processAgreementFileChanges(
      [patch as ConvenientPatch],
      () => true,
      mockedTree,
      mockedTree
    );
    expect(result).toHaveLength(1);
    const change = result[0];
    expect(change.file).toEqual("my-file.json");
    expect(JSON.stringify(change.current)).toEqual(mockAgreement);
    expect(JSON.stringify(change.previous)).toEqual(mockAgreement);
  });

  it("pour une suppression", async () => {
    const patch = createMockPatch(false, true, false);
    const result = await processAgreementFileChanges(
      [patch as ConvenientPatch],
      () => true,
      mockedTree,
      mockedTree
    );
    expect(result).toHaveLength(1);
    const change = result[0];
    expect(change.file).toEqual("my-file.json");
    expect(change.current).toEqual(undefined);
    expect(JSON.stringify(change.previous)).toEqual(mockAgreement);
  });
});
