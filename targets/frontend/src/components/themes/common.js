export const updateContentsMutation = `
mutation UpdateContents(
  $contents: [contents_insert_input!]!
  $relationIds: [uuid!]!,
  $themeId: uuid = ""
) {
  delete_content_relations(where: {id: {_nin: $relationIds}, theme_id: {_eq: $themeId}}) {
    affected_rows
  }
  insert_contents(
    objects: $contents,
    on_conflict: {
      constraint: contents_pkey,
      update_columns: [slug, source, title, url]
    }
  ){
    affected_rows
  }
}
`;

export const formatContentsMutation = ({ contents, themeId }) => {
  return {
    contents: contents.map(
      ({ relationId, cdtnId, slug, source, title, url }, index) => ({
        cdtn_id: cdtnId,
        relations: {
          data: {
            id: relationId,
            theme_id: themeId,
            theme_position: index,
          },
          on_conflict: {
            constraint: "content_relations_pkey",
            update_columns: ["theme_position"],
          },
        },
        slug,
        source,
        title,
        url,
      })
    ),
    relationIds: contents.map(({ relationId }) => relationId).filter(Boolean),
    themeId,
  };
};
