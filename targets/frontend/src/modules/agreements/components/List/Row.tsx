import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import { AgreementResult } from "./list.query";
import { Tooltip } from "@mui/material";

import GavelIcon from "@mui/icons-material/Gavel";
import { useRouter } from "next/router";

export const Row = ({ row }: { row: AgreementResult }) => {
  const router = useRouter();

  return (
    <>
      <TableRow
        key={row.id}
        data-testid={`row-${row.id}`}
        onClick={() => {
          router.push(`/agreements/${row.id}`);
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
