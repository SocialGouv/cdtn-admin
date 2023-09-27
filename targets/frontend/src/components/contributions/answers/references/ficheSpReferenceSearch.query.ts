import { Document } from "../../type";
import { Result } from "./ReferenceInput";
import {
  SearchCdtnReferencesQuery,
  SearchCdtnReferencesQueryResult,
  getNormalizedTitle,
  getSlugThanksToQuery,
} from "./cdtnReferencesSearch.query";
import { useQuery } from "urql";

export const useFicheSpSearchCdtnReferencesQuery = (
  query: string | undefined
): Result<Document> => {
  const slug = getSlugThanksToQuery(query);
  const title = getNormalizedTitle(slug);
  const [{ data, fetching, error }] = useQuery<SearchCdtnReferencesQueryResult>(
    {
      query: SearchCdtnReferencesQuery,
      variables: {
        sources: ["fiches_service_public"],
        slug,
        title,
      },
    }
  );
  return {
    data: data?.documents ?? [],
    error,
    fetching,
  };
};
