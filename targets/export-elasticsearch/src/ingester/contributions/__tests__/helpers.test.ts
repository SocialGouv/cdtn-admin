import {
  isNewContribution,
  isOldContribution,
  isGenericContribution,
} from "../helpers";

describe("helpers", () => {
  describe("isNewContribution", () => {
    it("should correctly identify a new contribution", () => {
      const contribution: any = {
        type: "content",
      };

      const result: boolean = isNewContribution(contribution);

      expect(result).toBe(true);
    });

    it("should correctly identify an old contribution as not new", () => {
      const contribution: any = {
        answers: [],
      };

      const result: boolean = isNewContribution(contribution);

      expect(result).toBe(false);
    });
  });

  describe("isOldContribution", () => {
    it("should correctly identify an old contribution", () => {
      const contribution: any = {
        answers: [],
      };

      const result: boolean = isOldContribution(contribution);

      expect(result).toBe(true);
    });

    it("should correctly identify a new contribution as not old", () => {
      const contribution: any = {
        type: "content",
      };

      const result: boolean = isOldContribution(contribution);

      expect(result).toBe(false);
    });
  });

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
