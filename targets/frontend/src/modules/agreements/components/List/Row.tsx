import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import { AgreementResult } from "./list.query";
import { Tooltip } from "@mui/material";

import GavelIcon from "@mui/icons-material/Gavel";

export const Row = (props: { row: AgreementResult }) => {
  const { row } = props;

  return (
    <>
      <TableRow
        key={row.id}
        data-testid={`row-${row.id}`}
        onClick={() => {
          // TODO router.push(`/agreements/${row.id}`);
        }}
        style={{ cursor: "pointer" }}
        hover
      >
        <TableCell scope="row">{row.id}</TableCell>
        <TableCell scope="row">
          {row.isSupported ? (
            <Tooltip title="Convention collective traitée par le CDTN">
              <GavelIcon fontSize="small" />
            </Tooltip>
          ) : undefined}
        </TableCell>
        <TableCell scope="row">{row.shortName}</TableCell>
      </TableRow>
    </>
  );
};
