jest.mock("../../lib/fetchContributions/ContributionRepository");
jest.mock("../../lib/fetchContributions/AgreementRepository");

import ExpectedOutput from "./expected-contributions.json";
import getContributionsDocuments from "../contributions";

test("fetchContribution should return all contributions with the expected format", async () => {
  const result = await getContributionsDocuments();
  expect(result).toEqual(ExpectedOutput);
});
