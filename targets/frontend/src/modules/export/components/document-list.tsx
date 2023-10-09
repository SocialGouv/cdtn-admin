import React from "react";
import BlockIcon from "@mui/icons-material/Block";
import {
  CircularProgress as Spinner,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
      <strong>Pages informations inclus dans la mise à jour</strong>

      {isLoadingDocs ? (
        <Stack mt={2} justifyContent="center">
          <Spinner></Spinner>
        </Stack>
      ) : docs.length ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: "left" }}>Document</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Publié</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Disponible</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {docs.map((doc) => (
              <TableRow key={doc.slug}>
                <TableCell>
                  <Link
                    href={sourceToRoute(doc)}
                    target="_blank"
                    sx={{ fontSize: "0.8rem" }}
                  >
                    {doc.title}
                  </Link>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {doc.isPublished ? <Check /> : <Cross />}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {doc.isAvailable ? <Check /> : <Cross />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Stack mt={2} justifyContent="center">
          <BlockIcon></BlockIcon>
        </Stack>
      )}
    </>
  );
}
