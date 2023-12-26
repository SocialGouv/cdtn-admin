import type { DataDiffFunction } from "../../../types";
import processCodeChanges from "./ProcessCodeChanges";
import processCodeFileChanges from "./ProcessCodeFileChanges";
import { RelevantDocumentsExtractorImpl } from "../RelevantDocuments";

const processCodeDataDiff: DataDiffFunction = async ({
  tag,
  patches,
  fileFilter,
  loadFile,
}) => {
  const fileChanges = await processCodeFileChanges(
    patches,
    fileFilter,
    loadFile
  );

  const dilaChanges = await processCodeChanges(
    tag,
    fileChanges,
    new RelevantDocumentsExtractorImpl()
  );

  return dilaChanges.flatMap((change) => {
    if (
      change.modified.length > 0 ||
      change.removed.length ||
      change.added.length
    ) {
      return [
        {
          date: tag.commit.date,
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
