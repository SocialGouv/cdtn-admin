import { createProxyMiddleware } from "http-proxy-middleware";

// Note : Utiliser un proxy évite d'exposer publiquement le Hasura GraphQL endpoint

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

const proxy = createProxyMiddleware({
  changeOrigin: true,
  pathRewrite: { "^/api/graphql": "/v1/graphql" },
  prependPath: false,
  target:
    process.env.HASURA_GRAPHQL_ENDPOINT ?? "http://localhost:8080/v1/graphql",
});

export default proxy;
