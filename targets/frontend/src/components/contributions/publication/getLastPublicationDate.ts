import { format, parseISO } from "date-fns";

import { AnswerStatus, ExportStatus } from "../type";

export const getLastPublicationDate = ({
  status,
  exportStatus,
}: {
  status: AnswerStatus;
  exportStatus?: ExportStatus;
}): string => {
  if (status.status === "PUBLISHED" && exportStatus?.createdAt) {
    status.status =
      new Date(exportStatus.createdAt).getTime() >
      new Date(status.createdAt).getTime()
        ? "PUBLISHED"
        : "TO_PUBLISH";
  }
  return exportStatus?.createdAt
    ? format(parseISO(exportStatus?.createdAt), "dd/MM/yyyy HH:mm:ss")
    : "";
};
screen;
