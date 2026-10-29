import { useMemo } from "react";
import { useQuery } from "urql";

import {
  buildCdtReferenceItems,
  CdtReferenceItem,
  GenericReferences,
} from "./cdtReferences";

const genericCdtReferencesQuery = `
query contribution_generic_cdt_references($questionId: uuid) {
  contribution_answers(where: {question_id: {_eq: $questionId}, agreement_id: {_eq: "0000"}}) {
    id
    legiReferences: legi_references {
      legiArticle: legi_article {
        label
      }
    }
    otherReferences: other_references {
      label
      url
    }
  }
}
`;

type QueryResult = {
  contribution_answers: (GenericReferences & { id: string })[];
};

type Result = {
  genericAnswerId?: string;
  items: CdtReferenceItem[];
  loaded: boolean;
};

/** Références (articles, autres) de la réponse générique de la question. */
export const useGenericCdtReferences = (questionId?: string): Result => {
  const [{ data, fetching }] = useQuery<QueryResult>({
    query: genericCdtReferencesQuery,
    variables: { questionId },
    pause: !questionId,
    requestPolicy: "cache-and-network",
  });
  const generic = data?.contribution_answers[0];
  const items = useMemo(() => buildCdtReferenceItems(generic), [generic]);
  return {
    genericAnswerId: generic?.id,
    items,
    loaded: !!data && !fetching,
  };
};
