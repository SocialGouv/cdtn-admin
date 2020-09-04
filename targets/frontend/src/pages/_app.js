import "@reach/menu-button/styles.css";
import "@reach/dialog/styles.css";
import "@reach/accordion/styles.css";

import * as Sentry from "@sentry/node";
import { init } from "@socialgouv/matomo-next";
import App from "next/app";
import React from "react";
import { theme } from "src/theme";
import { ThemeProvider } from "theme-ui";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
});

class MyApp extends App {
  componentDidMount() {
    init({
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
      url: process.env.NEXT_PUBLIC_MATOMO_URL,
    });
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    );
  }
}

export default MyApp;
