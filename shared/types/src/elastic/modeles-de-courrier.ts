import { DocumentElasticWithSource } from "./common";
import { MailTemplateDoc } from "../hasura";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type MailElasticDocument = DocumentElasticWithSource<
  MailTemplateDoc,
  typeof SOURCES.LETTERS
>;
