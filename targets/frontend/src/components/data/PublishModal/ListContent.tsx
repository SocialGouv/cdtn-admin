import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Content } from "./index";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

type ContentWithProgression = Content & {
  status: "pending" | "processing" | "done" | "error";
};

type ListContentProps = {
  contents: ContentWithProgression[];
};

const Status = ({ status }: Pick<ContentWithProgression, "status">) => {
  switch (status) {
    case "pending":
      return <PauseCircleOutlineIcon color="disabled" />;
    case "processing":
      return <CircularProgress color="info" size="1.5rem" />;
    case "done":
      return <CheckCircleOutlineIcon color="success" />;
    case "error":
      return <ErrorOutlineIcon color="error" />;
  }
};

export function ListContent({ contents }: ListContentProps): JSX.Element {
  return (
    <TableContainer sx={{ maxHeight: 440 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Titre</TableCell>
            <TableCell align="right">Progression</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contents.map((row) => (
            <TableRow
              key={row.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.title}
              </TableCell>
              <TableCell align="right">
                <Status status={row.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
