import type { SourceValues } from "@socialgouv/cdtn-sources";

export as namespace references

type Document = {
  id: string;
  description: string;
  title: string;
  source: SourceValues;
  text: string;
  slug: string;
  is_searchable: Boolean;
};

type ExternalDocument = Document & {
  url: string;
};

type FicheServicePublic = ExternalDocument & {
  date: string; //"O1/01/2021"
  raw: string;
  referencedTexts: ReferencedTexts[];
};

type referenceResolver = (
  id: string
) => (
  | import("@socialgouv/legi-data-types").CodeSection
  | import("@socialgouv/legi-data-types").CodeArticle
  | import("@socialgouv/kali-data").AgreementSection
  | import("@socialgouv/kali-data").AgreementArticle
)[];


type InternalReference = {
  title: string;
  slug: string;
  type: Exclude<cdtnSources.SourceRoute, "external">;
};

type ExternalReference = {
  title: string;
  url: string;
  type: "external";
};

type ReferencedTexts = ExternalReference | InternalReference;
