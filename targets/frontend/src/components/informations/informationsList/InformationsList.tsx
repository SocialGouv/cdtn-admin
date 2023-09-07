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
} from "@mui/material";
import { useState } from "react";

import { useInformationsListQuery } from "./InformationsList.query";
import { InformationsRow } from "./InformationsRow";

export const QuestionList = (): JSX.Element => {
  const [search, setSearch] = useState<string | undefined>();
  const { rows } = useInformationsListQuery({
    search,
  });
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="start" spacing={2}>
        <TextField
          label="Recherche"
          variant="outlined"
          onChange={(event) => {
            const value = event.target.value;
            setSearch(value ? `%${value}%` : undefined);
          }}
          data-testid="informations-list-search"
        />
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
