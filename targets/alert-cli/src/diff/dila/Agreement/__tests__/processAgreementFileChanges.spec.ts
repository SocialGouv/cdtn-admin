import { describe, expect } from "@jest/globals";

import processAgreementFileChanges from "../ProcessAgreementFileChanges";
import { DiffFile, LoadFileFn, PatchStatus } from "../../../type";

describe("Creation des AgreementFileChange à partir d'un patch", () => {
  const createPatch = (status: PatchStatus): DiffFile => {
    return {
      filename: "my-file.json",
      status,
    } as DiffFile;
  };
  const agreementA = '{"type":"legi","data":{"etat":"VIGUEUR"},"children":[]}';
  const agreementB =
    '{"type":"legi","data":{"etat":"MODIFIED VIGUEUR"},"children":[]}';
  const versionA = { ref: "A", commit: { date: new Date() } };
  const versionB = { ref: "B", commit: { date: new Date() } };
  const loadFile: (left: string, right: string) => LoadFileFn =
    (left, right) => (file, tag) => {
      if (tag.ref === versionA.ref) {
        return Promise.resolve(left);
      } else {
        return Promise.resolve(right);
      }
    };

  it("génère un AgreementFileChange pour un ajout", async () => {
    const patch = createPatch("added");
    const result = await processAgreementFileChanges(
      { files: [patch], from: versionA, to: versionB },
      () => true,
      loadFile(agreementA, agreementB)
    );
    expect(result).toHaveLength(1);
    const change = result[0];
    expect(change.file).toEqual("my-file.json");
    expect(change.previous).toEqual(undefined);
    expect(JSON.stringify(change.current)).toEqual(agreementB);
  });

  it("génère un AgreementFileChange pour une modification", async () => {
    const patch = createPatch("modified");

    const result = await processAgreementFileChanges(
      { files: [patch], from: versionA, to: versionB },
      () => true,
      loadFile(agreementA, agreementB)
    );
    expect(result).toHaveLength(1);
    const change = result[0];
    expect(change.file).toEqual("my-file.json");
    expect(JSON.stringify(change.previous)).toEqual(agreementA);
    expect(JSON.stringify(change.current)).toEqual(agreementB);
  });

  it("génère un AgreementFileChange pour une suppression", async () => {
    const patch = createPatch("removed");
    const result = await processAgreementFileChanges(
      { files: [patch], from: versionA, to: versionB },
      () => true,
      loadFile(agreementA, agreementB)
    );
    expect(result).toHaveLength(1);
    const change = result[0];
    expect(change.file).toEqual("my-file.json");
    expect(JSON.stringify(change.previous)).toEqual(agreementA);
    expect(change.current).toEqual(undefined);
  });
});
