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

import { Pagination } from "../../utils";
import { useContributionListQuery } from "./List.query";
import { ContributionsRow } from "./Row";

export const ContributionsList = (): JSX.Element => {
  const pageInterval = 12;
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string | undefined>();
  const [agreementId, setAgreementId] = useState<string | undefined>();
  const { rows, total } = useContributionListQuery({
    agreementId,
    page,
    pageInterval,
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
            setPage(0);
          }}
          data-testid="contributions-list-search"
        />
        <TextField
          label="Idcc"
          variant="outlined"
          onChange={(event) => {
            if (!event.target.value) {
              setAgreementId(undefined);
              return;
            }
            const s = "000" + event.target.value;
            const value = s.substring(s.length - 4);
            setAgreementId(value);
          }}
          data-testid="contributions-list-idcc"
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <ContributionsRow
                key={row.content}
                row={row}
                preOpen={row?.answers?.length === 1}
                data-testid="contributions-list-row"
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack alignItems="end">
        <Pagination
          page={page}
          totalPage={total}
          interval={pageInterval}
          onPageChange={(page) => {
            setPage(page);
          }}
        />
      </Stack>
    </Stack>
  );
};
