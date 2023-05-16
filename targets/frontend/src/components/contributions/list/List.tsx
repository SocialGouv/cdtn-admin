import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TextField from "@mui/material/TextField";
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
    <>
      <Stack direction="row" alignItems="start">
        <TextField
          label="Recherche"
          variant="outlined"
          onChange={(event) => {
            const value = event.target.value;
            setSearch(value ? `%${value}%` : undefined);
            setPage(0);
          }}
          style={{ marginRight: 12 }}
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

      <TableContainer component={Paper} style={{ height: "66vh" }}>
        <Table aria-label="collapsible table" size="small">
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
    </>
  );
};
