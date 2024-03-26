import "@reach/menu-button/styles.css";
import "@reach/dialog/styles.css";
import "@reach/accordion/styles.css";
import "../css/modeles.css";
import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";
import { SessionProvider } from "next-auth/react";
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
  preloadFonts: ["Marianne-Regular", "Marianne-Medium", "Marianne-Bold"],
});

export { dsfrDocumentApi };

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
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
  requestPolicy: "cache-first",
}))(withDsfr(App));
