import { isGenericContribution } from "../helpers";

describe("helpers", () => {
  describe("isGenericContribution", () => {
    it("should correctly identify a generic contribution", () => {
      const contribution: any = {
        idcc: "0000",
      };

      const result: boolean = isGenericContribution(contribution);

      expect(result).toBe(true);
    });

    it("should correctly identify a non-generic contribution as not generic", () => {
      const contribution: any = {
        idcc: "1234",
      };

      const result: boolean = isGenericContribution(contribution);

      expect(result).toBe(false);
    });
  });
});
