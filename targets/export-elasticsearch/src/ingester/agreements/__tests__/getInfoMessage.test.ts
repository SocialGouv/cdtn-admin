import { getInfoMessage } from "../getInfoMessage";

describe("getInfoMessage", () => {
  test("getInfoMessage returns expected message for ANSWER", () => {
    const data: any = {
      contentType: "ANSWER",
    };

    const expected =
      "Les informations ci-dessous sont issues de l’analyse des règles prévues par votre convention collective de branche étendue et par le Code du travail.";

    expect(getInfoMessage(data)).toBe(expected);
  });

  test("getInfoMessage returns expected message for CDT", () => {
    const data: any = {
      contentType: "CDT",
    };

    const expected =
      "Les informations ci-dessous sont issues du code du travail car la convention collective renvoie au code du travail.";

    expect(getInfoMessage(data)).toBe(expected);
  });

  test("returns expected message for UNFAVOURABLE content type", () => {
    const data: any = {
      contentType: "UNFAVOURABLE",
    };

    const expected =
      "Les informations ci-dessous sont issues du code du travail car elles sont plus favorables que les dispositions prévues par la convention collective.";

    expect(getInfoMessage(data)).toBe(expected);
  });

  test("returns expected message for NOTHING content type", () => {
    const data: any = {
      contentType: "NOTHING",
    };

    const expected =
      "Les informations ci-dessous sont issues du code du travail car la convention collective ne prévoit rien sur ce sujet.";

    expect(getInfoMessage(data)).toBe(expected);
  });

  test("getInfoMessage throws error for SP content type", () => {
    const data: any = {
      contentType: "SP",
    };

    expect(() => {
      getInfoMessage(data);
    }).toThrowError();
  });

  test("getInfoMessage throws error for UNKNOWN content type", () => {
    const data: any = {
      contentType: "UNKNOWN",
    };

    expect(() => {
      getInfoMessage(data);
    }).toThrowError();
  });
});
