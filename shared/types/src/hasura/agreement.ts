import { IndexedAgreement } from "@socialgouv/kali-data-types";
import { HasuraDocument } from "./common";
import { ContributionHighlight } from "./contributions";

export type Agreement = HasuraDocument<AgreementDoc, "conventions_collectives">;

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
