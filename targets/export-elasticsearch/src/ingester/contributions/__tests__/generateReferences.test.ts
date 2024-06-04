import { generateReferences } from "../generateReferences";

describe("generateReferences", () => {
  it("returns contribution references for CDT case", () => {
    const contrib: any = {
      questionIndex: 1,
      contentType: "CDT",
      references: [
        {
          title: "ref1",
          url: "ref1",
        },
        {
          title: "ref2",
          url: "ref2",
        },
      ],
    };
    const contributions: any = [
      {
        questionIndex: 1,
        idcc: "0000",
        references: [
          {
            title: "cdtRef1",
            url: "cdtRef1",
          },
          {
            title: "cdtRef2",
            url: "cdtRef2",
          },
          {
            title: "ref1",
            url: "ref1",
          },
        ],
      },
    ];

    const result = generateReferences(contributions[0], contrib);

    expect(result).toEqual([
      {
        title: "ref1",
        url: "ref1",
      },
      {
        title: "ref2",
        url: "ref2",
      },
      {
        title: "cdtRef1",
        url: "cdtRef1",
      },
      {
        title: "cdtRef2",
        url: "cdtRef2",
      },
    ]);
  });

  it("returns contribution references for non-CDT case", () => {
    const contrib: any = {
      contentType: "OTHER",
      references: [
        {
          title: "ref1",
          url: "ref1",
        },
        {
          title: "ref2",
          url: "ref2",
        },
      ],
    };

    const result = generateReferences(undefined, contrib);

    expect(result).toEqual([
      {
        title: "ref1",
        url: "ref1",
      },
      {
        title: "ref2",
        url: "ref2",
      },
    ]);
  });

  it("throws error if no generic contribution found", () => {
    const contrib: any = { contentType: "CDT", questionIndex: 1 };

    expect(() => {
      generateReferences(undefined, contrib);
    }).toThrowError();
  });

  it("throws error if generic contribution has no answer", () => {
    const contrib: any = { contentType: "CDT", questionIndex: 1 };
    const contributions: any = [
      { questionIndex: 1, idcc: "0000", type: "generic-no-cdt" },
    ];

    expect(() => {
      generateReferences(contributions, contrib);
    }).toThrowError();
  });
});
