/** @jsx jsx */
import Head from "next/head";
import PropTypes from "prop-types";
import { IconContext } from "react-icons";
import { Box, Flex, Heading, jsx } from "theme-ui";

import { Header } from "./header";
import { Nav } from "./Nav";

export function Layout({ children, title }) {
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
            <Heading sx={{ pb: "medium" }} as="h1">
              {title}
            </Heading>
            {children}
          </Box>
        </Flex>
      </Box>
    </IconContext.Provider>
  );
}
Layout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired,
};
