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
import { useRouter } from "next/router";
import { useState } from "react";

import { useListModelQuery } from "./list.query";
import { Row } from "./Row";

export const ModelList = (): JSX.Element => {
  const [search, setSearch] = useState<string | undefined>();
  const router = useRouter();
  const { rows } = useListModelQuery({
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
          data-testid="models-list-search"
        />
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            router.push("/models/creation");
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
              <Row row={row} key={row.id} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
