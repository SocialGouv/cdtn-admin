import { HasuraDocument } from "@shared/types";
import { gql, useQuery } from "urql";
import Link from "next/link";
import { Card, CardContent, Typography } from "@mui/material";
import { FixedSnackBar } from "../utils/SnackBar";
import React from "react";
import { theme } from "src/theme";

export const getGhostDocumentQuery = gql`
  query ghostDocuments {
    relations: document_relations(
      where: {
        b: {
          _or: [
            { is_published: { _eq: false } }
            { is_available: { _eq: false } }
          ]
        }
      }
      order_by: [
        { a: { source: asc } }
        { b: { is_available: asc } }
        { b: { is_published: asc } }
        { b: { source: asc } }
        { b: { title: asc } }
      ]
    ) {
      id
      type
      parent: a {
        cdtn_id
        initial_id
        source
        title
      }
      document: b {
        cdtn_id
        title
        source
        is_available
        is_published
      }
    }
  }
`;

export type ParentRef = Pick<HasuraDocument, "cdtn_id" | "title" | "source">;
export type DocumentRef = Pick<
  HasuraDocument,
  | "cdtn_id"
  | "initial_id"
  | "title"
  | "source"
  | "is_available"
  | "is_published"
>;

export type GhostRelation = {
  type: string;
  id: string;
  parent: DocumentRef;
  document: DocumentRef;
};

export type GhostDocumentQueryResult = {
  relations: GhostRelation[];
};

export function GhostLinkedDocuments(): JSX.Element | null {
  const [result] = useQuery<GhostDocumentQueryResult>({
    query: getGhostDocumentQuery,
    requestPolicy: "cache-and-network",
  });

  const { fetching, error, data } = result;

  if (fetching || data?.relations.length === 0) {
    return null;
  }
  if (error) {
    return (
      <FixedSnackBar>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </FixedSnackBar>
    );
  }
  return (
    <Link href="/ghost-documents" passHref style={{ textDecoration: "none" }}>
      <Card>
        <CardContent>
          <Typography
            align="right"
            variant="h2"
            sx={{
              fontSize: theme.fontSizes.xxlarge,
              fontWeight: "600",
              color: theme.colors.secondary,
            }}
          >
            {data?.relations.length}
          </Typography>
          <Typography sx={{ textAlign: "right" }}>
            Références inaccessibles
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
