import { ContributionContent, ContributionDocumentJson, DocumentElasticWithSource } from "@shared/types";
export declare const generateContent: (contributions: DocumentElasticWithSource<ContributionDocumentJson>[], contrib: DocumentElasticWithSource<ContributionDocumentJson>) => Promise<ContributionContent>;
