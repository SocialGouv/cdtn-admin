import { FicheServicePublic } from "../hasura";

export type FicheSPDocument = FicheServicePublic & { raw: string };
