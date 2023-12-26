import { getCcInfos } from "../getCcInfos";

describe("getCcInfos", () => {
  it("should return correct ContributionConventionnelInfos", () => {
    const ccns: any[] = [
      {
        num: 123,
        slug: "sample-slug",
        shortTitle: "Sample Title",
      },
    ];

    const contribution: any = {
      idcc: "123",
    };

    const ccInfos: any = getCcInfos(ccns, contribution);

    expect(ccInfos).toEqual({
      ccnSlug: "sample-slug",
      ccnShortTitle: "Sample Title",
    });
  });

  it("should throw an error if ContributionDocumentJson is not found in ccns", () => {
    const ccns: any[] = [
      {
        num: 456,
        slug: "another-slug",
        shortTitle: "Another Title",
      },
    ];

    const contribution: any = {
      idcc: "123",
    };

    const getInfos = () => getCcInfos(ccns, contribution);

    expect(getInfos).toThrowError("Contribution 123 not found");
  });
});
