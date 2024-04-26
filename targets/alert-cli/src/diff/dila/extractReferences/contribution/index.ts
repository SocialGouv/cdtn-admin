import type { DocumentReferences } from "@socialgouv/cdtn-types";
import memoizee from "memoizee";
import { getContributionsReferences } from "./getContributionsReferences";

async function getContributionReferences(): Promise<DocumentReferences[]> {
  const references = await getContributionsReferences();

  return [...references];
}

export default memoizee(getContributionReferences, { promise: true });
