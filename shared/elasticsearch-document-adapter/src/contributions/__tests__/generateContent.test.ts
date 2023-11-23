import { fetchFicheSp } from "../fetchFicheSp";
import { generateContent } from "../generateContent";
import { ContributionContent } from "../types";

jest.mock("../fetchFicheSp");

describe("generateContent", () => {
  const mockContributions: any[] = [
    { id: "GENERIC_ID", content: "GENERIC_CONTENT", type: "content" },
    {
      id: "GENERIC_ID_2",
      content: "GENERIC_CONTENT",
      type: "fiche-sp",
      url: "some url",
      date: "2023-01-01",
      raw: "raw data",
      description: "some description",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return content for type "content"', async () => {
    const contribution: any = {
      type: "content",
      content: "some content",
    };

    const result: ContributionContent = await generateContent(
      mockContributions,
      contribution
    );

    expect(result).toEqual({
      content: "some content",
    });
  });

  it('should return generic content content for type "cdt"', async () => {
    const contribution: any = {
      type: "cdt",
      genericAnswerId: "GENERIC_ID",
    };

    const result: ContributionContent = await generateContent(
      mockContributions,
      contribution
    );

    expect(result).toEqual({
      content: "GENERIC_CONTENT",
    });
  });

  it("should throw an error for unknown generic", async () => {
    const contribution: any = {
      type: "cdt",
      genericAnswerId: "unknown-type",
    };

    await expect(
      generateContent(mockContributions, contribution)
    ).rejects.toThrowError(
      `Aucune contribution générique a été retrouvée avec cet id ${"unknown-type"}`
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
      mockContributions,
      contribution
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
      mockContributions,
      contribution
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
      type: "unknown-type",
    };

    await expect(
      generateContent(mockContributions, contribution)
    ).rejects.toThrowError("Type de contribution inconnu unknown-type");
  });
});
