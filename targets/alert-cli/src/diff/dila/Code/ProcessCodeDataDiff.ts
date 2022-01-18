import type { DataDiffFunction } from "../../type";
import { getRelevantDocuments } from "../ReleventDocuments";
import processCodeChanges from "./ProcessCodeChanges";
import processCodeFileChanges from "./ProcessCodeFileChanges";

const processCodeDataDiff: DataDiffFunction = async ({
  tag,
  patches,
  fileFilter,
  prevTree,
  currTree,
}) => {
  const fileChanges = await processCodeFileChanges(
    patches,
    fileFilter,
    prevTree,
    currTree
  );

  const dilaChanges = await processCodeChanges(
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

export default processCodeDataDiff;
