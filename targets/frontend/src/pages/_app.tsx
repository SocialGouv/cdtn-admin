import "@reach/menu-button/styles.css";
import "@reach/dialog/styles.css";
import "@reach/accordion/styles.css";
import "../css/modeles.css";
import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";
import { SessionProvider } from "next-auth/react";
import { createNextDsfrIntegrationApi } from "@codegouvfr/react-dsfr/next-pagesdir";
import Link from "next/link";
import type { AppProps } from "next/app";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";
import { authExchangeUrql } from "src/modules/authentification/exchanges";

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

const client = new Client({
  url:
    process.env.HASURA_GRAPHQL_ENDPOINT ?? "http://localhost:8080/v1/graphql",
  exchanges: [authExchangeUrql, cacheExchange, fetchExchange],
  requestPolicy: "cache-first",
});

export { dsfrDocumentApi };

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <Provider value={client}>
      <MuiDsfrThemeProvider>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </MuiDsfrThemeProvider>
    </Provider>
  );
}

export default withDsfr(App);
