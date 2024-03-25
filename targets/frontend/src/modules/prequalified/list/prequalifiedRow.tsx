import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useRouter } from "next/router";

import { Prequalified } from "../type";

export const PrequalifiedRow = (props: { row: Prequalified }) => {
  const { row } = props;
  const router = useRouter();

  return (
    <TableRow
      key={row.id}
      data-testid={`row-${row.id}`}
      onClick={() => {
        router.push(`/prequalified/${row.id}`);
      }}
      style={{ cursor: "pointer" }}
      hover
    >
      <TableCell scope="row">{row.title}</TableCell>
      <TableCell scope="row">
        {`${row.variants.join(", ").substring(0, 100)}...`}
      </TableCell>
      <TableCell scope="row">{row.documents.length}</TableCell>
    </TableRow>
  );
};
