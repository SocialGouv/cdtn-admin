import React from "react";
import { Stack } from "src/components/layout/Stack";
import BlockIcon from "@mui/icons-material/Block";
import { CircularProgress as Spinner, Link } from "@mui/material";
import { getRouteBySource } from "@socialgouv/cdtn-sources";
import { ShortDocument } from "../../documents";

type Props = {
  docs: ShortDocument[];
  isLoadingDocs: boolean;
};
export default function DocumentList({
  docs,
  isLoadingDocs,
}: Props): JSX.Element {
  return (
    <>
      <strong>Documents inclus dans la mise à jour</strong>

      {isLoadingDocs ? (
        <Stack mt={2} justifyContent="center">
          <Spinner></Spinner>
        </Stack>
      ) : docs.length ? (
        <ul>
          {docs.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`https://code-du-travail-numerique-preprod.dev.fabrique.social.gouv.fr/${getRouteBySource(
                  doc.source
                )}/${doc.slug}`}
                target="_blank"
                sx={{ fontSize: "0.8rem" }}
              >
                {doc.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Stack mt={2} justifyContent="center">
          <BlockIcon></BlockIcon>
        </Stack>
      )}
    </>
  );
}
