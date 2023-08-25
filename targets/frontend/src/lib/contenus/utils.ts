import { RELATIONS } from "src/lib/relations";
import { ContentRelation } from "src/types";

export function getContentRelationIds(contentRelations: ContentRelation[]) {
  return contentRelations
    ?.map((relation: ContentRelation) => relation?.relationId)
    .filter(Boolean);
}

export function mapContentRelations(
  contentRelations: ContentRelation[],
  docAId: string
) {
  return contentRelations.map((relation: ContentRelation, index: number) => ({
    data: { position: index },
    document_a: docAId,
    document_b: relation?.cdtnId,
    id: relation?.relationId,
    type: RELATIONS.DOCUMENT_CONTENT,
  }));
}
