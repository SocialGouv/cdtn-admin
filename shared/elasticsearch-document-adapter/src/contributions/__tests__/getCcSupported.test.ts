import { CC_OLD_METALLURGIE, getCcSupported } from "../getCcSupported";

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

    expect(supportedCCs).toEqual(["1234", ...CC_OLD_METALLURGIE]);
  });
});
