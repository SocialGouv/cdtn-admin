export function isHTML(input: string): boolean {
  return /<\/?[a-z][^>]*>|&\w+;/i.test(input);
}
