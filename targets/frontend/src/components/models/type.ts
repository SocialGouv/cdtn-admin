import { LegiReference } from "src/components/contributions";

export type Model = {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
  createdAt: string;
  description: string;
  fileName: string;
  fileSize: number;
  previewHTML: string;
  legiReferences: LegiReference[];
};
