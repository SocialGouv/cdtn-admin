import * as Sentry from "@sentry/browser";
import Document, { Head, Html, Main, NextScript } from "next/document";
import React from "react";

process.on("unhandledRejection", (err) => {
  Sentry.captureException(err);
});

process.on("uncaughtException", (err) => {
  Sentry.captureException(err);
});

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="preload" href="/fonts.css" as="style" />
          <link rel="stylesheet" id="fonts" href="/fonts.css" media="print" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
