import { DocumentElasticWithSource } from "./common";

export type ThemeElasticDocument = DocumentElasticWithSource<
  ThemeElastic,
  "themes"
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
