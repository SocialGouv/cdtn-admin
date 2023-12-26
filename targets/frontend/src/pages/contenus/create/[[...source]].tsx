import { generateIds } from "@shared/utils";
import slugify from "@socialgouv/cdtn-slugify";
import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import { useRouter } from "next/router";
import { HighlightsForm } from "src/components/highlights";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { PrequalifiedForm } from "src/components/prequalified";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Content } from "src/types";
import { useMutation } from "urql";
import {
  FormControl,
  InputLabel as Label,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";

import createContentMutation from "./createContent.mutation.graphql";
import {
  getContentRelationIds,
  mapContentRelations,
} from "../../../lib/contenus/utils";

const CREATABLE_SOURCES = [SOURCES.HIGHLIGHTS, SOURCES.PREQUALIFIED];

export function CreateDocumentPage() {
  const router = useRouter();
  const [source = ""] = (router.query.source as string[]) || [];
  const [createResult, createContent] = useMutation(createContentMutation);

  async function onSubmit({
    contentRelations = [],
    document = {},
    isSearchable,
    isPublished,
    metaDescription,
    slug,
    title,
  }: Content) {
    const newIds = generateIds(source);
    const relationIds = getContentRelationIds(contentRelations);
    const relations = mapContentRelations(contentRelations, newIds.cdtn_id);
    const result = await createContent({
      ...newIds,
      document,
      isPublished: typeof isPublished !== "undefined" ? isPublished : true,
      isSearchable: typeof isSearchable !== "undefined" ? isSearchable : true,
      metaDescription: metaDescription || document.description || title,
      relations,
      relationIds,
      slug: slug || slugify(title as string),
      source,
      title,
    });
    if (!result.error) {
      router.back();
    } else {
      console.error(result.error);
    }
  }

  let ContentForm;
  switch (source) {
    case SOURCES.HIGHLIGHTS:
      ContentForm = HighlightsForm;
      break;
    case SOURCES.PREQUALIFIED:
      ContentForm = PrequalifiedForm;
      break;
    default:
      // eslint-disable-next-line react/display-name
      ContentForm = () => null;
  }

  return (
    <Layout title="Ajouter un contenu">
      <Stack>
        <form>
          <FormControl sx={{ m: 1, width: 500 }}>
            <Label htmlFor="source">Type de document</Label>
            <Select
              name="source"
              id="source"
              value={source}
              input={<OutlinedInput label="source" />}
              onChange={(event) => {
                router.replace(
                  `/contenus/create/${event.target.value}`,
                  undefined,
                  { shallow: true }
                );
              }}
            >
              <MenuItem disabled value="">
                ...
              </MenuItem>
              {CREATABLE_SOURCES.map((item) => (
                <MenuItem key={item} value={item}>
                  {getLabelBySource(item)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>
        {source && (
          <ContentForm loading={createResult.fetching} onSubmit={onSubmit} />
        )}
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(CreateDocumentPage));
