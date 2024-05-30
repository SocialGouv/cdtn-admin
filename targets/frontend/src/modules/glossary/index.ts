import { updateContributionsDocumentsGlossary } from "./updateContributionsDocumentsGlossary";
import { updateEditorialContentDocumentsGlossary } from "./updateEditorialContentDocumentsGlossary";

export const updateGlossary = async () => {
  await updateContributionsDocumentsGlossary();
  await updateEditorialContentDocumentsGlossary();
};
