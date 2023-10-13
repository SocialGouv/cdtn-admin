jest.mock("../ContributionRepository");
jest.mock("../AgreementRepository");
import { fetchContributions, fetchFicheSPIdsFromContributions } from "../index";

describe("ContributionRepository", () => {
  test("fetchContribution should return all contributions with the expected format", async () => {
    const result = await fetchContributions();
    expect(result).toMatchSnapshot();
  });

  test("fetchFicheSPIdsFromContributions should return all fiche SP ids from Published contributions", async () => {
    const result = await fetchFicheSPIdsFromContributions();
    expect(result).toEqual(["a708246e55"]);
  });
});
