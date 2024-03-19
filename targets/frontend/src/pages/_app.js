import "@reach/menu-button/styles.css";
import "@reach/dialog/styles.css";
import "@reach/accordion/styles.css";
import "../css/modeles.css";
import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";

import { init } from "@socialgouv/matomo-next";
import { SessionProvider } from "next-auth/react";
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

function App({ Component, pageProps: { session, ...pageProps }, err }) {
  useEffect(() => {
    init({
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
      url: process.env.NEXT_PUBLIC_MATOMO_URL,
    });
  }, []);
  // Workaround for https://github.com/vercel/next.js/issues/8592
  return (
    <MuiDsfrThemeProvider>
      <SessionProvider session={session}>
        <Component {...pageProps} err={err} />
      </SessionProvider>
    </MuiDsfrThemeProvider>
  );
}

export default withDsfr(App);
