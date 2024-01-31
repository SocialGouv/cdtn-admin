import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useState } from "react";

import { useListAgreementQuery } from "./list.query";
import { Row } from "./Row";

export const AgreementList = (): JSX.Element => {
  const [idcc, setIdcc] = useState<string | undefined>();
  const [keyword, setKeyword] = useState<string | undefined>();
  const { rows } = useListAgreementQuery({
    idcc,
    keyword,
  });
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          spacing={2}
        >
          <TextField
            label="IDCC"
            variant="outlined"
            onChange={(event) => {
              const value = event.target.value;
              setIdcc(value ? `%${value}%` : undefined);
            }}
            data-testid="agreements-idcc-search"
          />
          <TextField
            label="Recherche mot clé"
            variant="outlined"
            onChange={(event) => {
              const value = event.target.value;
              setKeyword(value ? `%${value}%` : undefined);
            }}
            data-testid="agreements-keyword-search"
          />
        </Stack>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            // TODO redirect to the page to create a new agreement
          }}
        >
          Créer
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>IDCC</TableCell>
              <TableCell></TableCell>
              <TableCell>Titre</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <Row row={row} key={row.id} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
