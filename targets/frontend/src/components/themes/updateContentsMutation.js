import { RELATIONS } from "src/lib/relations";

export const updateContentsMutation = `
mutation UpdateContents(
  $relations: [document_relations_insert_input!]!,
  $relationIds: [uuid!]!,
  $themeId: String!
) {
  delete_document_relations(
    where: {
      id: {_nin: $relationIds},
      document_a: {_eq: $themeId},
      type: {_eq: "${RELATIONS.THEME_CONTENT}"}
    }
  ) {
    affected_rows
  }
  insert_document_relations(
    objects: $relations,
    on_conflict: {
      constraint: document_relations_pkey,
      update_columns: data
    }
  ) {
    affected_rows
  }
}
`;

export const formatContentsMutation = ({ contents, themeId }) => {
  return {
    relationIds: contents.map(({ relationId }) => relationId).filter(Boolean),
    relations: contents.map(({ relationId, cdtnId }, index) => ({
      data: { position: index },
      document_a: themeId,
      document_b: cdtnId,
      id: relationId,
      type: RELATIONS.THEME_CONTENT,
    })),
    themeId,
  };
};
