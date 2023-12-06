import type { DocumentReferences } from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { queryContributionsReferences } from "./queryContributionsReferences";
import { generateKaliRef, generateLegiRef } from "@shared/utils";

export async function getContributionsReferences(): Promise<
  DocumentReferences[]
> {
  const contributions = await queryContributionsReferences();
  const refs: DocumentReferences[] = [];

  contributions.forEach((contribution) => {
    const kaliReferences = contribution.kali_references.map((ref) => ({
      dila_cid: ref.kali_article.cid,
      dila_container_id: ref.kali_article.cid,
      dila_id: ref.kali_article.id,
      title: ref.kali_article.label,
      url: generateKaliRef(ref.kali_article.id, ref.kali_article.agreement_id),
    }));

    const legiReferences = contribution.legi_references.map((ref) => ({
      dila_cid: ref.legi_article.cid,
      dila_container_id: ref.legi_article.cid,
      dila_id: ref.legi_article.id,
      title: ref.legi_article.label,
      url: generateLegiRef(ref.legi_article.label),
    }));

    const references = [...kaliReferences, ...legiReferences];

    refs.push({
      document: {
        id: contribution.id,
        source: SOURCES.CONTRIBUTIONS,
        title: contribution.question.content,
      },
      references,
    });
  });

  return refs;
}