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

  it("should call addGlossary and return modified content if no ficheSpDescription", () => {
    const content = {
      content: "Content",
    };

    const result = getContributionContent(content);

    expect(result).toEqual({
      content: "Modified content",
    });
  });
});
