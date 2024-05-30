import { Glossary } from "@socialgouv/cdtn-types";
import { gqlClient, gqlDefaultProps } from "../gqlClient";

const gqlGlossary = `
  query Glossary {
    glossary {
      term
      abbreviations
      definition
      variants
      references
      slug
    }
  }
`;

export async function fetchGlossary(
  props = gqlDefaultProps
): Promise<Glossary> {
  const result = await gqlClient(props)
    .query<{ glossary: Glossary }>(gqlGlossary, {})
    .toPromise();
  if (result.error || !result.data) {
    console.error(result.error);
    throw new Error(
      `Error fetching glossary => ${JSON.stringify(result.error)}`
    );
  }
  return result.data.glossary;
}
