import { getLabelBySource, getRouteBySource } from "@socialgouv/cdtn-sources";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { ThemePicker } from "src/components/forms/ContentPicker/ThemePicker";
import {
  getUnthemedContentQuery,
  THEMABLE_CONTENT,
} from "src/components/home/UnThemedContent";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { Li, List } from "src/components/list";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { RELATIONS } from "src/lib/relations";
import { Box, Flex, Heading, Message, NavLink, Spinner } from "theme-ui";
import { useMutation, useQuery } from "urql";

const insertRelationMutation = `
mutation insertRelation ($relations: [document_relations_insert_input!]!){
  insert_document_relations(objects: $relations) {
    affected_rows
  }
}
`;

export function UnthemedPage() {
  const { handleSubmit, control } = useForm();

  const [result, reexecuteQuery] = useQuery({
    query: getUnthemedContentQuery,
    variables: {
      themeSources: THEMABLE_CONTENT,
    },
  });

  const [resultInsert, insertRelations] = useMutation(insertRelationMutation);

  function onSubmit(data) {
    const themedDocuments = Object.entries(data).flatMap(
      ([contentId, theme]) => {
        if (!theme) return [];
        return {
          data: { position: theme.position },
          document_a: theme.cdtnId,
          document_b: contentId,
          type: RELATIONS.THEME_CONTENT,
        };
      }
    );
    insertRelations({ relations: themedDocuments }).then(() => {
      reexecuteQuery({ requestPolicy: "network-only" });
    });
  }
  const { data, fetching, error } = result;
  const documentMap =
    data?.documents.reduce((state, { cdtnId, source, title, slug }) => {
      // eslint-disable-next-line no-prototype-builtins
      if (state.hasOwnProperty(source)) {
        state[source].push({ cdtnId, slug, title });
      } else state[source] = [{ cdtnId, slug, title }];
      return state;
    }, {}) || {};
  const documentsBySource = Object.entries(documentMap);
  if (error) {
    return (
      <Layout title="Contenus sans thèmes">
        <Stack>
          <Message>
            <pre>{JSON.stringify(error, 2)}</pre>
          </Message>
        </Stack>
      </Layout>
    );
  }

  return (
    <Layout title="Contenus sans thème">
      {!data && fetching && <Spinner />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          {documentsBySource.map(([source, documents]) => {
            return (
              <Stack key={source} gap="small">
                <Heading as="h2" p="0" sx={{ fontSize: "large" }}>
                  {getLabelBySource(source)}
                </Heading>
                <List>
                  {documents.map(({ cdtnId, title, slug }) => (
                    <Li key={cdtnId}>
                      <Flex paddingBottom="xxsmall">
                        <Box
                          sx={{ flex: 1, marginRight: "small", minWidth: 0 }}
                          title={title}
                        >
                          <NavLink
                            href={`https://cdtn-preprod-code-travail.dev2.fabrique.social.gouv.fr/${getRouteBySource(
                              source
                            )}/${slug}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            sx={{
                              display: "block",
                              fontWeight: "300",
                              overflow: "hidden",
                              textDecoration: "underline",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {title}
                          </NavLink>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <ThemePicker
                            name={`${cdtnId}`}
                            control={control}
                            defaultValue=""
                          />
                        </Box>
                      </Flex>
                    </Li>
                  ))}
                </List>
              </Stack>
            );
          })}

          {documentsBySource.length > 0 && (
            <Box>
              <Button
                type="submit"
                disabled={fetching || resultInsert.fetching}
              >
                Enregistrer
              </Button>
            </Box>
          )}
        </Stack>
      </form>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(UnthemedPage));
