import { AgreementDoc, ContributionConventionnelInfos, ContributionDocumentJson, DocumentElasticWithSource } from "@shared/types";
export declare const getCcInfos: (ccns: DocumentElasticWithSource<AgreementDoc>[], contribution: DocumentElasticWithSource<ContributionDocumentJson>) => ContributionConventionnelInfos;
