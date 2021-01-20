import { generateIds } from "@shared/id-generator";
import slugify from "@socialgouv/cdtn-slugify";
import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import { useRouter } from "next/router";
import { EditorialContentForm } from "src/components/editorialContent/Form";
import { HighlightsForm } from "src/components/highlights/Form";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { RELATIONS } from "src/lib/relations";
import { Label, Select } from "theme-ui";
import { useMutation } from "urql";

const CREATABLE_SOURCES = [
  SOURCES.EDITORIAL_CONTENT,
  SOURCES.THEMATIC_FILES,
  SOURCES.HIGHLIGHTS,
];

const createContentMutation = `
mutation CreateContent(
  $cdtn_id: String!,
  $document: jsonb!,
  $initial_id: String!,
  $isSearchable: Boolean!,
  $metaDescription: String!,
  $relations: [document_relations_insert_input!]!,
  $slug: String!,
  $source: String!
  $title: String!,
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
    is_searchable: $isSearchable,
    is_published: true
  }) {
    cdtn_id
  }
  insert_document_relations(
    objects: $relations
  ) {
    affected_rows
  }
}
`;

export function CreateDocumentPage() {
  const router = useRouter();
  const [source = ""] = router.query.source || [];
  const [createResult, createContent] = useMutation(createContentMutation);

  async function onSubmit({
    contents = [],
    document = {},
    isSearchable,
    metaDescription,
    slug,
    title,
  }) {
    const newIds = generateIds(source);
    const result = await createContent({
      ...newIds,
      document,
      isSearchable: typeof isSearchable !== "undefined" ? isSearchable : true,
      metaDescription: metaDescription || document.description || title,
      relations: contents.map(({ cdtnId }, index) => ({
        data: { position: index },
        document_a: newIds.cdtn_id,
        document_b: cdtnId,
        type: RELATIONS.DOCUMENT_CONTENT,
      })),
      slug: slug || slugify(title),
      source,
      title,
    });
    if (!result.error) {
      router.back();
    }
  }

  let ContentForm;
  switch (source) {
    case SOURCES.HIGHLIGHTS:
      ContentForm = HighlightsForm;
      break;
    case SOURCES.EDITORIAL_CONTENT:
      ContentForm = EditorialContentForm;
      break;
    default:
      //eslint-disable-next-line react/display-name
      ContentForm = () => <span>Soon...</span>;
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
        {source && (
          <ContentForm loading={createResult.fetching} onSubmit={onSubmit} />
        )}
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(CreateDocumentPage));
