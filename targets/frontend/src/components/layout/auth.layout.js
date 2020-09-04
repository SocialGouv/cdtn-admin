/** @jsx jsx */
import Head from "next/head";
import PropTypes from "prop-types";
import { IconContext } from "react-icons";
import ErrorPage from "src/pages/_error";
import { Box, Flex, Heading, jsx } from "theme-ui";

import { Header } from "./header";
import { Nav } from "./Nav";
import { Stack } from "./Stack";

export function Layout({ children, errorCode, title }) {
  if (errorCode) {
    return <ErrorPage statusCode={errorCode} />;
  }
  return (
    <IconContext.Provider value={{ style: { verticalAlign: "middle" } }}>
      <Head>
        <title>{title} | Admin cdtn </title>
      </Head>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Header />
        <Flex sx={{ flexBasis: "100%" }}>
          <Nav />
          <Box as="main" sx={{ flex: "1 1 auto" }} padding="large">
            <Stack>
              <Heading as="h1">{title}</Heading>
              {children}
            </Stack>
          </Box>
        </Flex>
      </Box>
    </IconContext.Provider>
  );
}
Layout.propTypes = {
  children: PropTypes.node,
  errorCode: PropTypes.number,
  title: PropTypes.string.isRequired,
};
