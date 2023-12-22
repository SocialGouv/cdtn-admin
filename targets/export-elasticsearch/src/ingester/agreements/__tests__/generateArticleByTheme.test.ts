import { generateArticleByTheme } from "../getAgreementsArticlesByTheme";

describe(`generateArticleByTheme`, () => {
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
      {
        kali_articles: [
          {
            id: "KALIARTI000027792260",
            cid: "KALIARTI000027792246",
            label: "Article 12.1",
            section:
              "Changement de prestataire et continuité du contrat de travail",
          },
          {
            id: "KALIARTI000005826281",
            cid: "KALIARTI000005826280",
            label: "Article 21",
            section: "Temps de travail dans l'industrie hôtelière",
          },
          {
            id: "KALIARTI000005826267",
            cid: "KALIARTI000005826267",
            label: "Article 11",
            section: "Égalité professionnelle entre hommes et femmes",
          },
          {
            id: "KALIARTI000005826283",
            cid: "KALIARTI000005826282",
            label: "Article 22",
            section: "Aménagement du temps de travail",
          },
          {
            id: "KALIARTI000046601745",
            cid: "KALIARTI000005826301",
            label: "Article 34",
            section: "Classifications",
          },
          {
            id: "KALIARTI000005826303",
            cid: "KALIARTI000005826302",
            label: "Article 35",
            section: "Salaires",
          },
          {
            id: "KALIARTI000005826305",
            cid: "KALIARTI000005826304",
            label: "Titre X. Prévoyance",
            section: "Titre X. Prévoyance",
          },
          {
            id: "KALIARTI000045457447",
            cid: "KALIARTI000045457447",
            label: "Article 2",
            section: "Avenant n° 29 du 16 décembre 2021 relatif aux salaires",
          },
          {
            id: "KALIARTI000005826273",
            cid: "KALIARTI000005826273",
            label: "Article 16",
            section: "Travailleurs handicapés",
          },
          {
            id: "KALIARTI000005826279",
            cid: "KALIARTI000005826279",
            label: "Titre VI. Durée et aménagement du temps de travail",
            section: "Titre VI. Durée et aménagement du temps de travail",
          },
          {
            id: "KALIARTI000046478212",
            cid: "KALIARTI000046478212",
            label: "Annexes",
            section: "Annexes",
          },
          {
            id: "KALIARTI000048150975",
            cid: "KALIARTI000048150975",
            label: "Article 2",
            section: "Avenant n° 31 du 1er juin 2023 relatif aux salaires",
          },
        ],
      },
      [
        {
          bloc: "1",
          articles: [
            {
              id: "KALIARTI000005826303",
              cid: "KALIARTI000005826302",
              title: "35",
              section: "Salaires",
            },
            {
              id: "KALIARTI000045457447",
              cid: "KALIARTI000045457447",
              title: "2",
              section: "Avenant n° 29 du 16 décembre 2021 relatif aux salaires",
            },
            {
              id: "KALIARTI000048150975",
              cid: "KALIARTI000048150975",
              title: "2",
              section: "Avenant n° 31 du 1er juin 2023 relatif aux salaires",
            },
          ],
        },
        {
          bloc: "2",
          articles: [
            {
              id: "KALIARTI000046601745",
              cid: "KALIARTI000005826301",
              title: "34",
              section: "Classifications",
            },
            {
              id: "KALIARTI000046478212",
              cid: "KALIARTI000046478212",
              title: "non numéroté",
              section: "Annexes",
            },
          ],
        },
        {
          bloc: "5",
          articles: [
            {
              id: "KALIARTI000005826305",
              cid: "KALIARTI000005826304",
              title: "non numéroté",
              section: "Titre X. Prévoyance",
            },
          ],
        },
        {
          bloc: "6",
          articles: [
            {
              id: "KALIARTI000005826283",
              cid: "KALIARTI000005826282",
              title: "22",
              section: "Aménagement du temps de travail",
            },
            {
              id: "KALIARTI000005826279",
              cid: "KALIARTI000005826279",
              title: "non numéroté",
              section: "Titre VI. Durée et aménagement du temps de travail",
            },
            {
              id: "KALIARTI000005826281",
              cid: "KALIARTI000005826280",
              title: "21",
              section: "Temps de travail dans l'industrie hôtelière",
            },
          ],
        },
        {
          bloc: "9",
          articles: [
            {
              id: "KALIARTI000005826267",
              cid: "KALIARTI000005826267",
              title: "11",
              section: "Égalité professionnelle entre hommes et femmes",
            },
          ],
        },
        {
          bloc: "11",
          articles: [
            {
              id: "KALIARTI000027792260",
              cid: "KALIARTI000027792246",
              title: "12.1",
              section:
                "Changement de prestataire et continuité du contrat de travail",
            },
          ],
        },
        {
          bloc: "15",
          articles: [
            {
              id: "KALIARTI000005826273",
              cid: "KALIARTI000005826273",
              title: "16",
              section: "Travailleurs handicapés",
            },
          ],
        },
      ],
    ],
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
      {
        kali_articles: [
          {
            id: "KALIARTI000027792260",
            cid: "KALIARTI000027792246",
            label: "Article 12.1",
            section:
              "Changement de prestataire et continuité du contrat de travail",
          },
          {
            id: "KALIARTI000005826281",
            cid: "KALIARTI000005826280",
            label: "Article 21",
            section: "Temps de travail dans l'industrie hôtelière",
          },
          {
            id: "KALIARTI000005826267",
            cid: "KALIARTI000005826267",
            label: "Article 11",
            section: "Égalité professionnelle entre hommes et femmes",
          },
          {
            id: "KALIARTI000005826283",
            cid: "KALIARTI000005826282",
            label: "Article 22",
            section: "Aménagement du temps de travail",
          },
          {
            id: "KALIARTI000005826303",
            cid: "KALIARTI000005826302",
            label: "Article 35",
            section: "Salaires",
          },
          {
            id: "KALIARTI000005826305",
            cid: "KALIARTI000005826304",
            label: "Titre X. Prévoyance",
            section: "Titre X. Prévoyance",
          },
          {
            id: "KALIARTI000045457447",
            cid: "KALIARTI000045457447",
            label: "Article 2",
            section: "Avenant n° 29 du 16 décembre 2021 relatif aux salaires",
          },
          {
            id: "KALIARTI000005826273",
            cid: "KALIARTI000005826273",
            label: "Article 16",
            section: "Travailleurs handicapés",
          },
          {
            id: "KALIARTI000005826279",
            cid: "KALIARTI000005826279",
            label: "Titre VI. Durée et aménagement du temps de travail",
            section: "Titre VI. Durée et aménagement du temps de travail",
          },
          {
            id: "KALIARTI000048150975",
            cid: "KALIARTI000048150975",
            label: "Article 2",
            section: "Avenant n° 31 du 1er juin 2023 relatif aux salaires",
          },
        ],
      },
      [
        {
          bloc: "1",
          articles: [
            {
              id: "KALIARTI000005826303",
              cid: "KALIARTI000005826302",
              title: "35",
              section: "Salaires",
            },
            {
              id: "KALIARTI000045457447",
              cid: "KALIARTI000045457447",
              title: "2",
              section: "Avenant n° 29 du 16 décembre 2021 relatif aux salaires",
            },
            {
              id: "KALIARTI000048150975",
              cid: "KALIARTI000048150975",
              title: "2",
              section: "Avenant n° 31 du 1er juin 2023 relatif aux salaires",
            },
          ],
        },
        {
          bloc: "5",
          articles: [
            {
              id: "KALIARTI000005826305",
              cid: "KALIARTI000005826304",
              title: "non numéroté",
              section: "Titre X. Prévoyance",
            },
          ],
        },
        {
          bloc: "6",
          articles: [
            {
              id: "KALIARTI000005826283",
              cid: "KALIARTI000005826282",
              title: "22",
              section: "Aménagement du temps de travail",
            },
            {
              id: "KALIARTI000005826279",
              cid: "KALIARTI000005826279",
              title: "non numéroté",
              section: "Titre VI. Durée et aménagement du temps de travail",
            },
            {
              id: "KALIARTI000005826281",
              cid: "KALIARTI000005826280",
              title: "21",
              section: "Temps de travail dans l'industrie hôtelière",
            },
          ],
        },
        {
          bloc: "9",
          articles: [
            {
              id: "KALIARTI000005826267",
              cid: "KALIARTI000005826267",
              title: "11",
              section: "Égalité professionnelle entre hommes et femmes",
            },
          ],
        },
        {
          bloc: "11",
          articles: [
            {
              id: "KALIARTI000027792260",
              cid: "KALIARTI000027792246",
              title: "12.1",
              section:
                "Changement de prestataire et continuité du contrat de travail",
            },
          ],
        },
        {
          bloc: "15",
          articles: [
            {
              id: "KALIARTI000005826273",
              cid: "KALIARTI000005826273",
              title: "16",
              section: "Travailleurs handicapés",
            },
          ],
        },
      ],
    ],
  ])("generate the good object", async (data1, data2, res) => {
    const received = await generateArticleByTheme(data1, data2);
    expect(received).toEqual(res);
  });
});
