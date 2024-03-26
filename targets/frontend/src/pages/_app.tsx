import "@reach/menu-button/styles.css";
import "@reach/dialog/styles.css";
import "@reach/accordion/styles.css";
import "../css/modeles.css";
import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";

import { init } from "@socialgouv/matomo-next";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import Link from "next/link";
import type { AppProps } from "next/app";
import { withUrqlClient } from "next-urql";
import { cacheExchange, fetchExchange, mapExchange } from "urql";
import {
  authExchangeUrql,
  mapExchangeUrql,
} from "src/modules/authentification/exchanges";

declare module "@codegouvfr/react-dsfr/next-pagesdir" {
  interface RegisterLink {
    Link: typeof Link;
  }
}

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

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    init({
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID ?? "",
      url: process.env.NEXT_PUBLIC_MATOMO_URL ?? "",
    });
  }, []);

  return (
    <MuiDsfrThemeProvider>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </MuiDsfrThemeProvider>
  );
}

export default withUrqlClient((ssrExchange) => ({
  url:
    process.env.HASURA_GRAPHQL_ENDPOINT ?? "http://localhost:8080/v1/graphql",
  exchanges: [
    cacheExchange,
    ssrExchange,
    fetchExchange,
    authExchangeUrql,
    mapExchangeUrql,
  ],
  neverSuspend: true,
  requestPolicy: "cache-first",
}))(withDsfr(App));
