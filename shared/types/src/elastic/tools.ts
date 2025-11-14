import { SOURCES } from "@socialgouv/cdtn-utils";
import { DocumentElasticWithSource } from "./common";

export type ToolAction = "Estimer" | "Calculer" | "Consulter";

export interface ToolDoc {
  date: string;
  icon: string;
  order: number;
  action: ToolAction;
  metaTitle: string;
  questions?: string[];
  description: string;
  displayTool: boolean;
  displayTitle: string;
}

export type ExternalToolDoc = {
  url: string;
  icon: string;
  action: ToolAction;
  description: string;
  displayTool: boolean;
};

export type ElasticTool = DocumentElasticWithSource<
  ToolDoc,
  typeof SOURCES.TOOLS
>;

export type ElasticExternalTool = DocumentElasticWithSource<
  ExternalToolDoc,
  typeof SOURCES.EXTERNALS
>;
