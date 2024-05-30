import { fetchGlossary } from "@shared/utils";
import { context } from "../context";
import { Glossary } from "@socialgouv/cdtn-types";

export const getGlossary = async (): Promise<Glossary> => {
  const graphqlEndpoint: string =
    context.get("cdtnAdminEndpoint") || "http://localhost:8080/v1/graphql";
  const adminSecret: string =
    context.get("cdtnAdminEndpointSecret") || "admin1";
  return await fetchGlossary({ adminSecret, graphqlEndpoint });
};
