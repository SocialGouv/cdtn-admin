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
import { authExchangeUrql } from "src/modules/authentification/utils/exchanges";
import { BASE_URL } from "src/config";

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
  const client = new Client({
    url: `${BASE_URL}/api/graphql`,
    exchanges: [authExchangeUrql, cacheExchange, fetchExchange],
    requestPolicy: "cache-and-network",
  });

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
