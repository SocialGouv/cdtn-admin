import { SOURCES } from "@socialgouv/cdtn-sources";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { ThemePicker } from "src/components/forms/ContentPicker/ThemePicker";
import { getUnthemedContentQuery } from "src/components/home/UnThemedContent";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { Li, List } from "src/components/list";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { RELATIONS } from "src/lib/relations";
import { Box, Flex, Message, Spinner, Text } from "theme-ui";
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
      themeSources: [
        SOURCES.SHEET_MT_PAGE,
        SOURCES.SHEET_SP,
        SOURCES.CONTRIBUTIONS,
        SOURCES.EDITORIAL_CONTENT,
        SOURCES.LETTERS,
        SOURCES.EXTERNALS,
        SOURCES.TOOLS,
      ],
    },
  });

  const [resultInsert, insertRelations] = useMutation(insertRelationMutation);

  function onSubmit(data) {
    console.log("submit", data);
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
    console.log("insert");
    insertRelations({ relations: themedDocuments }).then(() => {
      console.log("fetch");
      reexecuteQuery({ requestPolicy: "network-only" });
    });
  }
  const { data, fetching, error } = result;
  console.log(resultInsert.fetching, fetching, result.stale);

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
    <Layout title="Contenus sans thèmes">
      {!data && fetching && <Spinner />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <List>
            {data?.documents.map(({ cdtnId, source, title }) => {
              return (
                <Li key={cdtnId}>
                  <Flex pt="small">
                    <Box sx={{ flex: 1, lineHeight: 1.2 }} title={title}>
                      <Text sx={{ color: "grey", fontSize: "small" }}>
                        {source}
                      </Text>
                      <Box sx={{ minWidth: 0 }}>
                        <Text
                          sx={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {title}
                        </Text>
                      </Box>
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
              );
            })}
          </List>

          {data?.documents.length > 0 && (
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
