import { getTodayInParis } from "../getTodayInParis";

describe("getTodayInParis", () => {
  it("renvoie la date du jour à Paris au format yyyy-MM-dd", () => {
    expect(getTodayInParis(new Date("2026-10-16T10:00:00Z"))).toBe(
      "2026-10-16"
    );
  });

  it("bascule au lendemain après minuit heure de Paris", () => {
    expect(getTodayInParis(new Date("2026-10-16T22:30:00Z"))).toBe(
      "2026-10-17"
    );
  });
});
