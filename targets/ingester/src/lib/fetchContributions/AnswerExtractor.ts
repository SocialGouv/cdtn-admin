import type {
  Answer,
  ContributionReference,
  GenericAnswer,
} from "@shared/types";
import remark from "remark";
import strip from "strip-markdown";

import type { AgreementAnswerRaw, AnswerRaw } from "./types";
import { IndexedAgreement } from "@socialgouv/kali-data-types";
// Unified works only with require
// eslint-disable-next-line @typescript-eslint/no-require-imports
import unified = require("unified");

export class AnswerExtractor {
  constructor(agreements: IndexedAgreement[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.mdStriper = remark().use(strip as any) as any;
    this.agreements = agreements;
  }

  public extractGenericAnswer(answers: AnswerRaw[]): GenericAnswer | null {
    const genericAnswer = answers.find((answer) => answer.agreement === null);
    if (!genericAnswer) {
      return null;
    }
    const genericTextAnswer = this.genericTextAnswer(genericAnswer);
    return {
      description:
        genericTextAnswer.slice(0, genericTextAnswer.indexOf(" ", 150)) + "…",
      id: genericAnswer.id,
      markdown: genericAnswer.markdown,
      references: genericAnswer.references,
      text: genericTextAnswer,
    };
  }

  public extractAgreementAnswers(answers: AnswerRaw[]): Answer[] {
    return this.filterAgreementAnswers(answers)
      .map((answer) => ({
        id: answer.id,
        idcc: answer.agreement.idcc,
        markdown: answer.markdown,
        references: answer.references
          .map(this.createGetRefUrl(answer.agreement.idcc))
          .sort(this.sortBy("title")),
      }))
      .sort(this.sortBy("idcc"));
  }

  private filterAgreementAnswers(answers: AnswerRaw[]): AgreementAnswerRaw[] {
    return answers.filter(
      (answer) =>
        answer.agreement !== null && this.hasAgreement(answer.agreement.idcc)
    ) as AgreementAnswerRaw[];
  }

  private hasAgreement(idcc: string): boolean {
    const agreement = this.agreements.find(
      (convention) =>
        this.comparableIdcc(convention.num) === this.comparableIdcc(idcc)
    );
    return !!agreement;
  }

  private createGetRefUrl(
    idcc: string
  ): (ref: ContributionReference) => ContributionReference {
    const agreement = this.agreements.find(
      (item) => this.comparableIdcc(item.num) === this.comparableIdcc(idcc)
    );
    if (!agreement) {
      throw new Error(`agreement ${idcc} not found `);
    }
    return function getRefUrl(reference) {
      switch (reference.category) {
        case "agreement": {
          if (reference.dila_id) {
            reference.url = `https://legifrance.gouv.fr/conv_coll/id/${reference.dila_id}/?idConteneur=${agreement.id}`;
          } else if (agreement.url) {
            reference.url = agreement.url;
          }
          return reference;
        }
        case "labor_code": {
          if (reference.dila_id) {
            reference.url = `https://legifrance.gouv.fr/codes/id/${reference.dila_id}`;
          } else {
            reference.url =
              "https://www.legifrance.gouv.fr/codes/id/LEGITEXT000006072050";
          }
          return reference;
        }
        case null: /* Nothing to do */
      }

      return reference;
    };
  }

  private genericTextAnswer(genericAnswer: AnswerRaw): string {
    try {
      return this.mdStriper
        .processSync(genericAnswer.markdown)
        .toString()
        .replace(/(\s)\s+/, "$1")
        .trim() as unknown as string;
    } catch (e) {
      console.error(genericAnswer);
      console.error(this.mdStriper.processSync(genericAnswer.markdown));
      throw e;
    }
  }

  private readonly comparableIdcc = (num: number | string): number =>
    parseInt(num.toString(), 10);

  private readonly sortBy =
    <T, K extends keyof T>(key: K) =>
    (a: T, b: T): number =>
      `${a[key]}`.localeCompare(`${b[key]}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly mdStriper: unified.Processor<any>;

  private readonly agreements: IndexedAgreement[];
}
