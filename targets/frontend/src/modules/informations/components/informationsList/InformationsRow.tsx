import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useRouter } from "next/router";

import { QueryInformation } from "./InformationsList.query";

export const InformationsRow = (props: { row: QueryInformation }) => {
  const { row } = props;
  const router = useRouter();

  return (
    <>
      <TableRow
        key={row.id}
        data-testid={`row-${row.id}`}
        onClick={() => {
          router.push(`/informations/${row.id}`);
        }}
        style={{ cursor: "pointer" }}
        hover
      >
        <TableCell component="th" scope="row">
          {row.title}
        </TableCell>
      </TableRow>
    </>
  );
};
