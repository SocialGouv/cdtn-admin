import { createProxyMiddleware } from "http-proxy-middleware";

export const config = {
  api: {
    bodyParser: false,
  },
  externalResolver: true,
};

const proxy = createProxyMiddleware({
  changeOrigin: true,
  followRedirects: true,
  logLevel: "debug",
  onError: (err, req, res) => {
    res.writeHead(500, {
      "Content-Type": "text/plain",
    });
    res.end("Something went wrong. We've been notified.");
  },
  pathRewrite: { "^/api/graphql": "/v1/graphql" },
  prependPath: false,
  target:
    process.env.HASURA_GRAPHQL_ENDPOINT ?? "http://localhost:8080/v1/graphql",
  ws: true,
  xfwd: true, // proxy websockets
});

export default proxy;
