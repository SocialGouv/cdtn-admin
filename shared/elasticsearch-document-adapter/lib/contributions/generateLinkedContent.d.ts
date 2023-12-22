import { GetBreadcrumbsFn } from "../breadcrumbs";
import { Breadcrumbs, ContributionLinkedContent, ExportContributionFullLinkedContent } from "@shared/types";
import { ContributionElasticDocumentLightRelatedContent } from "./generate";
export declare const generateLinkedContent: (allGeneratedContributions: ContributionElasticDocumentLightRelatedContent[], questionIndex: number, idcc: string, linkedContent: ContributionLinkedContent[], getBreadcrumbs: GetBreadcrumbsFn, breadcrumbsOfRootContributionsPerIndex: Record<number, Breadcrumbs[]>) => Promise<ExportContributionFullLinkedContent>;
