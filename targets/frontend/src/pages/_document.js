import { Html, Head, Main, NextScript } from "next/document";
import { dsfrDocumentApi } from "./_app";

const { getColorSchemeHtmlAttributes, augmentDocumentForDsfr } =
  dsfrDocumentApi;

export default function Document(props) {
  return (
    <Html {...getColorSchemeHtmlAttributes(props)}>
      <Head>
        {/* Config d'exécution (`window.__ENV`), voir src/runtime-env.ts.
            Synchrone pour être évaluée avant les bundles Next. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/api/runtime-env" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

augmentDocumentForDsfr(Document);
