import {
  DocumentElasticWithSource,
  InfographicElasticDocument,
  InfographicTemplateDoc,
} from "@socialgouv/cdtn-types";
import { SOURCES } from "@socialgouv/cdtn-utils";

export const generateInfographics = async (
  infographics: DocumentElasticWithSource<InfographicTemplateDoc>[],
): Promise<InfographicElasticDocument[]> =>
  Promise.resolve(
    infographics.map((infographic): InfographicElasticDocument => {
      const data: InfographicElasticDocument = {
        ...infographic,
        source: SOURCES.INFOGRAPHICS,
      };
      return data;
    }),
  );
