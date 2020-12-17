export const previewContentAction = `
mutation preview($data: PreviewDocument!) {
  preview_document(data: $data)
}
`;
