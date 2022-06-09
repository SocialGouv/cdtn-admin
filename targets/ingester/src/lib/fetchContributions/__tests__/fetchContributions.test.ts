// eslint-disable-next-line jest/no-mocks-import
import { AgreementMock } from "../__mocks__/AgreementMock";
// eslint-disable-next-line jest/no-mocks-import
import { ContributionMock } from "../__mocks__/ContributionMock";
import fetchContributions from "../index";
import ExpectedOutput from "./expected.json";

test("fetchContribution should return all contributions with the expected format", async () => {
  const result = await fetchContributions(
    new ContributionMock(),
    new AgreementMock()
  );
  expect(result).toEqual(ExpectedOutput);
});
