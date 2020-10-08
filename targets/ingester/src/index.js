import { client } from "@shared/graphql-client";
import { generateCdtnId } from "@shared/id-generator";

import { cdtnDocumentsGen } from "./listDocuments";
import { logger } from "./logger";

logger.silent = true;
const t0 = Date.now();

const insertDocumentsMutation = `
mutation insert_documents($document: documents_insert_input!) {
  document: insert_documents_one(object: $document,  on_conflict: {
    constraint: documents_initial_id_source_key,
    update_columns: [title, source, slug, text, document]
  }) {
   cdtn_id
  }
}
`;

async function populate() {
  for await (const docs of cdtnDocumentsGen()) {
    console.error(`› ${docs[0].source}... ${docs.length} items`);

    for (const doc of docs) {
      const { id, title, text, slug, source, ...document } = doc;
      const result = await client
        .mutation(insertDocumentsMutation, {
          document: {
            cdtn_id: generateCdtnId(`${source}${id}`),
            document,
            initial_id: id,
            meta_description: "",
            slug,
            source,
            text,
            title,
          },
        })
        .toPromise();

      if (result.error) {
        console.error(result.error);
        throw new Error(`insert document alert ${title}`);
      }
    }
  }
  //eslint-disable-next-line no-console
  console.error(`done in ${(Date.now() - t0) / 1000} s`);
}

if (module === require.main) {
  populate().catch((error) => {
    console.error(error);
    console.error(`done in ${(Date.now() - t0) / 1000} s`);
    process.exit(1);
  });
}
