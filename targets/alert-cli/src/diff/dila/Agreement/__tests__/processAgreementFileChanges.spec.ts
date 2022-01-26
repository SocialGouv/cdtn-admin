import { describe, expect } from "@jest/globals";
import type { ConvenientPatch, Tree } from "nodegit";

import processAgreementFileChanges from "../ProcessAgreementFileChanges";

describe("Creation des AgreementFileChange à partir d'un patch", () => {
  const createMockPatch = (
    added: boolean,
    removed: boolean,
    modified: boolean
  ) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const newFile: DiffFile = { path: () => "my-file.json" };
    return {
      isAdded: () => added,
      isDeleted: () => removed,
      isModified: () => modified,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      newFile: () => newFile,
    };
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
