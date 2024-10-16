import { SOURCES } from "@socialgouv/cdtn-utils";
import { HasuraDocument } from "./common";

export type FicheServicePublic = HasuraDocument<
  FicheServicePublicDoc,
  typeof SOURCES.SHEET_SP
>;

export interface FicheServicePublicDoc {
  raw: string;
  url: string;
  date: string;
  description: string;
  referencedTexts: ServicePublicReference[];
}

export type ServicePublicReference =
  | ServicePublicExternalReference
  | ServicePublicInternalReference;

export interface ServicePublicInternalReference {
  title: string;
  slug: string;
  type: "code_du_travail" | "conventions_collectives";
}

export interface ServicePublicExternalReference {
  title: string;
  url: string;
  type: "external";
}
