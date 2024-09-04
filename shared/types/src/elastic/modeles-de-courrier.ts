import { DocumentElasticWithSource } from "./common";
import { MailTemplateDoc } from "../hasura";

export type MailElasticDocument = DocumentElasticWithSource<
  MailTemplateDoc,
  "modeles_de_courriers"
>;
