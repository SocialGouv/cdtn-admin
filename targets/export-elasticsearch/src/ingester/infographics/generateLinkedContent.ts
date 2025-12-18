import { LinkedContent } from "@socialgouv/cdtn-types/build/elastic/related-items";
import { fetchLinkedContent } from "../common";
import {
  DocumentElasticWithSource,
  InfographicTemplateDoc,
} from "@socialgouv/cdtn-types";

export const generateLinkedContent = async (
  allInfographics: DocumentElasticWithSource<InfographicTemplateDoc>[],
  currentInfographic: DocumentElasticWithSource<InfographicTemplateDoc>
): Promise<LinkedContent[]> => {
  const linkedContentPromises = currentInfographic.cdtnReferences.map(
    async (content) => {
      const infographic = allInfographics.find(
        (item) => item.cdtnId === content.cdtnId
      );
      if (infographic) {
        return {
          source: infographic.source,
          slug: infographic.slug,
          title: infographic.title,
        };
      }
      const linkedDocument = await fetchLinkedContent(
        content.cdtnId,
        `Infgraphic ${currentInfographic.title}`
      );
      if (!linkedDocument) return;

      return {
        source: linkedDocument.source,
        slug: linkedDocument.slug,
        title: linkedDocument.title,
      };
    }
  );
  const linkedContents = await Promise.all(linkedContentPromises);
  return linkedContents.filter((c): c is LinkedContent => !!c);
};
