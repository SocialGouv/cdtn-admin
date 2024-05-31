import {
  DocumentElasticWithSource,
  EditorialContentDoc,
} from "@socialgouv/cdtn-types";
import { getRelatedIdsDocuments } from "./getRelatedIdsDocuments";

interface Return {
  documents: DocumentElasticWithSource<EditorialContentDoc>[];
  relatedIdsDocuments: string[];
}

export const generateEditorialContents = (
  documents: DocumentElasticWithSource<EditorialContentDoc>[]
): Return => {
  //   intro: data.intro,
  //   introWithGlossary: addGlossaryContentToMarkdown(
  //     glossary,
  //     data.intro ?? ""
  //   ),
  //   description: data.description,
  //   sectionDisplayMode: data.sectionDisplayMode,
  //   dismissalProcess: data.dismissalProcess,
  //               ? {
  //                   title: block.content,
  //                 }
  //               : {
  //                   markdown: block.content,
  //                   htmlWithGlossary: addGlossaryContentToMarkdown(
  //                     glossary,
  //                     block.content
  //                   ),
  //                 }),
  // remove markdown et intro
  const relatedIdsDocuments = getRelatedIdsDocuments(documents);
  return {
    documents,
    relatedIdsDocuments,
  };
};
