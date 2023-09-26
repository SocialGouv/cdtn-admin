import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableContainer,
  TextField,
  TableRow,
  TableCell,
  Button,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";

import { useInformationsListQuery } from "./InformationsList.query";
import { InformationsRow } from "./InformationsRow";

export const QuestionList = (): JSX.Element => {
  const [search, setSearch] = useState<string | undefined>();
  const router = useRouter();
  const { rows } = useInformationsListQuery({
    search,
  });
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <TextField
          label="Recherche"
          variant="outlined"
          onChange={(event) => {
            const value = event.target.value;
            setSearch(value ? `%${value}%` : undefined);
          }}
          data-testid="informations-list-search"
        />
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            router.push("/informations/creation");
          }}
        >
          Créer
        </Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <InformationsRow row={row} key={row.id} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
