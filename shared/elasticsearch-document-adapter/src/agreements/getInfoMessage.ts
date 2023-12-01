import { ContributionElasticDocument } from "@shared/types";

const CC_NE_PREVOIT_RIEN =
  "Les informations ci-dessous sont issues du code du travail car la convention collective ne prévoit rien sur ce sujet.";
const CC_RENVOIE_CDT =
  "Les informations ci-dessous sont issues du code du travail car la convention collective renvoie au code du travail.";
const CC_MOINS_FAVORABLE =
  "Les informations ci-dessous sont issues du code du travail car elles sont plus favorables que les dispositions prévues par la convention collective.";
const CC_AVEC_REPONSE =
  "Les informations ci-dessous sont issues de l’analyse des règles prévues par votre convention collective de branche étendue et par le Code du travail.";

export function getInfoMessage(data: ContributionElasticDocument): string {
  switch (true) {
    case data.contentType === "ANSWER":
      return CC_AVEC_REPONSE;
    case data.contentType === "CDT":
      return CC_RENVOIE_CDT;
    case data.contentType === "UNFAVOURABLE":
      return CC_MOINS_FAVORABLE;
    case data.contentType === "NOTHING":
      return CC_NE_PREVOIT_RIEN;
    default:
      throw new Error(
        `Le type de contenu : ${data.contentType} n'est pas reconnu. Pour information, ce n'est pas possible pour une convention collective d'être de type "SP", et celle en "UNKNOWN" doivent être filtré avant le passage à cette fonction.`
      );
  }
}
