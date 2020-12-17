/** @jsx jsx  */
import { generateIds } from "@shared/id-generator";
import slugify from "@socialgouv/cdtn-slugify";
import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import { useRouter } from "next/router";
import { EditorialContentForm } from "src/components/editorialContent/Form";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { jsx, Label, Select } from "theme-ui";
import { useMutation } from "urql";

const CREATABLE_SOURCES = [SOURCES.EDITORIAL_CONTENT, SOURCES.THEMATIC_FILES];

const createDocumentMutation = `
mutation CreateEditorialContent(
  $cdtn_id: String!,
  $initial_id: String!,
  $title: String!,
  $slug: String!,
  $metaDescription: String!,
  $document: jsonb!,
  $source: String!
) {
  insert_documents_one(object: {
    cdtn_id: $cdtn_id,
    initial_id: $initial_id,
    title: $title,
    slug: $slug,
    meta_description: $metaDescription,
    document: $document,
    source: $source,
    text: "",
    is_available: true,
    is_searchable: true,
    is_published: true
  }) {
    cdtn_id
  }
}
`;

export function CreateDocumentPage() {
  const router = useRouter();
  const [source = ""] = router.query.source || [];
  const [createResult, createDocument] = useMutation(createDocumentMutation);

  async function onSubmit({ title, metaDescription, document }) {
    console.log({ source });
    const result = await createDocument({
      ...generateIds(SOURCES.EDITORIAL_CONTENT),
      document,
      metaDescription: metaDescription || document.description || title,
      slug: slugify(title),
      source,
      title,
    });
    if (!result.error) {
      router.back();
    }
  }

  return (
    <Layout title="Créer un contenu">
      <Stack>
        <form>
          <Label htmlFor="source">
            Quel type de document souhaitez vous créer&nbsp;?
          </Label>
          <Select
            name="source"
            id="source"
            defaultValue={source}
            onChange={(event) => {
              router.replace(
                `/contenus/create/${event.target.value}`,
                undefined,
                { shallow: true }
              );
            }}
          >
            <option disabled value="">
              ...
            </option>
            {CREATABLE_SOURCES.map((item) => (
              <option key={item} value={item}>
                {getLabelBySource(item)}
              </option>
            ))}
          </Select>
        </form>
        {source === SOURCES.EDITORIAL_CONTENT && (
          <EditorialContentForm
            loading={createResult.fetching}
            onSubmit={onSubmit}
          />
        )}
        {source === SOURCES.THEMATIC_FILES && <strong>soon</strong>}
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(CreateDocumentPage));
