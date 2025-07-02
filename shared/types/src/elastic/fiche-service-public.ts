import { DocumentElasticWithSource } from "./common";
import { FicheServicePublicDoc } from "../hasura";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type ElasticFicheServicePublic = DocumentElasticWithSource<
  FicheServicePublicDoc,
  typeof SOURCES.SHEET_SP
>;
