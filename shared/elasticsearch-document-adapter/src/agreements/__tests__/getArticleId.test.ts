import { getArticleIds } from "../getAgreementsArticlesByTheme";

describe(`getArticleIds`, () => {
  it.each([
    [
      {
        kali_blocks: [
          {
            id: "KALICONT000005635534",
            blocks: {
              "1": [
                "KALIARTI000005826303",
                "KALIARTI000045457447",
                "KALIARTI000048150975",
              ],
              "2": ["KALIARTI000046601745", "KALIARTI000046478212"],
              "3": [],
              "4": [],
              "5": ["KALIARTI000005826305"],
              "6": [
                "KALIARTI000005826283",
                "KALIARTI000005826279",
                "KALIARTI000005826281",
              ],
              "7": [],
              "8": [],
              "9": ["KALIARTI000005826267"],
              "10": [],
              "11": ["KALIARTI000027792260"],
              "12": [],
              "13": [],
              "14": [],
              "15": ["KALIARTI000005826273"],
              "16": [],
              "17": [],
            },
          },
        ],
      },
      [
        "KALIARTI000005826303",
        "KALIARTI000045457447",
        "KALIARTI000048150975",
        "KALIARTI000046601745",
        "KALIARTI000046478212",
        "KALIARTI000005826305",
        "KALIARTI000005826283",
        "KALIARTI000005826279",
        "KALIARTI000005826281",
        "KALIARTI000005826267",
        "KALIARTI000027792260",
        "KALIARTI000005826273",
      ],
    ],
  ])("return all the articles", async (data, res) => {
    const received = await getArticleIds(data);
    expect(received).toEqual(res);
  });
});
