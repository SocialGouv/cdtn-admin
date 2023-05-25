import { loadCodeDuTravail } from "../transform/legi-data/data-loaders";
import { loadLabourCodeArticles } from "./legi";
import { updateLabourCodeArticles } from "./legi/update-labour-code-articles";

export async function updateLegiArticles(): Promise<void> {
  const articles = await loadLabourCodeArticles(loadCodeDuTravail);

  console.log(`updateLegiData: Updating code du travail`);
  await updateLabourCodeArticles(articles);
}
