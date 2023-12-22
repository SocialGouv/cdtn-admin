import { ContributionElasticDocument, OldContributionElasticDocument } from "@shared/types";
export declare function getIDCCs(oldContributions: OldContributionElasticDocument[], newContributions: ContributionElasticDocument[]): Set<number>;
