import type { DocumentReferences } from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import memoizee from "memoizee";
import { getContributionsWithReferences } from "./getContributionsReferences";

export async function getContributionReferences(): Promise<
  DocumentReferences[]
> {
  const contributions = await getContributionsWithReferences();
  const refs: DocumentReferences[] = [];

  contributions.forEach((contribution) => {
    const kaliReferences = contribution.kali_references.map((ref) => ({
      dila_cid: ref.kali_article.cid,
      dila_container_id: ref.kali_article.cid,
      dila_id: ref.kali_article.id,
      title: ref.kali_article.label ?? "",
      url: "",
    }));

    const legiReferences = contribution.legi_references.map((ref) => ({
      dila_cid: ref.legi_article.cid,
      dila_container_id: ref.legi_article.cid,
      dila_id: ref.legi_article.id,
      title: ref.legi_article.label,
      url: "",
    }));

    const ficheSpReferences = contribution.fiche_sp
      ? [
          {
            dila_cid: contribution.fiche_sp.initial_id,
            dila_container_id: contribution.fiche_sp.initial_id,
            dila_id: contribution.fiche_sp.cdtn_id,
            title: contribution.fiche_sp.initial_id,
            url: "",
          },
        ]
      : [];

    const references = [
      ...kaliReferences,
      ...legiReferences,
      ...ficheSpReferences,
    ];

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

export default memoizee(getContributionReferences, { promise: true });
