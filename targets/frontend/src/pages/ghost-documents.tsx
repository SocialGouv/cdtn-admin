/** @jsxImportSource theme-ui */

import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { IoIosCheckmark, IoIosClose } from "react-icons/io";
import { sourceToRoute } from "src/components/documents/List";
import {
  getGhostDocumentQuery,
  GhostDocumentQueryResult,
} from "src/components/home/InvisibleLinkedDocument";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { Table, Td, Th, Tr } from "src/components/table";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Badge, Box, Message, NavLink, Spinner } from "theme-ui";
import { useQuery } from "urql";

export function DuplicateContentPage(): JSX.Element {
  const [result] = useQuery<GhostDocumentQueryResult>({
    query: getGhostDocumentQuery,
    requestPolicy: "cache-and-network",
  });

  const { data, fetching, error } = result;

  if (error || data?.relations.length === 0) {
    return (
      <Layout title="Références inaccessibles">
        <Stack>
          <Message>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </Message>
        </Stack>
      </Layout>
    );
  }
  return (
    <Layout title="Références inaccessibles">
      <p>
        Cette page liste les contenus qui référencent des documents dépubliés ou
        supprimés. Elle facilite le travail de suivi et de maintenances pour les
        <Badge variant="secondary">themes</Badge>,{" "}
        <Badge variant="secondary"> requetes pré-qualifiées</Badge> ou{" "}
        <Badge variant="secondary">A la une</Badge>
        Les contenus listés ici n&apos;apparaissent déjà plus en prod, cette
        rubrique a pour but d&apos;identifier les contenus à retirer des thèmes
        et des requêtes dans l&apos;admin (pour que les contenus que l&apos;on
        trouve dans les thèmes/requêtes de l&apos;admin soient la copie conforme
        des contenus présents dans les thèmes/requêtes en prod). Si un contenu
        qui apparaît ici est disponible mais simplement dépublié (ex : le temps
        de la mise à jour de la fiche), il ne faut pas supprimer cette fiche du
        thème parent (pour qu&apos;elle apparaisse dans le thème au moment de la
        republication de la fiche sans action supplémentaire).
      </p>
      <Table>
        <thead>
          <tr>
            <Th align="left">Type</Th>
            <Th align="left">Parent</Th>
            <Th align="left">Fiche</Th>
            <Th align="center">Publié</Th>
            <Th align="center">Disponible</Th>
          </tr>
        </thead>
        {!data?.relations && fetching && <Spinner />}
        {data?.relations.map(({ id, parent, document }) => {
          return (
            <Tr key={`${id}`}>
              <Td>{getLabelBySource(parent.source)}</Td>
              <Td>{parent.title}</Td>
              <Td>
                <Link
                  href={`/${
                    parent.source === SOURCES.THEMES ? "themes" : "contenus"
                  }/edit/${document.cdtn_id}`}
                  passHref
                >
                  {document.title}
                </Link>
              </Td>
              <Td align="center">
                {document.is_published ? (
                  <Box sx={{ color: "muted" }}>
                    <IoIosCheckmark />
                  </Box>
                ) : (
                  <Box sx={{ color: "critical" }}>
                    <IoIosClose />
                  </Box>
                )}
              </Td>
              <Td align="center">
                {" "}
                {document.is_available ? (
                  <Box sx={{ color: "muted" }}>
                    <IoIosCheckmark />
                  </Box>
                ) : (
                  <Box sx={{ color: "critical" }}>
                    <IoIosClose />
                  </Box>
                )}
              </Td>
            </Tr>
          );
        })}
      </Table>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(DuplicateContentPage));
