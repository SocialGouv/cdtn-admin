import { ContributionContentType } from "@shared/types";
import { fetchMessageBlock } from "../fetchMessageBlock";
import { generateMessageBlock } from "../generateMessageBlock";

jest.mock("../fetchMessageBlock");

describe("generateMessageBlock", () => {
  const mockContribution: any = {
    questionMessageId: "123",
    contentType: "ANSWER", // replace with the desired content type for your test
    // Add other necessary properties based on your implementation
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return undefined if questionMessageId is not provided", async () => {
    const contributionWithoutMessageId: any = {
      // omitting questionMessageId intentionally
      contentType: "ANSWER", // replace with the desired content type for your test
      // Add other necessary properties based on your implementation
    };

    const result: string | undefined = await generateMessageBlock(
      contributionWithoutMessageId
    );

    expect(result).toBeUndefined();
    expect(fetchMessageBlock).not.toHaveBeenCalled();
  });

  it.each`
    contentType       | expectedContent
    ${"ANSWER"}       | ${"agreed content"}
    ${"NOTHING"}      | ${"legal content"}
    ${"CDT"}          | ${"legal content"}
    ${"UNFAVOURABLE"} | ${"legal content"}
    ${"UNKNOWN"}      | ${"not handled content"}
    ${"SP"}           | ${"legal content"}
  `(
    'should return $expectedContent for contentType "$contentType"',
    async ({ contentType, expectedContent }) => {
      (fetchMessageBlock as jest.Mock).mockResolvedValue({
        contentAgreement: "agreed content",
        contentLegal: "legal content",
        contentNotHandled: "not handled content",
      });

      mockContribution.contentType = contentType as ContributionContentType;
      const result: string | undefined = await generateMessageBlock(
        mockContribution
      );

      expect(result).toEqual(expectedContent);
      expect(fetchMessageBlock).toHaveBeenCalledWith("123");
    }
  );

  it("should throw an error for unknown content type", async () => {
    mockContribution.contentType = "UNKNOWN_TYPE";

    await expect(generateMessageBlock(mockContribution)).rejects.toThrowError(
      "Unknown content type"
    );
  });

  it("should throw an error for unknown content type", async () => {
    mockContribution.contentType = null;

    await expect(generateMessageBlock(mockContribution)).rejects.toThrowError(
      "Unknown content type"
    );
  });
});
