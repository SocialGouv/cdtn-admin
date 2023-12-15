import { getIDCCs } from "../getIdcc";

describe("getIDCCs", () => {
  it("returns unique IDCC values from old and new contributions", () => {
    const oldContribs: any = [
      { answers: { conventionAnswer: { idcc: "1234" } } },
    ];
    const newContribs: any = [{ idcc: "5678" }];

    const idccs = getIDCCs(oldContribs, newContribs);

    expect(idccs).toEqual(new Set([1234, 5678]));
  });

  it("handles empty inputs", () => {
    const idccs = getIDCCs([], []);

    expect(idccs).toEqual(new Set());
  });
});
