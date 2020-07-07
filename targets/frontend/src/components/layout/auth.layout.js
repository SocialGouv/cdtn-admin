/** @jsx jsx */
import PropTypes from "prop-types";
import { IconContext } from "react-icons";
import { Box, Flex, jsx, Card, Heading } from "theme-ui";
import { Header } from "./header";
import { Nav } from "./Nav";
import Head from "next/head";

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
            <Heading>{title}</Heading>
            <Card>{children}</Card>
          </Box>
        </Flex>
      </Box>
    </IconContext.Provider>
  );
}
Layout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};
