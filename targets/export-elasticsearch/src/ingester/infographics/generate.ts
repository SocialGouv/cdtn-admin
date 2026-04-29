import {
  DocumentElasticWithSource,
  InfographicElasticDocument,
  InfographicTemplateDoc,
} from "@socialgouv/cdtn-types";
import pMap from "p-map";
import { generateLinkedContent } from "./generateLinkedContent";
import { htmlToText } from "../utils/textConverter";

export const generateInfographics = async (
  infographics: DocumentElasticWithSource<InfographicTemplateDoc>[]
): Promise<InfographicElasticDocument[]> => {
  return pMap(
    infographics,
    async (infographic): Promise<InfographicElasticDocument> => {
      const linkedContent = await generateLinkedContent(
        infographics,
        infographic
      );
      const { cdtnReferences, ...infographicWithoutRefs } = infographic;
      return {
        ...infographicWithoutRefs,
        source: "infographies",
        linkedContent,
        text: htmlToText(infographic.transcription),
      };
    },
    { concurrency: 5 }
  );
};
