import { EditorialContent, EditorialContentDoc } from "@shared/types";
import { Client } from "urql";

import {
  AggregateNotFoundException,
  AggregatePersistException,
} from "../../../cqrs/CommandErrors";
import {
  selectEditorialContentGraphql,
  SelectEditorialContentRequest,
  SelectEditorialContentResponse,
} from "./SelectEditorialContent.graphql";
import {
  updateEditorialContentGraphql,
  UpdateEditorialContentRequest,
  UpdateEditorialContentResponse,
} from "./UpdateEditorialContent.graphql";

export default class EditorialContentRepository {
  constructor(private gqlClient: Client) {}

  async load(
    userToken: string,
    cdtnId: string
  ): Promise<EditorialContent | null> {
    const result = await this.gqlClient
      .mutation<SelectEditorialContentResponse, SelectEditorialContentRequest>(
        selectEditorialContentGraphql,
        {
          id: cdtnId,
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

    if (result.error) {
      throw new AggregateNotFoundException(cdtnId);
    }
    return result.data?.content ?? null;
  }

  async save(
    userToken: string,
    cdtnId: string,
    metaDescription: string,
    slug: string,
    title: string,
    document: EditorialContentDoc
  ): Promise<EditorialContent> {
    const result = await this.gqlClient
      .mutation<UpdateEditorialContentResponse, UpdateEditorialContentRequest>(
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
      throw new AggregatePersistException(
        cdtnId,
        result.error?.message ?? "data is empty"
      );
    }

    return result.data.content;
  }
}
