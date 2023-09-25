import type {
  Answer,
  BaseRef,
  ContributionReference,
  GenericAnswer,
} from "@shared/types";

import type { AnswerRaw } from "./types"; // Unified works only with require
import { IndexedAgreement } from "@socialgouv/kali-data-types"; // eslint-disable-next-line @typescript-eslint/no-require-imports
import slugify from "@socialgouv/cdtn-slugify";

export class AnswerExtractor {
  constructor(agreements: IndexedAgreement[]) {
    this.agreements = agreements;
  }

  public extractGenericAnswer(answers: AnswerRaw[]): GenericAnswer | null {
    const genericAnswer = answers.find(
      (answer) => answer.agreement.id === "0000"
    );
    if (!genericAnswer) {
      return null;
    }
    const genericTextAnswer = this.toText(genericAnswer);
    return {
      description:
        genericTextAnswer.slice(0, genericTextAnswer.indexOf(" ", 150)) + "…",
      id: genericAnswer.id,
      content: genericAnswer.content,
      references: this.aggregateReferences(genericAnswer),
      text: genericTextAnswer, // Utilisé pour générer la page contribution TODO: à enlever si plus nécessaire
    };
  }

  private mapKaliRefs = (
    idcc: string,
    references: any[]
  ): ContributionReference[] => {
    if (!references.length) return [];
    const agreement = this.agreements.find(
      (item) => this.comparableIdcc(item.num) === this.comparableIdcc(idcc)
    );
    if (!agreement) {
      throw new Error(`agreement ${idcc} not found `);
    }
    return references.map((ref) => {
      return {
        title: ref.title,
        url: `https://legifrance.gouv.fr/conv_coll/id/${ref.kali_article.id}/?idConteneur=${agreement.id}`,
      } as BaseRef;
    });
  };

  private mapLegiRefs = (references: any[]): ContributionReference[] => {
    if (!references.length) return [];

    return references.map((ref) => {
      return {
        title: ref.legi_article.title,
        url: "/code-du-travail/" + slugify(ref.legi_article.title),
      } as BaseRef;
    });
  };

  private mapOtherRefs = (references: any[]): ContributionReference[] => {
    if (!references.length) return [];

    return references.map((ref) => {
      if (!ref.url) delete ref.url;
      return ref as BaseRef;
    });
  };

  private mapCdtnRefs = (references: any[]): ContributionReference[] => {
    if (!references.length) return [];

    return references.map((ref) => {
      return ref.document as BaseRef;
    });
  };

  private aggregateReferences(answer: AnswerRaw): ContributionReference[] {
    return this.mapKaliRefs(answer.agreement.id, answer.kali_references)
      .concat(this.mapLegiRefs(answer.legi_references))
      .concat(this.mapOtherRefs(answer.other_references))
      .concat(this.mapCdtnRefs(answer.cdtn_references)); // je n'ai pas fait le mapping parce qu'on a besoin du package packages/code-du-travail-utils/src/sources.ts utilisé seulement dans le front
  }

  public extractAgreementAnswers(answers: AnswerRaw[]): Answer[] {
    return answers
      .map((answer) => ({
        id: answer.id,
        idcc: answer.agreement.id,
        shortName: answer.agreement.name,
        content: answer.content,
        otherAnswer: answer.otherAnswer, // on renomerait pas ce champs ici ?
        references: this.aggregateReferences(answer).sort(this.sortBy("title")),
      }))
      .sort(this.sortBy("idcc"));
  }

  private toText = (answer: AnswerRaw): string =>
    (answer.content || "").replace(/<[^>]*>?/gm, "").replace(/&nbsp;/gm, " ");

  private readonly comparableIdcc = (num: number | string): number =>
    parseInt(num.toString(), 10);

  private readonly sortBy =
    <T, K extends keyof T>(key: K) =>
    (a: T, b: T): number =>
      `${a[key]}`.localeCompare(`${b[key]}`);

  private readonly agreements: IndexedAgreement[];
}
