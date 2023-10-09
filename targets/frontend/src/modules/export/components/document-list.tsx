import React from "react";
import {
  CircularProgress as Spinner,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { ShortDocument } from "../../documents";
import { Check, Cross } from "../../../components/utils/icons";
import { sourceToRoute } from "../../../components/documents/List";

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
      <Typography mb={1}>
        <strong>Inclus dans la mise à jour :</strong>
      </Typography>
      <ul>
        <li>
          Documents avec une source externe (fiches service public, fiches
          ministère du travail, ...)
        </li>

        {isLoadingDocs ? (
          <Stack mt={2} justifyContent="center">
            <Spinner></Spinner>
          </Stack>
        ) : (
          <>
            <li>Pages information</li>

            {docs.map((doc) => (
              <Stack direction="row" key={doc.slug}>
                <Link
                  href={sourceToRoute(doc)}
                  target="_blank"
                  sx={{ fontSize: "0.8rem" }}
                >
                  {doc.title}
                </Link>
                {doc.isPublished ? (
                  <Check text="Publié" />
                ) : (
                  <Cross text="Dépublié" />
                )}
              </Stack>
            ))}
          </>
        )}
      </ul>
    </>
  );
}
