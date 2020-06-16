import React from "react";
import App from "next/app";
import * as Sentry from "@sentry/node";
import { init } from "@socialgouv/matomo-next";
import { theme } from "src/theme";
import { ThemeProvider } from "theme-ui";
import "@reach/menu-button/styles.css";
import "@reach/dialog/styles.css";
import "@reach/accordion/styles.css";

Sentry.init({
  enabled: process.env.NODE_ENV === "production",
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

class MyApp extends App {
  componentDidMount() {
    init({
      url: process.env.NEXT_PUBLIC_MATOMO_URL,
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
    });
    // force onload swapping on stylesheet since it's not work on nextjs
    // @see _document.js
    const fontCss = document.getElementById("fonts");
    if (fontCss) {
      fontCss.media = "all";
    }
  }

  render() {
    const { Component, pageProps } = this.props;

    // Workaround for https://github.com/zeit/next.js/issues/8592
    const { err } = this.props;
    const modifiedPageProps = { ...pageProps, err };

    return (
      <ThemeProvider theme={theme}>
        <Component {...modifiedPageProps} />
      </ThemeProvider>
    );
  }
}

export default MyApp;
