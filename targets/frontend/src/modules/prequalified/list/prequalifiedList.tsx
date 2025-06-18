import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
} from "@mui/material";
import { usePrequalifiedListQuery } from "./prequalifiedList.query";
import { PrequalifiedRow } from "./prequalifiedRow";
import { useState } from "react";
import { useRouter } from "next/router";

export const PrequalifiedList = (): JSX.Element => {
  const router = useRouter();
  const [search, setSearch] = useState<string | undefined>();
  const data = usePrequalifiedListQuery({ search });
  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <TextField
          label="Rechercher"
          variant="outlined"
          onChange={(event) => {
            const value = event.target.value;
            setSearch(value ? `%${value}%` : undefined);
          }}
        />
        <div>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              router.push("/prequalified/create");
            }}
          >
            Créer
          </Button>
        </div>
      </Stack>
      <Stack>
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table" size="small">
            <TableHead>
              <TableRow>
                <TableCell component="th" scope="row" width={420}>
                  Titre
                </TableCell>
                <TableCell component="th" scope="row">
                  Variants
                </TableCell>
                <TableCell component="th" scope="row">
                  Nb Documents
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((row) => (
                <PrequalifiedRow
                  key={row.id}
                  row={row}
                  data-testid="prequalified-list-row"
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </>
  );
};
