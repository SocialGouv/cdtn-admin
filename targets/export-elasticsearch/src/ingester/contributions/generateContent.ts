import {
  ContributionContent,
  ContributionDocumentJson,
  ContributionInfographicFull,
  DocumentElasticWithSource,
  InfographicElasticDocument,
} from "@socialgouv/cdtn-types";
import { fetchFicheSp } from "./fetchFicheSp";

export const generateContent = async (
  contribGeneric:
    | DocumentElasticWithSource<ContributionDocumentJson>
    | undefined,
  contrib: DocumentElasticWithSource<ContributionDocumentJson>,
  infographicDocuments: InfographicElasticDocument[]
): Promise<ContributionContent> => {
  switch (contrib.type) {
    case "content":
      return {
        content: contrib.contentWithGlossary,
        infographics: mapInfographic(contrib, infographicDocuments),
      };
    case "fiche-sp": {
      const ficheSpContent = await fetchFicheSp(contrib.ficheSpId);
      return {
        url: ficheSpContent.url,
        date: ficheSpContent.date,
        raw: ficheSpContent.raw,
        ficheSpDescription: ficheSpContent.description,
      };
    }
    case "generic-no-cdt": {
      return {
        messageBlockGenericNoCDT: contrib.messageBlockGenericNoCDT,
      };
    }
    case "cdt": {
      if (!contribGeneric) {
        throw new Error(
          `Aucune contribution générique a été retrouvée pour la contribution [${contrib.questionIndex} - ${contrib.idcc}] (id générique non trouvé : ${contrib.genericAnswerId})`
        );
      }
      if (contribGeneric.type === "generic-no-cdt") {
        throw new Error(
          `La contribution [${contrib.questionIndex} - ${contrib.idcc}] ne peut pas référencer une générique qui n'a pas de réponse`
        );
      }
      if (contribGeneric.type === "content") {
        return {
          content: contribGeneric.contentWithGlossary,
          infographics: mapInfographic(contribGeneric, infographicDocuments),
        };
      } else if (contribGeneric.type === "fiche-sp") {
        const ficheSpContent = await fetchFicheSp(contribGeneric.ficheSpId);
        return {
          url: ficheSpContent.url,
          date: ficheSpContent.date,
          raw: ficheSpContent.raw,
          ficheSpDescription: ficheSpContent.description,
        };
      }
      throw new Error(
        `Type de contribution generic inconnu "${contribGeneric.type}" for [${contribGeneric.id}]`
      );
    }
  }
};

const mapInfographic = (
  contrib: DocumentElasticWithSource<ContributionDocumentJson>,
  infographicDocuments: InfographicElasticDocument[]
): ContributionInfographicFull[] => {
  if (!contrib.infographics) {
    return [];
  }
  return contrib.infographics.map((info): ContributionInfographicFull => {
    const infographic = infographicDocuments.find(
      (item) => item.id === info.infographicId
    );
    if (!infographic) {
      throw new Error(
        `Infographic ${info.infographicId} not published for contrib ${contrib.id} (${contrib.questionIndex} - ${contrib.questionName})`
      );
    }
    return {
      infographicId: infographic.id,
      title: infographic.title,
      pdfFilename: infographic.pdfFilename,
      pdfFilesizeOctet: infographic.pdfFilesizeOctet,
      svgFilename: infographic.svgFilename,
      transcription: infographic.transcription,
    };
  });
};
