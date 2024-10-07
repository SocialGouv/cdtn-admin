import { DocumentElasticWithSource } from "./common";
import { FicheTravailEmploiDoc, Section } from "../hasura";

export type ElasticFicheTravailEmploi = DocumentElasticWithSource<
  Omit<FicheTravailEmploiDoc, "sections">
> & {
  sections: ElasticFicheTravailEmploiSection[];
};

export type ElasticFicheTravailEmploiSection = Omit<
  Section,
  "htmlWithGlossary" | "text" | "description"
>;
