import { IndexedAgreement } from "@socialgouv/kali-data-types";
import { HasuraDocument } from "./common";
import { ContributionHighlight } from "./contributions";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type Agreement = HasuraDocument<AgreementDoc, typeof SOURCES.CCN>;

export type AgreementDoc = Pick<
  IndexedAgreement,
  | "date_publi"
  | "effectif"
  | "mtime"
  | "num"
  | "shortTitle"
  | "url"
  | "synonymes"
> & {
  highlight?: ContributionHighlight;
};
