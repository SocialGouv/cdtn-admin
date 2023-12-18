import { ContributionCompleteDoc, ContributionDocumentJson, DocumentElasticWithSource } from "@shared/types";
export declare function isNewContribution(obj: DocumentElasticWithSource<ContributionDocumentJson | ContributionCompleteDoc>): obj is DocumentElasticWithSource<ContributionDocumentJson>;
export declare const isOldContribution: (obj: DocumentElasticWithSource<ContributionDocumentJson | ContributionCompleteDoc>) => obj is DocumentElasticWithSource<ContributionCompleteDoc>;
export declare const isGenericContribution: (contrib: DocumentElasticWithSource<ContributionDocumentJson>) => boolean;
