import type { BaseRef } from "@shared/types";
import { ExternalRef } from "@shared/types";

import type { AnswerRaw } from "./types";
import { IndexedAgreement } from "@socialgouv/kali-data-types";
import slugify from "@socialgouv/cdtn-slugify";
import { AnswerWithCC, GenericAnswer } from "../../index";

const HTML_TAGS = /<[^>]*>?/gm;

export class AnswerExtractor {
  constructor(agreements: IndexedAgreement[]) {
    this.agreements = agreements;
  }

  public extractGenericAnswer(answers: AnswerRaw[]): GenericAnswer {
    const genericAnswer = answers.find(
      (answer) => answer.agreement.id === "0000"
    );
    if (!genericAnswer) {
      throw new Error("No generic answer found");
    }
    const genericTextAnswer = this.toText(genericAnswer);
    const answer: GenericAnswer = {
      id: genericAnswer.id,
      description:
        genericTextAnswer.slice(0, genericTextAnswer.indexOf(" ", 150)) + "…",
      contentType: genericAnswer.contentType,
      references: this.aggregateReferences(genericAnswer).sort(
        this.sortBy("title")
      ),
      linkedContent: this.mapCdtnRefs(genericAnswer.cdtn_references),
      text: genericTextAnswer,
    };
    if (answer.contentType === "ANSWER") {
      answer.content = genericAnswer.content;
    }
    return answer;
  }

  private mapKaliRefs = (idcc: string, references: any[]): ExternalRef[] => {
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
      };
    });
  };

  private mapLegiRefs = (references: any[]): ExternalRef[] => {
    if (!references.length) return [];

    return references.map((ref) => {
      return {
        title: ref.legi_article.title,
        url: "/code-du-travail/" + slugify(ref.legi_article.title),
      };
    });
  };

  private mapOtherRefs = (references: any[]): ExternalRef[] => {
    if (!references.length) return [];

    return references.map((ref: ExternalRef) => {
      if (!ref.url) delete ref.url;
      return ref;
    });
  };

  private mapCdtnRefs = (references: any[]): BaseRef[] => {
    if (!references.length) return [];

    return references
      .map((ref) => {
        return ref.document as BaseRef;
      })
      .sort(this.sortBy("title"));
  };

  private aggregateReferences(answer: AnswerRaw): ExternalRef[] {
    return this.mapKaliRefs(answer.agreement.id, answer.kali_references)
      .concat(this.mapLegiRefs(answer.legi_references))
      .concat(this.mapOtherRefs(answer.other_references)); // je n'ai pas fait le mapping parce qu'on a besoin du package packages/code-du-travail-utils/src/sources.ts utilisé seulement dans le front
  }

  public extractAgreementAnswers(answers: AnswerRaw[]): AnswerWithCC[] {
    return answers
      .map((answer) => {
        const formatted: AnswerWithCC = {
          id: answer.id,
          idcc: answer.agreement.id,
          shortName: answer.agreement.name,
          contentType: answer.contentType,
          references: this.aggregateReferences(answer).sort(
            this.sortBy("title")
          ),
          linkedContent: this.mapCdtnRefs(answer.cdtn_references),
        };
        if (answer.contentType === "ANSWER") {
          formatted.content = answer.content;
        }

        return formatted;
      })
      .sort(this.sortBy("idcc"));
  }

  private toText = (answer: AnswerRaw): string =>
    (answer.content || "").replace(HTML_TAGS, "").replace(/&nbsp;/gm, " ");

  private readonly comparableIdcc = (num: number | string): number =>
    parseInt(num.toString(), 10);

  private readonly sortBy =
    <T, K extends keyof T>(key: K) =>
    (a: T, b: T): number =>
      `${a[key]}`.localeCompare(`${b[key]}`);

  private readonly agreements: IndexedAgreement[];
}
