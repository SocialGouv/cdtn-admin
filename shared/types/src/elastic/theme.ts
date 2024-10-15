import { DocumentElasticWithSource } from "./common";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type ThemeElasticDocument = DocumentElasticWithSource<
  ThemeElastic,
  typeof SOURCES.THEMES
>;

export type ThemeElastic = {
  children: ThemeChildren[];
  description?: string;
  icon?: string;
  position: number;
};

export type ThemeChildren = {
  label: string;
  slug: string;
};
