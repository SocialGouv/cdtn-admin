import { ContributionDocumentJson } from "@socialgouv/cdtn-types";
import {
  getTodayInParis,
  hasContributionContentChanged,
} from "../hasContributionContentChanged";

const baseDoc = {
  type: "content",
  content: "<p>Contenu</p>",
  contentWithGlossary: "<p>Contenu</p>",
  date: "11/07/2024",
  contentType: "ANSWER",
  linkedContent: [{ cdtnId: "abcdef" }],
  infographics: [{ infographicId: "info-1" }],
  references: [{ url: "https://example.com", title: "Référence" }],
  questionIndex: 43,
  questionName: "Question ?",
  seoTitle: "Titre SEO",
  questionId: "question-id",
  idcc: "0016",
  description: "Description",
} as ContributionDocumentJson;

describe("hasContributionContentChanged", () => {
  it("renvoie true en première publication", () => {
    expect(hasContributionContentChanged(undefined, baseDoc)).toBe(true);
  });

  it("renvoie false si le document est identique", () => {
    expect(hasContributionContentChanged(baseDoc, { ...baseDoc })).toBe(false);
  });

  it("ignore la date, le glossaire et les métadonnées de la question", () => {
    const next = {
      ...baseDoc,
      date: "01/01/2026",
      contentWithGlossary: "<p><webcomponent-tooltip>Contenu</p>",
      questionIndex: 44,
      questionName: "Question renommée ?",
      seoTitle: "Nouveau titre SEO",
      questionId: "other-question-id",
      idcc: "0044",
    } as ContributionDocumentJson;
    expect(hasContributionContentChanged(baseDoc, next)).toBe(false);
  });

  it.each([
    ["content", "<p>Nouveau contenu</p>"],
    ["description", "Nouvelle description"],
    ["references", [{ url: "https://example.com/2", title: "Autre" }]],
    ["infographics", []],
    ["linkedContent", [{ cdtnId: "ghijkl" }]],
    ["messageBlockGenericNoCDT", "Message"],
    ["contentType", "CDT"],
  ])("renvoie true si %s change", (field, value) => {
    const next = { ...baseDoc, [field]: value } as ContributionDocumentJson;
    expect(hasContributionContentChanged(baseDoc, next)).toBe(true);
  });

  it("considère null et undefined comme équivalents", () => {
    const previous = {
      ...baseDoc,
      infographics: undefined,
      seoTitle: undefined,
    } as ContributionDocumentJson;
    const next = {
      ...baseDoc,
      infographics: null,
      messageBlockGenericNoCDT: null,
    } as unknown as ContributionDocumentJson;
    expect(hasContributionContentChanged(previous, next)).toBe(false);
  });

  it("ignore l'ordre des clés (jsonb)", () => {
    const previous = {
      ...baseDoc,
      references: [{ title: "Référence", url: "https://example.com" }],
    } as ContributionDocumentJson;
    expect(hasContributionContentChanged(previous, baseDoc)).toBe(false);
  });
});

describe("getTodayInParis", () => {
  it("renvoie la date du jour à Paris au format yyyy-MM-dd", () => {
    expect(getTodayInParis(new Date("2026-10-16T10:00:00Z"))).toBe(
      "2026-10-16"
    );
  });

  it("bascule au lendemain après minuit heure de Paris", () => {
    expect(getTodayInParis(new Date("2026-10-16T22:30:00Z"))).toBe(
      "2026-10-17"
    );
  });
});
