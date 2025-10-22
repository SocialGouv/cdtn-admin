import * as fs from "fs";
import * as path from "path";
import { createGetArticleReference, extractArticleId } from "@shared/utils";
import type { DocumentReferences } from "@socialgouv/cdtn-types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { DilaApiClient } from "@socialgouv/dila-api-client";
import pMap from "p-map";
import { WarningRepository } from "../../../../repositories/WarningRepository";
import { gqlClient } from "@shared/utils";

const getArticleReference = createGetArticleReference(new DilaApiClient());

export interface SimulatorModel {
  [idcc: string]: {
    [key: string]: {
      références?: {
        [label: string]: string;
      };
      [key: string]: any;
    };
  };
}

const SIMULATOR_FILES = [
  "modeles-rupture-conventionnelle.json",
  "modeles-preavis-retraite.json",
  "modeles-preavis-licenciement.json",
  "modeles-preavis-demission.json",
  "modeles-indemnite-precarite.json",
  "modeles-heures-recherche-emploi.json",
  "modeles-indemnite-licenciement.json",
];

function extractReferencesFromModel(model: SimulatorModel): string[] {
  const references: string[] = [];

  for (const idcc in model) {
    const idccData = model[idcc];
    for (const key in idccData) {
      const entry = idccData[key];
      if (entry.références && typeof entry.références === "object") {
        for (const label in entry.références) {
          const url = entry.références[label];
          if (typeof url === "string" && url.length > 0) {
            references.push(url);
          }
        }
      }
    }
  }

  return references;
}

function readSimulatorFile(filePath: string): SimulatorModel {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as SimulatorModel;
  } catch (error: unknown) {
    throw new Error(
      `Failed to read simulator file ${filePath}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function getSimulatorName(fileName: string): string {
  return fileName.replace("modeles-", "").replace(".json", "");
}

export async function extractSimulatorReferences(
  packageDir: string
): Promise<DocumentReferences[]> {
  const modelesDir = path.join(packageDir, "package", "lib", "modeles");

  if (!fs.existsSync(modelesDir)) {
    throw new Error(`Modeles directory not found at ${modelesDir}`);
  }

  const repo = new WarningRepository(gqlClient());
  const allReferences: DocumentReferences[] = [];

  for (const fileName of SIMULATOR_FILES) {
    const filePath = path.join(modelesDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`Simulator file not found: ${fileName}`);
      continue;
    }

    const simulatorName = getSimulatorName(fileName);
    const model = readSimulatorFile(filePath);
    const referenceUrls = extractReferencesFromModel(model);

    const articleIds = referenceUrls.flatMap((url) => extractArticleId(url));

    const references = await pMap(
      articleIds,
      async (id: string) => {
        const result = await getArticleReference(id);
        if (result === null) {
          await repo.saveWarning({
            article: id,
            document: `Simulateur ${simulatorName}`,
            source: SOURCES.TOOLS,
          });
        }
        return result;
      },
      { concurrency: 5 }
    );

    allReferences.push({
      document: {
        id: `simulator-${simulatorName}`,
        source: SOURCES.TOOLS,
        title: `Simulateur ${simulatorName}`,
        slug: simulatorName,
      },
      references: references.flatMap((item) => (item !== null ? [item] : [])),
    });
  }

  return allReferences;
}
