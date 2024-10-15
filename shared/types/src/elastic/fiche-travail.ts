import { DocumentElasticWithSource } from "./common";
import { FicheTravailEmploiDoc, Section } from "../hasura";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type ElasticFicheTravailEmploi = DocumentElasticWithSource<
  Omit<FicheTravailEmploiDoc, "sections">,
  typeof SOURCES.SHEET_MT | typeof SOURCES.SHEET_MT_PAGE
> & {
  sections: ElasticFicheTravailEmploiSection[];
};

export type ElasticFicheTravailEmploiSection = Omit<
  Section,
  "htmlWithGlossary" | "text" | "description"
>;
