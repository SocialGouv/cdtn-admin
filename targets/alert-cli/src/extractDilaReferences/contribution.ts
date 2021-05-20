import type { ContributionComplete, ContributionFiltered } from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";

import type { DocumentReferences } from "../types";
import { getAllDocumentsBySource } from "./getAllDocumentsBySource";

let references: DocumentReferences[] = [];

export type Contrib = Pick<
  ContributionComplete | ContributionFiltered,
  "document" | "source" | "title"
> & {
  id: string;
  cdtnId: string;
};

export function extractContributionsRef(questions: Contrib[]) {
  const refs: DocumentReferences[] = [];

  for (const question of questions) {
    references.push({
      document: {
        id: question.id,
        source: SOURCES.CONTRIBUTIONS,
        title: question.title,
      },
      references: question.document.answers.generic.references.flatMap(
        (ref) => {
          if (ref.category === null) {
            return [];
          }
          return [
            {
              dila_cid: ref.dila_cid,
              dila_id: ref.dila_id,
              title: ref.title,
              url: ref.url,
            },
          ];
        }
      ),
    });
    if (
      !Object.prototype.hasOwnProperty.call(
        question.document.answers,
        "conventions"
      )
    ) {
      continue;
    }
    if (question.document.split) {
      continue;
    }
    question.document.answers.conventions.forEach((answer) =>
      refs.push({
        document: {
          id: answer.id,
          source: SOURCES.CONTRIBUTIONS,
          title: question.title,
        },
        references: answer.references.flatMap((ref) => {
          if (ref.category === null) return [];
          return [ref];
        }),
      })
    );
  }
  return refs;
}

export default async function main(): Promise<DocumentReferences[]> {
  if (references.length === 0) {
    const contributions = (await getAllDocumentsBySource(
      SOURCES.CONTRIBUTIONS
    )) as Contrib[];
    references = extractContributionsRef(contributions);
  }
  return references;
}
