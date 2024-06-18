import { gqlClient } from "@shared/utils";
import { context } from "../context";
import { Glossary } from "@socialgouv/cdtn-types";
import { getGlossaryQuery } from "../../repositories/graphql";

export const getGlossary = async (): Promise<Glossary> => {
  const graphqlEndpoint: string =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const adminSecret: string =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  const result = await gqlClient({
    graphqlEndpoint,
    adminSecret,
  })
    .query<{ glossary: Glossary }>(getGlossaryQuery, {})
    .toPromise();
  if (result.error || !result.data) {
    console.error(result.error);
    throw new Error(
      `Error fetching glossary => ${JSON.stringify(result.error)}`
    );
  }
  return result.data.glossary;
};
