export const previewContentAction = `
mutation preview( $cdtnId: String! $document: jsonb! $source: String!) {
    preview_document(cdtnId: $cdtnId, document: $document, source: $source)
}
`;
