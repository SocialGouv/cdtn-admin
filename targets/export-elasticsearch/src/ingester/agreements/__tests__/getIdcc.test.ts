import { getIDCCs } from "../getIdcc";

describe("getIDCCs", () => {
  it("returns unique IDCC values from contributions", () => {
    const contribs: any = [{ idcc: "5678" }];

    const idccs = getIDCCs(contribs);

    expect(idccs).toEqual(new Set([5678]));
  });

  it("handles empty inputs", () => {
    const idccs = getIDCCs([]);

    expect(idccs).toEqual(new Set());
  });
});
