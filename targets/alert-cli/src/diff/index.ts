import { DataDiffFunction } from "../types";
import { processAgreementDataDiff, processCodeDataDiff } from "./dila";
import { processVddDiff } from "./sp";
import { processTravailDataDiff } from "./travail-data";
import { GitTagData } from "../types";
import { AlertChanges } from "@shared/types";
import { GithubApi } from "../utils/github";
import { getSupportedAgreements } from "./shared/getSupportedAgreements";

export class AlertDetector {
  githubApi: GithubApi;
  fichesServicePublicIds: string[] = [];

  constructor(githubApi: GithubApi, fichesServicePublicIds: string[]) {
    this.githubApi = githubApi;
    this.fichesServicePublicIds = fichesServicePublicIds;
  }

  private async getFileFilter(
    repository: string
  ): Promise<(path: string) => boolean> {
    const ccns = await getSupportedAgreements();
    switch (repository) {
      case "socialgouv/legi-data":
        // only code-du-travail
        return (path: string) => path.endsWith("LEGITEXT000006072050.json");
      case "socialgouv/kali-data":
        // only a ccn matching our list
        return (path: string) =>
          ccns.some((ccn) => new RegExp(ccn.kali_id).test(path));
      case "socialgouv/fiches-vdd": {
        /** @type {string[]} */
        const ficheVddIDs = this.fichesServicePublicIds;
        return (path: string) => {
          const matched = ficheVddIDs.some((id) =>
            new RegExp(`${id}.json$`).test(path)
          );
          return matched;
        };
      }
      case "socialgouv/fiches-travail-data":
        return (path) => path.endsWith("fiches-travail.json");
      default:
        return () => false;
    }
  }

  private getDiffProcessor(repository: string): DataDiffFunction {
    switch (repository) {
      case "socialgouv/legi-data":
        return processCodeDataDiff;
      case "socialgouv/kali-data":
        return processAgreementDataDiff;
      case "socialgouv/fiches-vdd":
        return processVddDiff;
      case "socialgouv/fiches-travail-data":
        return processTravailDataDiff;
      default:
        return async () => Promise.resolve([]);
    }
  }

  async getAlertChangesFromTags(
    repository: string,
    currentTag: GitTagData,
    previousTag: GitTagData
  ): Promise<AlertChanges[]> {
    const fileFilter = await this.getFileFilter(repository);
    const diffProcessor = this.getDiffProcessor(repository);

    const patches = await this.githubApi.diff(
      repository,
      previousTag,
      currentTag
    );
    console.log(
      `Patches ${patches.files.length} for ${repository}. (${patches.from.ref} -> ${patches.to.ref})`
    );

    return diffProcessor({
      fileFilter: fileFilter,
      patches: patches,
      repositoryId: repository,
      tag: currentTag,
      loadFile: async (file, tag) =>
        await this.githubApi.raw(repository, file.filename, tag),
    });
  }
}
