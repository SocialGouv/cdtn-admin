import {
  Alert,
  Box,
  Button,
  Modal,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useUnseenAlertWarningAnswerQuery } from "./warning.query";
import { useState } from "react";
import DoneIcon from "@mui/icons-material/Done";
import InfoIcon from "@mui/icons-material/Info";
import { format, parseISO } from "date-fns";
import { useSeenAlertWarnings } from "./warning.mutation";

type Props = {
  repository: string;
};
export const AlertWarning = ({ repository }: Props): React.ReactElement => {
  const [alertWarnings, refreshWarnings] = useUnseenAlertWarningAnswerQuery();
  const seenAlertWarnings = useSeenAlertWarnings();
  const [isOpen, setOpen] = useState(false);

  const clickOk = async () => {
    await seenAlertWarnings();
    refreshWarnings({ requestPolicy: "network-only" });
  };

  if (
    repository !== "socialgouv/legi-data" &&
    repository !== "socialgouv/kali-data"
  ) {
    return <></>;
  }

  if (alertWarnings?.length) {
    return (
      <>
        <Modal
          open={isOpen}
          onClose={() => {
            setOpen(false);
          }}
        >
          <Box
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 1000,
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Stack>
              <Typography variant="subtitle1">
                Voici la liste des articles en erreur avec le document lié. Si
                l&apos;article a été modifié, le document ne sera pas lié.
              </Typography>
              <Typography variant="body2">
                Information: cette page est principalement destinée à du debug.
              </Typography>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align={"center"}>Date</TableCell>
                      <TableCell align={"center"}>Article</TableCell>
                      <TableCell align={"center"}>Document</TableCell>
                      <TableCell align={"center"}>Source</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alertWarnings.map((row, index) => {
                      const date = format(
                        parseISO(row.createdAt),
                        "dd/MM/yyyy"
                      );
                      return (
                        <TableRow hover tabIndex={-1} key={`row-${index}`}>
                          <TableCell align="left">{date}</TableCell>
                          <TableCell align="left">{row.article}</TableCell>
                          <TableCell align="left">{row.document}</TableCell>
                          <TableCell align="left">{row.source}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </Box>
        </Modal>
        <Alert
          severity="warning"
          action={
            <Stack direction="row" spacing={3}>
              <Button
                color="info"
                size="small"
                startIcon={<InfoIcon />}
                onClick={() => {
                  setOpen(true);
                }}
              >
                plus d&apos;info
              </Button>
              <Button
                color="inherit"
                size="small"
                startIcon={<DoneIcon />}
                onClick={clickOk}
              >
                ok
              </Button>
            </Stack>
          }
        >
          Attention ! Certains documents liés (modèles de document et contenus
          éditoriaux) peuvent être manquant.
        </Alert>
      </>
    );
  }
  return <></>;
};
