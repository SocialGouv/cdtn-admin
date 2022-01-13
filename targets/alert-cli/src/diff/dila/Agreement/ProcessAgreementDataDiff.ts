import type { DataDiffFunction } from "../../type";
import { getRelevantDocuments } from "../ReleventDocuments";
import processAgreementChanges from "./ProcessAgreementChanges";
import processAgreementFileChanges from "./ProcessAgreementFileChanges";

const processAgreementDataDiff: DataDiffFunction = async ({
  tag,
  patches,
  fileFilter,
  prevTree,
  currTree,
}) => {
  const fileChanges = await processAgreementFileChanges(
    patches,
    fileFilter,
    prevTree,
    currTree
  );

  const dilaChanges = await processAgreementChanges(
    tag,
    fileChanges,
    getRelevantDocuments
  );

  return dilaChanges.flatMap((change) => {
    if (
      change.modified.length > 0 ||
      change.removed.length ||
      change.added.length
    ) {
      return [
        {
          date: tag.commit.date(),
          ref: tag.ref,
          type: "dila",
          ...change,
        },
      ];
    }
    return [];
  });
};

export default processAgreementDataDiff;
