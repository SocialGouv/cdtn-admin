import { AgreementDoc, AgreementGenerated, ContributionElasticDocument, OldContributionElasticDocument } from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
export declare const generateAgreements: (ccnData: DocumentElasticWithSource<AgreementDoc>[], newContributions: ContributionElasticDocument[], oldContributions: OldContributionElasticDocument[]) => Promise<AgreementGenerated[]>;
