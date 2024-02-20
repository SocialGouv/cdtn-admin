import React from "react";
import {
  CircularProgress as Spinner,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Check, Cross } from "../../../components/utils/icons";
import { sourceToRoute } from "../../../components/documents/List";
import { ResultUpdatedDocument } from "../document.query";

type Props = {
  docs: ResultUpdatedDocument;
  isLoadingDocs: boolean;
};
export default function DocumentList({
  docs,
  isLoadingDocs,
}: Props): JSX.Element {
  return (
    <>
      <Typography mb={1}>
        <strong>Inclus dans la mise à jour :</strong>
      </Typography>
      <ul style={{ maxHeight: "60vh", overflow: "auto" }}>
        <li>
          Documents avec une source externe (fiches service public, fiches
          ministère du travail, ...)
        </li>

        {isLoadingDocs ? (
          <Stack mt={2} justifyContent="center">
            <Spinner />
          </Stack>
        ) : (
          <>
            {Array.from(docs.keys()).map((source) => {
              return (
                <li key={source}>
                  <Typography mb={0}>Pages {source} :</Typography>
                  {docs.get(source)?.map((doc) => (
                    <Stack direction="row" key={doc.slug}>
                      <Link
                        href={sourceToRoute({
                          id: doc.initial_id,
                          cdtnId: doc.cdtn_id,
                          source: doc.source,
                        })}
                        target="_blank"
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {doc.title}
                      </Link>
                      {doc.is_published ? (
                        <Check text="Publié" />
                      ) : (
                        <Cross text="Dépublié" />
                      )}
                    </Stack>
                  ))}
                </li>
              );
            })}
          </>
        )}
      </ul>
    </>
  );
}
