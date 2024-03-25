import { gqlClient } from "@shared/utils";
import { HasuraDocumentWithRelations } from "./getDocumentQuery.gql";

const fetchPrequalifiedQuery = `
query fetch_prequalified {
    search_prequalified {
        cdtnId: id
        title
        contentRelations: documents(order_by: {order: asc}) {
            position: order
            document {
                initialId: initial_id
                slug
                source
                title
            }
        }
    }
}
`;

interface HasuraReturn {
  search_prequalified: HasuraDocumentWithRelations[] | undefined;
}

export async function fetchPrequalified(): Promise<
  HasuraDocumentWithRelations[] | undefined
> {
  const res = await gqlClient()
    .query<HasuraReturn>(fetchPrequalifiedQuery)
    .toPromise();
  if (res.error) {
    throw res.error;
  }

  return res.data?.search_prequalified?.map((prequalif) => ({
    ...prequalif,
    isPublished: true,
    source: "prequalified",
  }));
}
