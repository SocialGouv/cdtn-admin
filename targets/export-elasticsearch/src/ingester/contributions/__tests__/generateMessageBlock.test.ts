import {
  ContributionContentType,
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@socialgouv/cdtn-types";
import { fetchMessageBlock } from "../fetchMessageBlock";
import { fetchAgreementMessage } from "../fetchAgreementMessage";
import { generateMessageBlock } from "../generateMessageBlock";

jest.mock("../fetchMessageBlock");
jest.mock("../fetchAgreementMessage");

let contributionGeneric: DocumentElasticWithSource<ContributionDocumentJson> | undefined = undefined;

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
    ${"NOTHING"}      | ${"nothing content"}
    ${"CDT"}          | ${"nothing content"}
    ${"UNFAVOURABLE"} | ${"nothing content"}
    ${"UNKNOWN"}      | ${"legal content"}
  `(
    'should return $expectedContent for contentType "$contentType"',
    async ({ contentType, expectedContent }) => {
      (fetchMessageBlock as jest.Mock).mockResolvedValue({
        contentAgreement: "agreed content",
        contentLegal: "legal content",
        contentNotHandled: "nothing content",
      });

      mockContribution.contentType = contentType as ContributionContentType;
      const result: string | undefined = await generateMessageBlock(
        contributionGeneric,
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
        contentNotHandled: "nothing content",
      });

      mockContribution.contentType = contentType as ContributionContentType;
      mockContribution.idcc = "0000";
      const result: string | undefined = await generateMessageBlock(
        contributionGeneric,
        mockContribution
      );

      expect(result).toEqual("legal content");
      expect(fetchMessageBlock).toHaveBeenCalledWith("123");
    }
  );

  it("should throw an error for unknown content type", async () => {
    mockContribution.contentType = "UNKNOWN_TYPE";
    mockContribution.idcc = "1234";

    await expect(
      generateMessageBlock(contributionGeneric, mockContribution)
    ).rejects.toThrowError("Unknown content type");
  });

  it("should throw an error for unknown content type", async () => {
    mockContribution.contentType = null;
    mockContribution.idcc = "1234";

    await expect(
      generateMessageBlock(contributionGeneric, mockContribution)
    ).rejects.toThrowError("Unknown content type");
  });

  it("should return undefined if no message block setup for the question", async () => {
    (fetchMessageBlock as jest.Mock).mockResolvedValue(undefined);

    const result: string | undefined = await generateMessageBlock(
      contributionGeneric,
      mockContribution
    );

    expect(result).toEqual(undefined);

    expect(fetchMessageBlock).toHaveBeenCalledWith("123");
  });
  it("should return agreement Message even if no question message block are linked", async () => {
    (fetchMessageBlock as jest.Mock).mockResolvedValue(undefined);
    (fetchAgreementMessage as jest.Mock).mockResolvedValue(
      "fetchedAgreementMessage"
    );

    const result: string | undefined = await generateMessageBlock(
      contributionGeneric,
      mockContribution
    );

    expect(fetchAgreementMessage).toHaveBeenCalledWith("1234");
    expect(result).toEqual("fetchedAgreementMessage");
  });
  describe("Tests avec une contribution generic no cdt", () => {
    beforeEach(() => {
      contributionGeneric = {
        contentType: "GENERIC_NO_CDT",
        id: "id",
        cdtnId: "cdtnId",
        breadcrumbs: [],
        title: "",
        slug: "",
        source: "contributions",
        text: "text",
        isPublished: true,
        excludeFromSearch: false,
        metaDescription: "metaDescription",
        refs: [],
        references: [],
        questionIndex: 0,
        questionId: "questionId",
        questionName: "questionName",
        linkedContent: [],
        description: "description",
        idcc: "0000",
        type: "generic-no-cdt",
        messageBlockGenericNoCDT: "messageBlockGenericNoCDT",
        messageBlockGenericNoCDTUnextendedCC: "messageBlockGenericNoCDTUnextendedCC"
      }
    })
    it.each(["ANSWER", "SP"])("should throw a contentAgreementWithoutLegal", async (contentType) => {
      (fetchMessageBlock as jest.Mock).mockResolvedValue({
        contentAgreementWithoutLegal: "agrement without legal"
      });
      mockContribution.contentType = contentType;
      mockContribution.idcc = "1234";

      const messageBloc = await generateMessageBlock(contributionGeneric, mockContribution);
  
      expect(
        messageBloc
      ).toEqual("agrement without legal");
    });

    it.each(["NOTHING", "CDT", "UNFAVOURABLE"])("should throw a contentNotHandledWithoutLegal", async (contentType) => {
      (fetchMessageBlock as jest.Mock).mockResolvedValue({
        contentNotHandledWithoutLegal: "content not handled without legal"
      });
      mockContribution.contentType = contentType;
      mockContribution.idcc = "1234";

      const messageBloc = await generateMessageBlock(contributionGeneric, mockContribution);
  
      expect(
        messageBloc
      ).toEqual("content not handled without legal");
    });
  })

  
});
