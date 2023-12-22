import { getCcSupported } from "../getCcSupported";

describe("getCcSupported", () => {
  it("should return correct list of supported CCs", () => {
    const allContributions: any[] = [
      {
        questionIndex: 1,
        contentType: "ANSWERS",
        idcc: "1234",
      },
      {
        questionIndex: 1,
        contentType: "UNKNOWN",
        idcc: "5678",
      },
    ];

    const contribution: any = {
      questionIndex: 1,
      contentType: "ANSWERS",
      idcc: "0000",
    };

    const supportedCCs: string[] = getCcSupported(
      allContributions,
      contribution
    );

    expect(supportedCCs).toEqual(["1234", "5678"]);
  });

  it("should return list of supported CCs with old metallurgie agreements", () => {
    const allContributions: any[] = [
      {
        questionIndex: 4,
        contentType: "ANSWERS",
        idcc: "1234",
      },
      {
        questionIndex: 4,
        contentType: "UNKNOWN",
        idcc: "5678",
      },
    ];

    const contribution: any = {
      questionIndex: 4,
      contentType: "ANSWERS",
      idcc: "0000",
    };

    const supportedCCs: string[] = getCcSupported(
      allContributions,
      contribution
    );

    expect(supportedCCs).toEqual([
      "1234",
      "5678",
      "0054",
      "0650",
      "0714",
      "0822",
      "0828",
      "0829",
      "0860",
      "0863",
      "0878",
      "0911",
      "0937",
      "0948",
      "0965",
      "0979",
      "1059",
      "1159",
      "1274",
      "1315",
      "1365",
      "1369",
      "1387",
      "1472",
      "1560",
      "1564",
      "1577",
      "1592",
      "1604",
      "1626",
      "1628",
      "1634",
      "1635",
      "1732",
      "1813",
      "1885",
      "1902",
      "1966",
      "2003",
      "2126",
      "2221",
      "2266",
      "2542",
      "2579",
      "2615",
      "2630",
      "2700",
      "2755",
      "2992",
      "3053",
      "3209",
      "3231",
    ]);
  });
});
