import type { DataDiffFunction } from "../../type";
import processAgreementChanges from "./ProcessAgreementChanges";
import processAgreementFileChanges from "./ProcessAgreementFileChanges";
import { RelevantDocumentsExtractorImpl } from "../ReleventDocuments";

const processAgreementDataDiff: DataDiffFunction = async ({
  tag,
  patches,
  fileFilter,
  loadFile,
}) => {
  const fileChanges = await processAgreementFileChanges(
    patches,
    fileFilter,
    loadFile
  );

  const dilaChanges = await processAgreementChanges(
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

export default processAgreementDataDiff;
