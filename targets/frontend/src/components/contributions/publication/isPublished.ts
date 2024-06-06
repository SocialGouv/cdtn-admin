import { AnswerStatus, ExportStatus } from "../type";

export const isPublished = ({
    statusDate,
    exportDate
  }: {
    statusDate: string;
    exportDate?: string;
  }): boolean => {
    return new Date(exportDate).getTime() > new Date(statusDate).getTime();
}