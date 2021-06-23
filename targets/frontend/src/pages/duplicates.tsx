/** @jsxImportSource theme-ui */

import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { ComponentPropsWithoutRef, useEffect, useState } from "react";
import type {
  DuplicateContentResult,
  DuplicateDocument,
  Relation,
} from "src/components/home/DuplicateItems";
import { getDuplicateQuery } from "src/components/home/DuplicateItems";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { RELATIONS } from "src/lib/relations";
import { css, Message, NavLink, Spinner, SxProp } from "theme-ui";
import { useQuery } from "urql";

import Source from "./contenus/create/[[...source]]";

export function DuplicateContentPage(): JSX.Element {
  const [duplicates, setDuplicates] = useState<Relation[]>([]);
  const [result] = useQuery<DuplicateContentResult>({
    query: getDuplicateQuery,
    requestPolicy: "cache-and-network",
    variables: {
      relationTypes: [RELATIONS.DOCUMENT_CONTENT, RELATIONS.THEME_CONTENT],
      sources: [SOURCES.THEMES, SOURCES.PREQUALIFIED],
    },
  });

  useEffect(() => {
    function getDoublons(t: DuplicateDocument) {
      const map = new Map();
      const found = [];
      for (const relation of t.relations) {
        if (map.has(relation.document.cdtn_id)) {
          if (map.get(relation.document.cdtn_id) === false) {
            found.push(relation);
          }
          map.set(relation.document.cdtn_id, true);
        } else {
          map.set(relation.document.cdtn_id, false);
        }
      }
      return found;
    }
    const duplicateDocs =
      result?.data?.documents.flatMap((t) => {
        const duplicates = getDoublons(t);
        if (duplicates.length > 0) {
          return duplicates;
        }
        return [];
      }) || [];
    setDuplicates(duplicateDocs);
  }, [result.data, setDuplicates]);

  const { data, fetching, error } = result;

  if (error) {
    return (
      <Layout title="Contenus dupliqués">
        <Stack>
          <Message>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </Message>
        </Stack>
      </Layout>
    );
  }
  return (
    <Layout title="Contenus dupliqués">
      <p>
        Il peut arriver que certains contenus apparaissent PLusieurs fois dans
        une requete préqualifiée ou un theme. Cette page permet de lister ces
        contenus afin de les corriger.
      </p>
      <Table>
        <thead>
          <tr>
            <Th align="left">Type</Th>
            <Th align="left">Parent</Th>
            <Th align="left">Fiche</Th>
          </tr>
        </thead>
        {!data && fetching && <Spinner />}
        {duplicates &&
          duplicates.map(({ parent, document }) => {
            return (
              <Tr
                key={`${parent.source}-${parent.cdtn_id}-${document.cdtn_id}`}
              >
                <Td>{parent.source}</Td>
                <Td>
                  <Link
                    href={`/${
                      parent.source === SOURCES.THEMES ? "themes" : "contenus"
                    }/edit/${parent.cdtn_id}`}
                    passHref
                  >
                    <NavLink>{parent.title}</NavLink>
                  </Link>
                </Td>
                <Td>{document.title}</Td>
              </Tr>
            );
          })}
      </Table>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(DuplicateContentPage));

const Table = (props: ComponentPropsWithoutRef<"table">) => (
  <table
    sx={{
      borderCollapse: "collapse",
      borderRadius: "small",
      overflow: "hidden",
      width: "100%",
    }}
    {...props}
  />
);

const Tr = (props: ComponentPropsWithoutRef<"tr">) => <tr sx={{}} {...props} />;

type CellAlign = {
  align?: "left" | "right" | "center";
};

const Th = ({
  align = "left",
  ...props
}: ComponentPropsWithoutRef<"th"> & CellAlign) => (
  <th
    sx={{
      borderBottom: "1px solid",
      fontSize: "medium",
      fontWeight: "semibold",
      px: "xsmall",
      py: "xsmall",
      textAlign: align,
    }}
    {...props}
  />
);

const Td = ({
  align = "left",
  ...props
}: ComponentPropsWithoutRef<"td"> & CellAlign) => (
  <td
    sx={{
      fontWeight: 300,
      px: "xsmall",
      py: "xxsmall",
      textAlign: align,
      "tr:nth-of-type(even) &": {
        bg: "highlight",
      },
    }}
    {...props}
  />
);
