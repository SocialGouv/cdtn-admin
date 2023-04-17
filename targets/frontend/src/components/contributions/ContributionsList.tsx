import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useQuery } from "urql";

import { Pagination } from "../utils";
import { ContributionsRow } from "./ContributionsRow";
import { Question } from "./type";

export type ContributionQuestions = {
  contribution_questions: Question[];
  contribution_questions_aggregate: { aggregate: { count: number } };
};

const query = `query questions_answers($search: String, $idcc: bpchar, $offset: Int, $limit: Int) {
  contribution_questions_aggregate(
    where: {
      content: { _ilike: $search }
    }
  ) {
    aggregate {
      count
    }
  }
  contribution_questions(
    where: {
      content: { _ilike: $search }
    },
    offset: $offset,
    limit: $limit
  ) {
    id,
    content,
    answers(
      where: {
        id_cc: {_eq: $idcc}
      },
      order_by: {id_cc: asc}
    ) {
      display_mode,
      content,
      status,
      agreements {
        id,
        name
      }
    }
  }
}`;

export const ContributionsList = (): JSX.Element => {
  const pageInterval = 12;
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string | undefined>();
  const [idcc, setIdcc] = useState<string | undefined>();
  const [rows, setRows] = useState<Question[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [result] = useQuery<ContributionQuestions>({
    query,
    requestPolicy: "cache-and-network",
    variables: {
      idcc,
      limit: pageInterval,
      offset: page * pageInterval,
      search,
    },
  });
  useEffect(() => {
    setRows(result?.data?.contribution_questions ?? []);
    setTotal(
      result?.data?.contribution_questions_aggregate.aggregate.count ?? 0
    );
  }, [result]);
  return (
    <>
      <Box sx={{ paddingBottom: 1 }}>
        <TextField
          label="Recherche"
          variant="outlined"
          onChange={(event) => {
            const value = event.target.value;
            setSearch(value ? `%${value}%` : undefined);
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
            if (event.target.value.toUpperCase() === "CDT") {
              setIdcc("0000");
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
