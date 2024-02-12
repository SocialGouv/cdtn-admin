import { TableCell } from "@mui/material";

type Props = {
  valueA: number;
  valueB?: number;
};

export const TableCellDiff = ({ valueA, valueB }: Props) => {
  if (!valueB) {
    return <TableCell> - </TableCell>;
  }
  const diff = valueA - valueB;
  return (
    <TableCell>
      {diff === 0 && <span>0</span>}
      {diff > 0 && <span style={{ color: "green" }}>+{diff}</span>}
      {diff < 0 && <span style={{ color: "red" }}>{diff}</span>}
    </TableCell>
  );
};
