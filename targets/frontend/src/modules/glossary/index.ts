import { logger } from "@shared/utils";
import { updateContributionsDocumentsGlossary } from "./updateContributionsDocumentsGlossary";
import { updateEditorialContentDocumentsGlossary } from "./updateEditorialContentDocumentsGlossary";

export const updateGlossary = async () => {
  logger.info("=== Starting glossary update ===");
  logger.info("Updating editorial content documents glossary...");
  await updateEditorialContentDocumentsGlossary();
  logger.info("Updating contributions documents glossary...");
  await updateContributionsDocumentsGlossary();
  logger.info("=== Ending glossary update ===");
};
