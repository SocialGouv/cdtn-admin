import { getLabelBySource } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { sourceToRoute } from "src/components/documents/List";
import {
  getGhostDocumentQuery,
  GhostDocumentQueryResult,
} from "src/components/home/InvisibleLinkedDocument";
import { Layout } from "src/components/layout/auth.layout";
import { Table, Td, Th, Tr } from "src/components/table";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Chip, CircularProgress, TableHead, TableRow } from "@mui/material";
import { useQuery } from "urql";
import { FixedSnackBar } from "../components/utils/SnackBar";
import React from "react";
import { Check, Cross } from "../components/utils/icons";

export function DuplicateContentPage(): JSX.Element {
  const [result] = useQuery<GhostDocumentQueryResult>({
    query: getGhostDocumentQuery,
    requestPolicy: "cache-and-network",
  });

  const { data, fetching, error } = result;

  if (error || data?.relations.length === 0) {
    return (
      <Layout title="Références inaccessibles">
        <FixedSnackBar>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </FixedSnackBar>
      </Layout>
    );
  }
  return (
    <Layout title="Références inaccessibles">
      <p>
        Cette page liste les contenus qui référencent des documents dépubliés ou
        supprimés. Elle facilite le travail de suivi et de maintenances pour les{" "}
        <Chip color="secondary" label="themes" />,{" "}
        <Chip color="secondary" label="requetes pré-qualifiées" /> ou{" "}
        <Chip color="secondary" label="A la une" />. Les contenus listés ici
        n&apos;apparaissent déjà plus en prod, cette rubrique a pour but
        d&apos;identifier les contenus à retirer des thèmes et des requêtes dans
        l&apos;admin (pour que les contenus que l&apos;on trouve dans les
        thèmes/requêtes de l&apos;admin soient la copie conforme des contenus
        présents dans les thèmes/requêtes en prod). Si un contenu qui apparaît
        ici est disponible mais simplement dépublié (ex : le temps de la mise à
        jour de la fiche), il ne faut pas supprimer cette fiche du thème parent
        (pour qu&apos;elle apparaisse dans le thème au moment de la
        republication de la fiche sans action supplémentaire).
      </p>
      <Table>
        <TableHead>
          <TableRow>
            <Th align="left">Type</Th>
            <Th align="left">Parent</Th>
            <Th align="left">Fiche</Th>
            <Th align="center">Publié</Th>
            <Th align="center">Disponible</Th>
          </TableRow>
        </TableHead>
        {!data?.relations && fetching && <CircularProgress />}
        {data?.relations.map(({ id, parent, document }) => {
          return (
            <Tr key={`${id}`}>
              <Td>{getLabelBySource(parent.source)}</Td>
              <Td>
                <Link
                  href={sourceToRoute({
                    cdtnId: parent.cdtn_id,
                    source: parent.source,
                  })}
                  passHref
                  style={{ textDecoration: "none" }}
                >
                  {parent.title}
                </Link>
              </Td>
              <Td>{document.title}</Td>
              <Td align="center">
                {document.is_published ? <Check /> : <Cross />}
              </Td>
              <Td align="center">
                {document.is_available ? <Check /> : <Cross />}
              </Td>
            </Tr>
          );
        })}
      </Table>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(DuplicateContentPage));
