import {
  ContributionContent,
  ContributionDocumentJson,
  DocumentElasticWithSource,
} from "@shared/types";
import { fetchFicheSp } from "./fetchFicheSp";

export const generateContent = async (
  contributions: DocumentElasticWithSource<ContributionDocumentJson>[],
  contrib: DocumentElasticWithSource<ContributionDocumentJson>
): Promise<ContributionContent> => {
  if (contrib.type === "content") {
    return {
      content: contrib.content,
    };
  } else if (contrib.type === "fiche-sp") {
    const ficheSpContent = await fetchFicheSp(contrib.ficheSpId);
    return {
      url: ficheSpContent.url,
      date: ficheSpContent.date,
      raw: ficheSpContent.raw,
      ficheSpDescription: ficheSpContent.description,
    };
  } else if (contrib.type === "cdt") {
    const cdtContrib = contributions.find(
      (v) => v.id === contrib.genericAnswerId
    );
    if (!cdtContrib) {
      throw new Error(
        `Aucune contribution générique a été retrouvée avec cet id ${contrib.genericAnswerId}`
      );
    }
    if (cdtContrib.type === "content") {
      return {
        content: cdtContrib.content,
      };
    } else if (cdtContrib.type === "fiche-sp") {
      const ficheSpContent = await fetchFicheSp(cdtContrib.ficheSpId);
      return {
        url: ficheSpContent.url,
        date: ficheSpContent.date,
        raw: ficheSpContent.raw,
        ficheSpDescription: ficheSpContent.description,
      };
    }
  }
  throw new Error(`Type de contribution inconnu ${contrib.type}`);
};
