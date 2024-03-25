import { getLabelBySource, getRouteBySource } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { ThemePicker } from "src/components/forms/ContentPicker/ThemePicker";
import {
  getUnthemedContentQuery,
  THEMABLE_CONTENT,
} from "src/components/home/UnThemedContent";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { RELATIONS } from "src/lib/relations";
import { Box, CircularProgress, Alert, List, ListItem } from "@mui/material";
import { useMutation, useQuery } from "@urql/next";
import { theme } from "../theme";

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
          <Alert variant="error">
            <pre>{JSON.stringify(error, 2)}</pre>
          </Alert>
        </Stack>
      </Layout>
    );
  }

  return (
    <Layout title="Contenus sans thème">
      {!data && fetching && <CircularProgress />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          {documentsBySource.map(([source, documents]) => {
            return (
              <Stack key={source} gap={theme.space.small}>
                <h2 style={{ marginBottom: "0px" }}>
                  {getLabelBySource(source)}
                </h2>
                <List>
                  {documents.map(({ cdtnId, title, slug }) => (
                    <ListItem
                      key={cdtnId}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          marginRight: theme.space.xsmall,
                          minWidth: 0,
                        }}
                        title={title}
                      >
                        <Link
                          href={`https://code-du-travail-numerique-preprod.dev.fabrique.social.gouv.fr/${getRouteBySource(
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
                        </Link>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <ThemePicker
                          name={`${cdtnId}`}
                          control={control}
                          defaultValue=""
                        />
                      </Box>
                    </ListItem>
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

export default UnthemedPage;
