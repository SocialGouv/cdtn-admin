import {
  ContributionElasticDocument,
  OldContributionElasticDocument,
} from "@shared/types";

export function getIDCCs(
  oldContributions: OldContributionElasticDocument[],
  newContributions: ContributionElasticDocument[]
) {
  const contribIDCCs = new Set<number>();
  oldContributions.forEach(({ answers }: any) => {
    if (answers.conventionAnswer) {
      const idccNum = parseInt(answers.conventionAnswer.idcc);
      contribIDCCs.add(idccNum);
    }
  });
  newContributions.forEach((contrib: any) => {
    if (contrib.idcc !== "0000") {
      const idccNum = parseInt(contrib.idcc);
      contribIDCCs.add(idccNum);
    }
  });
  return contribIDCCs;
}
