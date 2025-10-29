import modelesPreavisRetraite from "./modeles-preavis-retraite.json";
import modelesRuptureConventionnelle from "./modeles-rupture-conventionnelle.json";
import modelesPreavLicenciement from "./modeles-preavis-licenciement.json";
import modelesPreavisDemission from "./modeles-preavis-demission.json";
import modelesIndemniteLicenciement from "./modeles-indemnite-licenciement.json";
import modelesIndemnitePrecarite from "./modeles-indemnite-precarite.json";
import modelesHeuresRechercheEmploi from "./modeles-heures-recherche-emploi.json";

export const mockSimulatorModels = {
  "preavis-retraite": modelesPreavisRetraite,
  "rupture-conventionnelle": modelesRuptureConventionnelle,
  "preavis-licenciement": modelesPreavLicenciement,
  "preavis-demission": modelesPreavisDemission,
  "indemnite-licenciement": modelesIndemniteLicenciement,
  "indemnite-precarite": modelesIndemnitePrecarite,
  "heures-recherche-emploi": modelesHeuresRechercheEmploi,
};

export const mockPackageMetadata = {
  tarballUrl:
    "https://registry.npmjs.org/@socialgouv/modeles-social/-/modeles-social-4.195.1.tgz",
  version: "4.195.1",
};

export const mockExtractedReferences = [
  "KALIARTI000005849509",
  "KALIARTI000045968978",
  "KALIARTI000046314530",
];
