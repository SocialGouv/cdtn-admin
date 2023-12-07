import type { DocumentReferences } from "@shared/types";
import memoizee from "memoizee";
import { getContributionsReferences } from "./getContributionsReferences";
import { getOldContribRef } from "./getOldContribRef";

async function getContributionReferences(): Promise<DocumentReferences[]> {
  const references = await getContributionsReferences();
  const oldReferences = await getOldContribRef();

  return [...references, ...oldReferences];
}

export default memoizee(getContributionReferences, { promise: true });
