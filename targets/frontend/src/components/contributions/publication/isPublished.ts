import { AnswerStatus, ExportStatus } from "../type";

export const isPublished = ({
    status,
    exportStatus
  }: {
    status: AnswerStatus;
    exportStatus?: ExportStatus;
  }): boolean => {
    if (!exportStatus) {
        return false;
    }
    return new Date(exportStatus.createdAt).getTime() > new Date(status.createdAt).getTime();
}