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

  describe("CC « Afficher la réponse » (ANSWER)", () => {
    const generic: any = {
      questionIndex: 1,
      idcc: "0000",
      type: "content",
      references: [
        { title: "Article L3141-1", url: "https://legi/L3141-1" },
        { title: "Article L3141-2", url: "https://legi/L3141-2" },
        { title: "Autre", url: "https://autre" },
      ],
    };
    const ownReferences = [{ title: "Convention", url: "https://kali/1" }];

    it("n'ajoute aucune référence du Code du travail sans sélection", () => {
      const contrib: any = {
        questionIndex: 1,
        contentType: "ANSWER",
        references: ownReferences,
      };
      expect(generateReferences(generic, contrib)).toEqual(ownReferences);
    });

    it("n'ajoute que les références du Code du travail cochées, après celles de la CC", () => {
      const contrib: any = {
        questionIndex: 1,
        contentType: "ANSWER",
        references: ownReferences,
        includedCdtReferences: ["https://legi/L3141-2", "https://autre"],
      };
      expect(generateReferences(generic, contrib)).toEqual([
        ...ownReferences,
        { title: "Article L3141-2", url: "https://legi/L3141-2" },
        { title: "Autre", url: "https://autre" },
      ]);
    });

    it("ignore une référence cochée qui n'existe plus dans la réponse générique", () => {
      const contrib: any = {
        questionIndex: 1,
        contentType: "ANSWER",
        references: ownReferences,
        includedCdtReferences: ["https://supprimee"],
      };
      expect(generateReferences(generic, contrib)).toEqual(ownReferences);
    });

    it("n'ajoute pas de doublon avec les références de la CC", () => {
      const contrib: any = {
        questionIndex: 1,
        contentType: "ANSWER",
        references: [{ title: "Déjà là", url: "https://legi/L3141-1" }],
        includedCdtReferences: ["https://legi/L3141-1"],
      };
      expect(generateReferences(generic, contrib)).toEqual([
        { title: "Déjà là", url: "https://legi/L3141-1" },
      ]);
    });

    it("ne fait rien si la réponse générique n'a pas de réponse", () => {
      const contrib: any = {
        questionIndex: 1,
        contentType: "ANSWER",
        references: ownReferences,
        includedCdtReferences: ["https://legi/L3141-1"],
      };
      expect(
        generateReferences({ ...generic, type: "generic-no-cdt" }, contrib)
      ).toEqual(ownReferences);
    });
  });

  it("garde le comportement actuel pour NOTHING : toutes les références du Code du travail", () => {
    const contrib: any = {
      questionIndex: 1,
      contentType: "NOTHING",
      references: [{ title: "ref1", url: "ref1" }],
      includedCdtReferences: ["cdtRef1"],
    };
    const generic: any = {
      questionIndex: 1,
      idcc: "0000",
      references: [
        { title: "cdtRef1", url: "cdtRef1" },
        { title: "cdtRef2", url: "cdtRef2" },
      ],
    };
    expect(generateReferences(generic, contrib)).toEqual([
      { title: "ref1", url: "ref1" },
      { title: "cdtRef1", url: "cdtRef1" },
      { title: "cdtRef2", url: "cdtRef2" },
    ]);
  });
});
