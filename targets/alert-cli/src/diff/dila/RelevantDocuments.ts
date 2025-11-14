import getContribReferences from "./extractReferences/contribution";
import getEditorialContentReferences from "./extractReferences/editorialContents";
import getTravailEmploiReferences from "./extractReferences/ficheTravailEmploi";
import getMailTemplateReferences from "./extractReferences/mailTemplates";
import getInfographicReferences from "./extractReferences/infographics";
import getSimulatorReferences from "./extractReferences/simulators";
import { DilaChanges } from "./types";
import { DocumentReferences } from "@socialgouv/cdtn-types";

export interface RelevantDocumentsExtractor {
  extractReferences({
    modified,
    removed,
  }: Pick<DilaChanges, "modified" | "removed">): Promise<DocumentReferences[]>;
}

export class RelevantDocumentsExtractorImpl
  implements RelevantDocumentsExtractor
{
  async extractReferences({
    modified,
    removed,
  }: Pick<DilaChanges, "modified" | "removed">): Promise<DocumentReferences[]> {
    const contribReferences = await getContribReferences();
    const travailEmploiReferences = await getTravailEmploiReferences();
    const mailTemplateRef = await getMailTemplateReferences();
    const editorialContentRef = await getEditorialContentReferences();
    const simulatorRef = await getSimulatorReferences();
    const infographicRef = await getInfographicReferences();
    const docsReferences = contribReferences.concat(
      travailEmploiReferences,
      mailTemplateRef,
      editorialContentRef,
      simulatorRef,
      infographicRef
    );
    return docsReferences.flatMap((item) => {
      const references = item.references.filter(
        (ref) =>
          modified.find(
            (node) => node.id === ref.dila_id || node.cid === ref.dila_cid
          ) ??
          removed.find(
            (node) => node.id === ref.dila_id || node.cid === ref.dila_cid
          )
      );

      if (references.length > 0) {
        return [{ document: item.document, references }];
      }
      return [];
    });
  }
}
