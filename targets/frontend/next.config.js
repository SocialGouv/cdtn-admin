// Use the hidden-source-map option when you don't want the source maps to be
// publicly available on the servers, only to the error reporting
const withSourceMaps = require("@zeit/next-source-maps")();
const withTM = require("next-transpile-modules")([
  "@shared/graphql-client",
  "@shared/id-generator",
]);

const basePath = "";

module.exports = withTM(
  withSourceMaps({
    basePath,
    serverRuntimeConfig: {
      rootDir: __dirname,
    },
    webpack: (config, options) => {
      // In `pages/_app.js`, Sentry is imported from @sentry/node. While
      // @sentry/browser will run in a Node.js environment, @sentry/node will use
      // Node.js-only APIs to catch even more unhandled exceptions.
      //
      // This works well when Next.js is SSRing your page on a server with
      // Node.js, but it is not what we want when your client-side bundle is being
      // executed by a browser.
      //
      // Luckily, Next.js will call this webpack function twice, once for the
      // server and once for the client. Read more:
      // https://nextjs.org/docs#customizing-webpack-config
      //
      // So ask Webpack to replace @sentry/node imports with @sentry/browser when
      // building the browser's bundle
      if (!options.isServer) {
        config.resolve.alias["@sentry/node"] = "@sentry/browser";
      }
      return config;
    },
  })
);
