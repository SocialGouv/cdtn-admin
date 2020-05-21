import { createProxyMiddleware } from "http-proxy-middleware";

export const config = {
  api: {
    bodyParser: false,
  },
};

const proxy = createProxyMiddleware({
  target: process.env.GRAPHQL_ENDPOINT,
  changeOrigin: true,
  xfwd: true,
  prependPath: false,
  followRedirects: true,
  pathRewrite: { "^/api/graphql": "/v1/graphql" },
  logLevel: "debug",
  onError: (err, req, res) => {
    res.writeHead(500, {
      "Content-Type": "text/plain",
    });
    // todo: sentry
    res.end("Something went wrong. We've been notified.");
  },
  ws: true, // proxy websockets
});

export default proxy;
