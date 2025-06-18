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
import { ExportEsStatus } from "@socialgouv/cdtn-types";
import { TableCellDiff } from "./TableCellDiff";

type Props = {
  oldDocumentsCount?: Required<ExportEsStatus>["documentsCount"];
  documentsCount: Required<ExportEsStatus>["documentsCount"];
  dateInfo: string;
};

export function InformationsDialog({
  oldDocumentsCount,
  documentsCount,
  dateInfo,
}: Props) {
  const [open, setOpen] = React.useState(false);

  function sortDocumentsCount(
    docCounts: Required<ExportEsStatus>["documentsCount"]
  ) {
    let object: any = {};
    Object.keys(docCounts)
      .filter(([key, _]: any) => key !== "total")
      .forEach((key: any) => {
        const label =
          key === "page_fiche_ministere_travail"
            ? "Page Ministère du travail"
            : getLabelBySource(key) ?? "Glossary";
        object = {
          ...object,
          [label]: docCounts[key as keyof typeof docCounts],
        };
      });
    return Object.keys(object)
      .sort((a, b) => a.localeCompare(b))
      .reduce((obj: any, key: any) => {
        obj[key] = object[key as keyof typeof object];
        return obj;
      }, {});
  }

  const sortedDocumentsCount: Required<ExportEsStatus>["documentsCount"] =
    React.useMemo(() => {
      return sortDocumentsCount(documentsCount);
    }, [documentsCount]);

  const sortedOldDocumentsCount: Required<ExportEsStatus>["documentsCount"] =
    React.useMemo(() => {
      if (!oldDocumentsCount) {
        return {};
      }
      return sortDocumentsCount(oldDocumentsCount);
    }, [oldDocumentsCount]);

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
          <>
            <p>{dateInfo}</p>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Nombre de documents</TableCell>
                  <TableCell>Différentiel</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell>{documentsCount.total}</TableCell>
                  <TableCellDiff
                    valueA={documentsCount.total}
                    valueB={oldDocumentsCount?.total}
                  />
                </TableRow>
                {Object.entries(sortedDocumentsCount).map(
                  ([key, value], index) => (
                    <TableRow key={`${key}-${index}`}>
                      <TableCell>{key}</TableCell>
                      <TableCell>{value}</TableCell>
                      <TableCellDiff
                        valueA={value}
                        valueB={Object.values(sortedOldDocumentsCount)[index]}
                      />
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
