import { ContributionContent } from "@socialgouv/cdtn-types";
import { fetchFicheSp } from "../fetchFicheSp";
import { generateContent } from "../generateContent";

jest.mock("../fetchFicheSp");

describe("generateContent", () => {
  const mockContributions: any[] = [
    {
      id: "GENERIC_ID",
      contentWithGlossary: "GENERIC_CONTENT",
      type: "content",
    },
    {
      id: "GENERIC_ID_2",
      contentWithGlossary: "GENERIC_CONTENT",
      type: "fiche-sp",
      url: "some url",
      date: "2023-01-01",
      raw: "raw data",
      description: "some description",
    },
    {
      id: "GENERIC_ID_NO_CDT",
      type: "generic-no-cdt",
      messageBlockGenericNoCDT: "some message",
    },
    {
      id: "GENERIC_UNKNOWN_TYPE",
      type: "unknown_type",
      messageBlockGenericNoCDT: "some message",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return content for type "content"', async () => {
    const contribution: any = {
      type: "content",
      contentWithGlossary: "some content",
    };

    const result: ContributionContent = await generateContent(
      mockContributions.find(({ id }) => id === contribution.genericAnswerId),
      contribution,
      []
    );

    expect(result).toEqual({
      content: "some content",
      infographics: [],
    });
  });

  it('should return generic content content for type "cdt"', async () => {
    const contribution: any = {
      type: "cdt",
      genericAnswerId: "GENERIC_ID",
    };

    const result: ContributionContent = await generateContent(
      mockContributions.find(({ id }) => id === contribution.genericAnswerId),
      contribution,
      []
    );

    expect(result).toEqual({
      content: "GENERIC_CONTENT",
      infographics: [],
    });
  });

  it("should throw an error for unknown generic", async () => {
    const contribution: any = {
      type: "cdt",
      questionIndex: 10,
      idcc: 3239,
      genericAnswerId: "unknown-type",
    };

    await expect(
      generateContent(
        mockContributions.find(({ id }) => id === contribution.genericAnswerId),
        contribution,
        []
      )
    ).rejects.toThrowError(
      `Aucune contribution générique a été retrouvée pour la contribution [10 - 3239] (id générique non trouvé : unknown-type)`
    );
  });

  it("should throw an error if type cdt and generic type generic-no-cdt", async () => {
    const contribution: any = {
      type: "cdt",
      questionIndex: "2",
      idcc: "1516",
      genericAnswerId: "GENERIC_ID_NO_CDT",
    };

    await expect(
      generateContent(
        mockContributions.find(({ id }) => id === contribution.genericAnswerId),
        contribution,
        []
      )
    ).rejects.toThrowError(
      "La contribution [2 - 1516] ne peut pas référencer une générique qui n'a pas de réponse"
    );
  });

  it('should return fiche-sp content for type "cdt"', async () => {
    const contribution: any = {
      type: "cdt",
      genericAnswerId: "GENERIC_ID_2",
    };

    const mockFicheSpContent = {
      url: "some url",
      date: "2023-01-01",
      raw: "raw data",
      description: "some description",
    };

    (fetchFicheSp as jest.Mock).mockResolvedValue(mockFicheSpContent);

    const result: ContributionContent = await generateContent(
      mockContributions.find(({ id }) => id === contribution.genericAnswerId),
      contribution,
      []
    );

    expect(result).toEqual({
      url: "some url",
      date: "2023-01-01",
      raw: "raw data",
      ficheSpDescription: "some description",
    });
  });

  it('should return fiche-sp content for type "fiche-sp"', async () => {
    const contribution: any = {
      type: "fiche-sp",
      ficheSpId: "123",
    };

    const mockFicheSpContent = {
      url: "some url",
      date: "2023-01-01",
      raw: "raw data",
      description: "some description",
    };

    (fetchFicheSp as jest.Mock).mockResolvedValue(mockFicheSpContent);

    const result: ContributionContent = await generateContent(
      mockContributions.find(({ id }) => id === contribution.genericAnswerId),
      contribution,
      []
    );

    expect(result).toEqual({
      url: "some url",
      date: "2023-01-01",
      raw: "raw data",
      ficheSpDescription: "some description",
    });
  });

  it("should throw an error for unknown contribution type", async () => {
    const contribution: any = {
      id: "mon id",
      type: "cdt",
      genericAnswerId: "GENERIC_UNKNOWN_TYPE",
    };

    await expect(
      generateContent(
        mockContributions.find(({ id }) => id === contribution.genericAnswerId),
        contribution,
        []
      )
    ).rejects.toThrowError(
      'Type de contribution generic inconnu "unknown_type" for [GENERIC_UNKNOWN_TYPE]'
    );
  });

  it('should return message for type "generic-no-cdt"', async () => {
    const contribution: any = {
      type: "generic-no-cdt",
      messageBlockGenericNoCDT: "some message",
    };

    const result: ContributionContent = await generateContent(
      mockContributions.find(({ id }) => id === contribution.genericAnswerId),
      contribution,
      []
    );

    expect(result).toEqual({
      messageBlockGenericNoCDT: "some message",
    });
  });

  it('should return content with infographics for type "content"', async () => {
    const contribution: any = {
      type: "content",
      contentWithGlossary: "some content",
      infographics: [
        {
          infographicId: "id_info",
        },
      ],
    };

    await expect(
      generateContent(
        mockContributions.find(({ id }) => id === contribution.genericAnswerId),
        contribution,
        []
      )
    ).rejects.toThrowError(
      "Infographic id_info not published for contrib undefined (undefined - undefined)"
    );
  });

  it('should return content with infographics for type "content"', async () => {
    const contribution: any = {
      type: "content",
      contentWithGlossary: "some content",
      infographics: [
        {
          infographicId: "id_info",
        },
      ],
    };
    const infographics: any = [
      {
        id: "id_info",
        title: "title",
        pdfFilename: "pdfFilename",
        pdfFilesizeOctet: "pdfFilesizeOctet",
        svgFilename: "svgFilename",
        transcription: "transcription",
      },
    ];

    const result: ContributionContent = await generateContent(
      mockContributions.find(({ id }) => id === contribution.genericAnswerId),
      contribution,
      infographics
    );

    expect(result).toEqual({
      content: "some content",
      infographics: [
        {
          infographicId: "id_info",
          title: "title",
          pdfFilename: "pdfFilename",
          pdfFilesizeOctet: "pdfFilesizeOctet",
          svgFilename: "svgFilename",
          transcription: "transcription",
        },
      ],
    });
  });
});
