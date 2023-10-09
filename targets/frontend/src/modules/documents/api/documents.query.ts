export const getDocumentsUpdatedAfterDateQuery = `
query GetDocuments($updated_at: timestamptz!, $sources: [String!]) {
  documents(where: {
        updated_at: {_gte: $updated_at},
        source: {_in: $sources}
      },
      order_by: {updated_at: desc}) {
        title
        source
        slug
        cdtnId: cdtn_id
        isPublished: is_published
        isAvailable: is_available
      }
}`;
