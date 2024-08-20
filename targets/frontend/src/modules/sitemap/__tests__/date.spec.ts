import { transformStringDate, formatDateToCustomISO } from "../date";

describe("Date", () => {
  describe("transformStringDate", () => {
    it("should transform a French date string to a Date object", () => {
      const frenchDate = "01/02/2023";
      const expectedDate = new Date("2023-02-01");
      expect(transformStringDate(frenchDate)).toEqual(expectedDate);
    });

    it("should transform a non-French date string to a Date object", () => {
      const nonFrenchDate = "2023-02-01";
      const expectedDate = new Date(nonFrenchDate);
      expect(transformStringDate(nonFrenchDate)).toEqual(expectedDate);
    });
  });

  describe("formatDateToCustomISO", () => {
    it("should format a date to a custom ISO string", () => {
      const date = new Date("2023-02-01T12:34:56Z");
      const expectedFormattedDate = "2023-02-01T12:00:00+02:00";
      expect(formatDateToCustomISO(date)).toEqual(expectedFormattedDate);
    });
  });
});
