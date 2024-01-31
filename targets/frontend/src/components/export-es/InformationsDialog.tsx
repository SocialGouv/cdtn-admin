import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { getLabelBySource } from "@socialgouv/cdtn-sources";
import {
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@mui/material";
import { ExportEsStatus } from "@shared/types";

type Props = {
  oldDocumentsCount?: Required<ExportEsStatus>["documentsCount"];
  documentsCount: Required<ExportEsStatus>["documentsCount"];
};

export function InformationsDialog({
  oldDocumentsCount,
  documentsCount,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        {documentsCount?.total} documents exportés
      </Button>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Modifications effectuées
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Nombre de documents</TableCell>
                <TableCell>Différentiel</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(documentsCount).map(([key, value], index) => (
                <TableRow key={key}>
                  <TableCell>
                    {key === "glossary"
                      ? "Glossaire"
                      : getLabelBySource(key as any) ?? "Total"}
                    {/* TODO: {getLabelBySource(key as keyof typeof documentsCount) ?? "Total"} */}
                  </TableCell>
                  <TableCell>{value}</TableCell>
                  <TableCell>
                    {oldDocumentsCount
                      ? value - Object.values(oldDocumentsCount)[index]
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
