import { getContributionContent } from "../getContributionContent";

describe("getContributionContent", () => {
  it("should return original content if ficheSpDescription exists", () => {
    const content = {
      ficheSpDescription: "Description",
      content: "Content",
    };

    const result = getContributionContent(content);

    expect(result).toEqual(content);
  });
});
