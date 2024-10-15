import { SOURCES } from "@socialgouv/cdtn-utils";
import { HasuraDocument } from "./common";

export type FicheTravailEmploi = HasuraDocument<
  FicheTravailEmploiDoc,
  typeof SOURCES.SHEET_MT_PAGE
>;

export interface FicheTravailEmploiDoc {
  date: string;
  description: string;
  intro: string;
  url: string;
  sections: Section[];
}

export interface Section {
  anchor: string;
  html: string;
  htmlWithGlossary: string;
  text: string;
  title: string;
  description: string;
  references: TravailEmploiReference[];
}

export interface TravailEmploiReference {
  id: string;
  cid: string;
  slug: string;
  title: string;
  type: "code_du_travail" | "conventions_collectives";
  url: string;
}
