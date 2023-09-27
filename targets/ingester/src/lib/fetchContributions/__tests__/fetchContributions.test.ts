jest.mock("../ContributionRepository");
jest.mock("../AgreementRepository");
import fetchContributions from "../index";
import ExpectedOutput from "./expected.json";

test("fetchContribution should return all contributions with the expected format", async () => {
  const result = await fetchContributions();
  expect(result).toEqual(ExpectedOutput);
});
