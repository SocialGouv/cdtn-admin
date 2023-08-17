import "@reach/menu-button/styles.css";
import "@reach/dialog/styles.css";
import "@reach/accordion/styles.css";
import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";

import { RewriteFrames } from "@sentry/integrations";
import * as Sentry from "@sentry/node";
import { init } from "@socialgouv/matomo-next";
import getConfig from "next/config";
import PropTypes from "prop-types";
import { useEffect } from "react";

import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import Link from "next/link";

const { withDsfr, dsfrDocumentApi } = createNextDsfrIntegrationApi({
  defaultColorScheme: "system",
  Link,
  preloadFonts: [
    //"Marianne-Light",
    //"Marianne-Light_Italic",
    "Marianne-Regular",
    //"Marianne-Regular_Italic",
    "Marianne-Medium",
    //"Marianne-Medium_Italic",
    "Marianne-Bold",
    //"Marianne-Bold_Italic",
    //"Spectral-Regular",
    //"Spectral-ExtraBold"
  ],
});

export { dsfrDocumentApi };

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const config = getConfig();
  console.log(
    "production ? ",
    process.env.NODE_ENV === "production" && process.env.PRODUCTION === "true"
  );
  const distDir = `${config.serverRuntimeConfig.rootDir}/.next`;
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled:
      process.env.NODE_ENV === "production" &&
      process.env.PRODUCTION === "true",
    integrations: [
      new RewriteFrames({
        iteratee: (frame) => {
          frame.filename = frame.filename.replace(distDir, "app:///_next");
          return frame;
        },
      }),
    ],
    release: process.env.CI_COMMIT_SHORT_SHA,
  });
}

function App({ Component, pageProps, err }) {
  useEffect(() => {
    init({
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
      url: process.env.NEXT_PUBLIC_MATOMO_URL,
    });
  }, []);
  // Workaround for https://github.com/vercel/next.js/issues/8592
  return (
    <MuiDsfrThemeProvider>
      <Component {...pageProps} err={err} />
    </MuiDsfrThemeProvider>
  );
}

export default withDsfr(App);

App.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  err: PropTypes.object,
  pageProps: PropTypes.object,
};
