import { client } from "@shared/graphql-client";
import { GithubApi } from "./APIs/api";
import { SourcesRepository } from "./repositories/SourcesRepository";
import { AlertRepository } from "./repositories/AlertRepository";
import { AlertDetector } from "./diff";
import { FicheSPRepository } from "./repositories/FicheSPRepository";

export * from "./types";

export async function run(
  api: GithubApi,
  sourceRepository: SourcesRepository,
  alertRepository: AlertRepository,
  alertDetector: AlertDetector
) {
  const sources = await sourceRepository.load();
  for (const source of sources) {
    const tags = (await api.tags(source.repository, source.tag)).reverse();

    const [lastTag = ""] = tags.slice(-1);
    if (!lastTag) {
      throw new Error(`Error: last tag not found for ${source.repository}`);
    }

    let [previousTag] = tags;
    const [, ...newTags] = tags;
    for (const tag of newTags) {
      console.log(
        `get diff from ${previousTag.ref} › ${tag.ref} for ${source.repository}`
      );

      const alertChanges = await alertDetector.getAlertChangesFromTags(
        source.repository,
        tag,
        previousTag
      );
      console.log(`› ${alertChanges.length} changes found`);
      if (alertChanges.length > 0) {
        await alertRepository.saveAlertChanges(source.repository, alertChanges);
      }
      previousTag = tag;
    }
    if (newTags.length > 0) {
      const update = await sourceRepository.updateSource(
        source.repository,
        lastTag.ref
      );
      console.log(`update source ${update.repository} to ${update.tag}`);
    }
  }
}

async function main() {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error("GITHUB_TOKEN is not defined");
  }
  const api = new GithubApi(githubToken);
  const sourceRepository = new SourcesRepository(client);
  const alertRepository = new AlertRepository(client);
  const ficheSPRepository = new FicheSPRepository(client);
  const ficheSpIds = await ficheSPRepository.getFicheServicePublicIds();
  const alertDetector = new AlertDetector(api, ficheSpIds);
  await run(api, sourceRepository, alertRepository, alertDetector);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
