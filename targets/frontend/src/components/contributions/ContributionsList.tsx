import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useQuery } from "urql";

import { Pagination } from "../utils";
import { ContributionsRow } from "./ContributionsRow";
import { contributionListQuery, ContributionListResult } from "./query";

export const ContributionsList = (): JSX.Element => {
  const pageInterval = 12;
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string | undefined>();
  const [idcc, setIdcc] = useState<string | undefined>();
  const [result] = useQuery<ContributionListResult>({
    query: contributionListQuery,
    requestPolicy: "cache-and-network",
    variables: {
      idcc,
      limit: pageInterval,
      offset: page * pageInterval,
      search,
    },
  });
  const rows = result?.data?.contribution_questions ?? [];
  const total =
    result?.data?.contribution_questions_aggregate.aggregate.count ?? 0;
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
