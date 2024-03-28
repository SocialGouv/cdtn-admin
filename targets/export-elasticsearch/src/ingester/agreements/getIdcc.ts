import { ContributionElasticDocument } from "@shared/types";

export function getIDCCs(contributions: ContributionElasticDocument[]) {
  const contribIDCCs = new Set<number>();
  contributions.forEach((contrib: any) => {
    if (contrib.idcc !== "0000") {
      const idccNum = parseInt(contrib.idcc);
      contribIDCCs.add(idccNum);
    }
  });
  return contribIDCCs;
}
