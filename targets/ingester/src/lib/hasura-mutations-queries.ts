import { client } from "@shared/graphql-client";
import { generateCdtnId } from "@shared/id-generator";
import { Agreement } from "@socialgouv/kali-data";
import { Article } from "@shared/dila-resolver/lib/types";

type Versionnable = {
  version: string;
};

const getPackageVersionQuery = `
query package_version ($repository: String!) {
  packageVersion: package_version_by_pk(repository: $repository) {
    version
  }
}
`;
type PackageVersionResult = {
  packageVersion?: Versionnable;
};

const updateDocumentAvailability = `
mutation update_documents($source: String!) {
  documents: update_documents(_set: {is_available: false}, where: {source: {_eq: $source}, is_available: {_eq: true}}) {
    affected_rows
  }
}
`;

type UpdateDocumentAvailabilityResult = {
  documents: {
    affected_rows: number;
  };
};

const insertDocumentsMutation = `
mutation insert_documents($documents: [documents_insert_input!]!) {
  documents: insert_documents(objects: $documents,  on_conflict: {
    constraint: documents_pkey,
    update_columns: [title, source, slug, text, document, is_available, is_searchable]
  }) {
   returning {cdtn_id}
  }
}
`;

type InsertdocumentResult = {
  documents: { returning: { cdtn_id: string }[] };
};

const insertRefrencesMutation = `
mutation insert_references($documents: [documents_insert_input!]!) {

}
`;

type InsertRefrencesResult = {
  documents: { returning: {}[] };
};

const insertPackageVersionMutation = `
mutation insert_package_version($object:package_version_insert_input!) {
  version: insert_package_version_one(object: $object,  on_conflict: {
    constraint: package_version_pkey,
    update_columns: version
  }) {
    repository, version
  }
}
`;

type UpsertPackageVersionResult = {
  version: {
    repository: string;
    version: string;
  };
};

export async function getLastIngestedVersion(pkgName: string) {
  const result = await client
    .query<PackageVersionResult>(getPackageVersionQuery, {
      repository: pkgName,
    })
    .toPromise();

  if (result.error) {
    console.error(result.error);
    throw new Error(`error while retrieving ingester packages version`);
  }
  if (result.data !== undefined) {
    return result.data.packageVersion?.version;
  }
}

export async function insertDocuments(docs: ingester.CdtnDocument[]) {
  const result = await client
    .mutation<InsertdocumentResult>(insertDocumentsMutation, {
      documents: docs.map(
        ({ id, text, title, slug, is_searchable, source, ...document }) => ({
          cdtn_id: generateCdtnId(`${source}${id}`),
          document,
          initial_id: id,
          is_available: true,
          is_searchable,
          meta_description: document.description || "",
          slug,
          source,
          text,
          title,
        })
      ),
    })
    .toPromise();

  if (result.error) {
    console.error(result.error.graphQLErrors[0]);
    throw new Error(`error inserting documents`);
  }
  if (result.data) {
    return result.data.documents.returning;
  }
  return [];
}

export async function initDocAvailabity(source: string) {
  console.time(` initDocAvailabity ${source}`);
  const result = await client
    .mutation<UpdateDocumentAvailabilityResult>(updateDocumentAvailability, {
      source,
    })
    .toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error(`error initializing documents availability`);
  }
  console.timeEnd(` initDocAvailabity ${source}`);
  if (!result.data) {
    throw new Error(`no data received for documents availability`);
  }
  const nbDocs = result.data.documents.affected_rows;
  console.log(` > updated availability of ${nbDocs} documents`);
  return nbDocs;
}

export async function updateVersion(repository: string, version: string) {
  const result = await client
    .mutation<UpsertPackageVersionResult>(insertPackageVersionMutation, {
      object: { repository, version },
    })
    .toPromise();
  if (result.error) {
    console.error(result.error);
    throw new Error(`error updating package_version ${repository}@${version}`);
  }
  if (!result.data) {
    throw new Error(
      `no data received for update version of ${repository}@${version}`
    );
  }
  return result.data.version;
}

export async function insertReferences(key: string, refs: Article | Agreement) {
  const result = await client
    .mutation<InsertRefrencesResult>(insertRefrencesMutation, {
      documents: refs,
    })
    .toPromise();

  if (result.error) {
    console.error(result.error.graphQLErrors[0]);
    throw new Error(`error inserting references`);
  }
  if (result.data) {
    return result.data.documents.returning;
  }
  return [];
}
