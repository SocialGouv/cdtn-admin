import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TextField from "@mui/material/TextField";
import { useState } from "react";

import { Pagination } from "../utils";
import { useContributionListQuery } from "./ContributionsList.query";
import { ContributionsRow } from "./ContributionsRow";

export const ContributionsList = (): JSX.Element => {
  const pageInterval = 12;
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string | undefined>();
  const [idcc, setIdcc] = useState<string | undefined>();
  const { rows, total } = useContributionListQuery({
    idcc,
    page,
    pageInterval,
    search,
  });
  return (
    <>
      <Box sx={{ boxShadow: 0 }}>
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
              setIdcc(undefined);
              return;
            }
            const s = "000" + event.target.value;
            const value = s.substring(s.length - 4);
            setIdcc(value);
          }}
          data-testid="contributions-list-idcc"
        />
      </Box>

      <TableContainer component={Paper} style={{ height: "65vh" }}>
        <Table aria-label="collapsible table" size="small">
          <TableBody>
            {rows.map((row) => (
              <ContributionsRow
                key={row.content}
                row={row}
                preOpen={row.answers.length === 1}
                data-testid="contributions-list-row"
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ flexShrink: 0, float: "right", ml: 2.5 }}>
        <Pagination
          page={page}
          totalPage={total}
          interval={pageInterval}
          onPageChange={(page) => {
            setPage(page);
          }}
        />
      </Box>
    </>
  );
};
