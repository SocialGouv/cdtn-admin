// Use the hidden-source-map option when you don't want the source maps to be
// publicly available on the servers, only to the error reporting
const withSourceMaps = require("@zeit/next-source-maps")();

const basePath = "";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "deny",
  },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

module.exports = {
  basePath,
  async headers() {
    return [
      {
        headers: securityHeaders,
        // Apply these headers to all routes in your application.
        source: "/:path*",
      },
    ];
  },
  poweredByHeader: false,
  webpack: (config, { isServer, dev }) => {
    config.module.rules.push({
      exclude: /node_modules/,
      loader: "graphql-tag/loader",
      test: /\.(graphql|gql)$/,
    });
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });
    return config;
  },
  transpilePackages: [
    "@shared/graphql-client",
    "@shared/id-generator",
    "@socialgouv/cdtn-ui",
    "@codegouvfr/react-dsfr",
    "tss-react",
  ],
};
