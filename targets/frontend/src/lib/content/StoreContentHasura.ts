import { Client } from "urql";

import { EventHandler } from "../cqrs";
import { InformationPageUpdated } from "./informations/events";
import {
  EditorialContentRequest,
  EditorialContentResponse,
  updateEditorialContentGraphql,
} from "./informations/updateInformation.graphql";

export class StoreContentHasura
  implements EventHandler<InformationPageUpdated>
{
  constructor(private gqlClient: Client) {}

  type(): "information-page-updated" {
    return "information-page-updated";
  }

  async on({
    cdtnId,
    document,
    metaDescription,
    slug,
    title,
    userToken,
  }: InformationPageUpdated): Promise<void> {
    const result = await this.gqlClient
      .mutation<EditorialContentResponse, EditorialContentRequest>(
        updateEditorialContentGraphql,
        {
          cdtnId,
          document,
          metaDescription,
          slug,
          title,
        },
        {
          fetchOptions: {
            headers: {
              authorization: userToken,
            },
          },
        }
      )
      .toPromise();

    if (result.error || !result.data?.content) {
      throw Error(result.error?.message ?? "data is empty");
    }
    console.log(`Data has been saved: ${result.data.content.slug}`);
  }
}
