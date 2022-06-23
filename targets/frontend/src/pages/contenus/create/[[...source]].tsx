import { generateIds } from "@shared/id-generator";
import slugify from "@socialgouv/cdtn-slugify";
import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import { useRouter } from "next/router";
import { EditorialContentForm } from "src/components/editorialContent";
import { HighlightsForm } from "src/components/highlights";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { PrequalifiedForm } from "src/components/prequalified";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { RELATIONS } from "src/lib/relations";
import { Content, ContentRelation } from "src/types";
import { Label, Select } from "theme-ui";
import { useMutation } from "urql";

import createContentMutation from "./createContent.mutation.graphql";

const CREATABLE_SOURCES = [
  SOURCES.EDITORIAL_CONTENT,
  SOURCES.THEMATIC_FILES,
  SOURCES.HIGHLIGHTS,
  SOURCES.PREQUALIFIED,
];

export function CreateDocumentPage() {
  const router = useRouter();
  const [source = ""] = (router.query.source as string[]) || [];
  const [createResult, createContent] = useMutation(createContentMutation);

  async function onSubmit({
    contents = [],
    document = {},
    isSearchable,
    isPublished,
    metaDescription,
    slug,
    title,
  }: Content) {
    const newIds = generateIds(source);
    const result = await createContent({
      ...newIds,
      document,
      isPublished: typeof isPublished !== "undefined" ? isPublished : true,
      isSearchable: typeof isSearchable !== "undefined" ? isSearchable : true,
      metaDescription: metaDescription || document.description || title,
      relations: contents.map(({ cdtnId }: ContentRelation, index: number) => ({
        data: { position: index },
        document_a: newIds.cdtn_id,
        document_b: cdtnId,
        type: RELATIONS.DOCUMENT_CONTENT,
      })),
      slug: slug || slugify(title as string),
      source,
      title,
    });
    if (result && !result.error) {
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
    case SOURCES.PREQUALIFIED:
      ContentForm = PrequalifiedForm;
      break;
    default:
      //eslint-disable-next-line react/display-name
      ContentForm = () => <span>Soon...</span>;
  }

  return (
    <Layout title="Ajouter un contenu">
      <Stack>
        <form>
          <Label htmlFor="source">
            Quel type de document souhaitez vous ajouter&nbsp;?
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
