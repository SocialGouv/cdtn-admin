import { gql, useQuery } from "urql";
import {
  SETTINGS_CDTN_ID,
  SiteSettings,
  toSiteSettings,
} from "./mapSettingsToDocument";

const siteSettingsQuery = gql`
  query SiteSettings($cdtnId: String!) {
    documents_by_pk(cdtn_id: $cdtnId) {
      cdtn_id
      document
      updated_at
    }
  }
`;

type QueryResult = {
  documents_by_pk: {
    cdtn_id: string;
    document: Partial<SiteSettings> | null;
    updated_at: string;
  } | null;
};

export function useSiteSettingsQuery() {
  const [result, reexecute] = useQuery<QueryResult>({
    query: siteSettingsQuery,
    variables: { cdtnId: SETTINGS_CDTN_ID },
    requestPolicy: "cache-and-network",
  });

  return {
    settings: result.data
      ? toSiteSettings(result.data.documents_by_pk?.document)
      : undefined,
    updatedAt: result.data?.documents_by_pk?.updated_at,
    fetching: result.fetching,
    error: result.error,
    reexecute,
  };
}
