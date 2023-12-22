import { AgreementDoc, Breadcrumbs, ContributionDocumentJson, ContributionElasticDocument, ContributionHighlight, DocumentElasticWithSource, ContributionLinkedContent } from "@shared/types";
import { GetBreadcrumbsFn } from "../breadcrumbs";
export type ContributionElasticDocumentLightRelatedContent = Omit<ContributionElasticDocument, "linkedContent"> & {
    linkedContent: ContributionLinkedContent[];
};
export declare function generateContributions(contributions: DocumentElasticWithSource<ContributionDocumentJson>[], breadcrumbsOfOldContributions: Record<number, Breadcrumbs[]>, ccnData: DocumentElasticWithSource<AgreementDoc>[], ccnListWithHighlight: Record<number, ContributionHighlight | undefined>, addGlossary: (valueInHtml: string) => string, getBreadcrumbs: GetBreadcrumbsFn): Promise<ContributionElasticDocument[]>;
