/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        headers: [
          {
            key: "X-Frame-Options",
            value: "deny",
          },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
        source: "/:path*",
      },
    ];
  },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.graphql": {
        loaders: ["graphql-tag/loader"],
        as: "*.js",
      },
    },
    resolveAlias: {
      fs: { browser: "./noop.mjs" },
      string_decoder: { browser: "./noop.mjs" },
    },
  },
  serverExternalPackages: ["winston"],
  transpilePackages: ["@shared/utils", "@codegouvfr/react-dsfr", "tss-react"],
};

export default nextConfig;
