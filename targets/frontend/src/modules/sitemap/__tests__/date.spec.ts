import { transformStringDate, formatDateToCustomISO } from "../date";

describe("Date", () => {
  describe("transformStringDate", () => {
    it("lit une date française à minuit heure de Paris", () => {
      expect(transformStringDate("01/02/2023")).toEqual(
        new Date("2023-02-01T00:00:00+01:00")
      );
      expect(transformStringDate("23/09/2026")).toEqual(
        new Date("2026-09-23T00:00:00+02:00")
      );
    });

    it("accepte les variantes du formulaire, année sur 2 chiffres en 20AA", () => {
      expect(transformStringDate("1/9/26")).toEqual(
        new Date("2026-09-01T00:00:00+02:00")
      );
      expect(transformStringDate(" 5/12/2026 ")).toEqual(
        new Date("2026-12-05T00:00:00+01:00")
      );
    });

    it("lit une date ISO à minuit heure de Paris", () => {
      expect(transformStringDate("2023-02-01")).toEqual(
        new Date("2023-02-01T00:00:00+01:00")
      );
    });

    it("rejette les dates inexistantes ou mal formées", () => {
      expect(transformStringDate("31/02/2026")).toBeUndefined();
      expect(transformStringDate("12/13/2026")).toBeUndefined();
      expect(transformStringDate("1/9/202")).toBeUndefined();
      expect(transformStringDate("pas une date")).toBeUndefined();
      expect(transformStringDate("")).toBeUndefined();
    });
  });

  describe("formatDateToCustomISO", () => {
    it("garde l'ISO UTC d'un instant précis", () => {
      expect(formatDateToCustomISO(new Date("2023-02-01T12:34:56Z"))).toEqual(
        "2023-02-01T12:34:56.000Z"
      );
    });

    it("émet minuit heure de Paris avec le décalage du jour", () => {
      expect(formatDateToCustomISO(transformStringDate("23/09/2026")!)).toBe(
        "2026-09-23T00:00:00+02:00"
      );
      expect(formatDateToCustomISO(transformStringDate("15/01/2026")!)).toBe(
        "2026-01-15T00:00:00+01:00"
      );
    });

    it("suit les changements d'heure", () => {
      // Heure d'été le 29/03/2026 à 2 h, heure d'hiver le 25/10/2026 à 3 h.
      expect(formatDateToCustomISO(transformStringDate("29/03/2026")!)).toBe(
        "2026-03-29T00:00:00+01:00"
      );
      expect(formatDateToCustomISO(transformStringDate("30/03/2026")!)).toBe(
        "2026-03-30T00:00:00+02:00"
      );
      expect(formatDateToCustomISO(transformStringDate("25/10/2026")!)).toBe(
        "2026-10-25T00:00:00+02:00"
      );
      expect(formatDateToCustomISO(transformStringDate("26/10/2026")!)).toBe(
        "2026-10-26T00:00:00+01:00"
      );
    });
  });
});
