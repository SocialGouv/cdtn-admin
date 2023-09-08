import { useQuery } from "urql";
import { format, parseISO } from "date-fns";

import { Information } from "../type";

const informationsQuery = `query informations($id: uuid) {
  information_informations(
      where: {
        id: { _eq: $id }
      }
    ) {
        cdtnId: cdtn_id
        description
        id
        intro
        metaDescription: meta_description
        metaTitle: meta_title
        referenceLabel: reference_label
        sectionDisplayMode: section_display_mode
        title
        updatedAt: updated_at
    }
  }`;

export type QueryInformation = Information;

export type QueryResult = {
  information_informations: QueryInformation[];
};

export type InformationsQueryProps = {
  id?: string;
};

export type InformationsQueryResult = Information & {
  updateDate: string;
};

export const useInformationsQuery = ({
  id,
}: InformationsQueryProps): InformationsQueryResult | undefined => {
  const [result] = useQuery<QueryResult>({
    query: informationsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      id,
    },
  });
  const information = result.data?.information_informations[0];
  if (!information) {
    return;
  }
  return {
    ...information,
    updateDate: format(parseISO(information.updatedAt), "dd/MM/yyyy"),
  };
};
