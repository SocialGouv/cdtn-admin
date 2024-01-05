import { ContributionContentType } from "@shared/types";
import { fetchMessageBlock } from "../fetchMessageBlock";
import { generateMessageBlock } from "../generateMessageBlock";

jest.mock("../fetchMessageBlock");

describe("generateMessageBlock", () => {
  const mockContribution: any = {
    questionId: "123",
    contentType: "ANSWER",
    idcc: "1234",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each`
    contentType       | expectedContent
    ${"ANSWER"}       | ${"agreed content"}
    ${"SP"}           | ${"agreed content"}
    ${"NOTHING"}      | ${"not handled content"}
    ${"CDT"}          | ${"not handled content"}
    ${"UNFAVOURABLE"} | ${"not handled content"}
    ${"UNKNOWN"}      | ${"legal content"}
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

  it.each`
    contentType
    ${"ANSWER"}
    ${"SP"}
    ${"CDT"}
    ${"UNFAVOURABLE"}
    ${"UNKNOWN"}
  `(
    'for a generic should always return "legal content" for contentType "$contentType"',
    async ({ contentType }) => {
      (fetchMessageBlock as jest.Mock).mockResolvedValue({
        contentAgreement: "agreed content",
        contentLegal: "legal content",
        contentNotHandled: "not handled content",
      });

      mockContribution.contentType = contentType as ContributionContentType;
      mockContribution.idcc = "0000";
      const result: string | undefined = await generateMessageBlock(
        mockContribution
      );

      expect(result).toEqual("legal content");
      expect(fetchMessageBlock).toHaveBeenCalledWith("123");
    }
  );

  it("should throw an error for unknown content type", async () => {
    mockContribution.contentType = "UNKNOWN_TYPE";
    mockContribution.idcc = "1234";

    await expect(generateMessageBlock(mockContribution)).rejects.toThrowError(
      "Unknown content type"
    );
  });

  it("should throw an error for unknown content type", async () => {
    mockContribution.contentType = null;
    mockContribution.idcc = "1234";

    await expect(generateMessageBlock(mockContribution)).rejects.toThrowError(
      "Unknown content type"
    );
  });

  it("should return undefined if no message block setup for the question", async () => {
    (fetchMessageBlock as jest.Mock).mockResolvedValue(undefined);

    const result: string | undefined = await generateMessageBlock(
      mockContribution
    );

    expect(result).toEqual(undefined);

    expect(fetchMessageBlock).toHaveBeenCalledWith("123");
  });
});
