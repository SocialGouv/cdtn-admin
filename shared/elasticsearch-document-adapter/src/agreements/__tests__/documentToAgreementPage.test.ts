import { AgreementDoc, ArticleTheme } from "@shared/types";
import { documentToAgreementPage } from "../exportMapping";
import { DocumentElasticWithSource } from "../../types/Glossary";

const contributions = [
  {
    index: 34,
    split: true,
    answers: { generic: [Object], conventionAnswer: [Object] },
    description:
      "Le préavis de démission doit être exécuté en totalité par l’employeur et le salarié, y compris si le salarié a retrouvé un emploi. Mais, le préavis n’est…",
    breadcrumbs: [],
    cdtnId: "13c6756124",
    excludeFromSearch: true,
    id: "b0ac8ee0-7263-467f-8dff-44fb13b8b694",
    isPublished: true,
    metaDescription:
      "Le préavis de démission doit être exécuté en totalité par l’employeur et le salarié, y compris si le salarié a retrouvé un emploi. Mais, le préavis n’est…",
    refs: [],
    slug: "1315-le-preavis-de-demission-doit-il-etre-execute-en-totalite-y-compris-si-le-salarie-a-retrouve-un-emploi",
    source: "contributions",
    text: "1315 Le préavis de démission doit-il être exécuté en totalité ? Y compris si le salarié a retrouvé un emploi ?",
    title:
      "Le préavis de démission doit-il être exécuté en totalité ? Y compris si le salarié a retrouvé un emploi ?",
  },
  {
    index: 42,
    split: true,
    answers: { generic: [Object], conventionAnswer: [Object] },
    description:
      "Si la convention ou l'accord collectif ou les usages prévoient des conditions plus favorables pour le salarié, l'employeur applique ces dernières.\n" +
      "\n" +
      "Exemple…",
    breadcrumbs: [],
    cdtnId: "13cced485f",
    excludeFromSearch: true,
    id: "40e33c90-2c2c-42c7-bf74-e7cb4756de17",
    isPublished: true,
    metaDescription:
      "Si la convention ou l'accord collectif ou les usages prévoient des conditions plus favorables pour le salarié, l'employeur applique ces dernières. \n" +
      "\n" +
      "Exemple…",
    refs: [],
    slug: "1885-a-quelles-indemnites-peut-pretendre-un-salarie-qui-part-a-la-retraite",
    source: "contributions",
    text: "1885 À quelles indemnités peut prétendre un salarié qui part à la retraite ?",
    title:
      "À quelles indemnités peut prétendre un salarié qui part à la retraite ?",
  },
];

const ccnPage: DocumentElasticWithSource<AgreementDoc> = {
  articleByTheme: [
    {
      // @ts-ignore
      articles: [
        {
          cid: "",
          id: "",
          section: "",
          title: "",
        },
      ],
      bloc: "string",
    },
  ],
  breadcrumbs: [],
  cdtnId: "",
  description: "",
  id: "",
  excludeFromSearch: false,
  highlight: "",
  isPublished: true,
  metaDescription: "",
  num: 13,
  refs: [],
  shortTitle: "",
  slug: "",
  source: "",
  text: "",
};

describe("documentToAgreementPage", () => {
  test("test", () => {
    const result = documentToAgreementPage(
      ccnPage,
      contributions,
      new Set([1, 2]),
      (content) => content
    );
    expect(result).toBeDefined();
  });
});
