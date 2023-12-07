import { ContributionDocumentJson } from "@shared/types";
import { DocumentElasticWithSource } from "../types/Glossary";
import { fetchFicheSp } from "./fetchFicheSp";
import { ContributionContent } from "./types";

export const generateContent = async (
  contributions: DocumentElasticWithSource<ContributionDocumentJson>[],
  contrib: DocumentElasticWithSource<ContributionDocumentJson>
): Promise<ContributionContent> => {
  switch (contrib.type) {
    case "content":
      return {
        content: contrib.content,
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
      const cdtContrib = contributions.find(
        (v) => v.id === contrib.genericAnswerId
      );
      if (!cdtContrib) {
        throw new Error(
          `Aucune contribution générique a été retrouvée avec cet id ${contrib.genericAnswerId}`
        );
      }
      if (cdtContrib.type === "generic-no-cdt") {
        throw new Error(
          `La contribution [${contrib.questionIndex} - ${contrib.idcc}] ne peut pas être de type "Code du travail" parce que la générique n'a pas de réponse`
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
      throw new Error(
        `Type de contribution generic inconnu "${cdtContrib.type}" for [${cdtContrib.id}]`
      );
    }
    default:
      throw new Error(
        `Type de contribution inconnu "${contrib.type}" for [${contrib.id}]`
      );
  }
};
