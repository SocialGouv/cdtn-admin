/** @jsx jsx */
import PropTypes from "prop-types";
import { Box, Flex, jsx, Card, Heading } from "theme-ui";
import { Header } from "./header";
import Head from "next/head";
import { Stack } from "./Stack";

export function PasswordLayout({ children, title }) {
  return (
    <>
      <Head>
        <title>{title} | Admin cdtn </title>
      </Head>
      <Box>
        <Header />
        <Flex
          as="main"
          paddingTop="xxlarge"
          px="xxsmall"
          sx={{ flex: 1, justifyContent: "center" }}
        >
          <Card sx={{ flexBasis: ["auto", "30em", "40em"] }}>
            <Heading>{title}</Heading>
            <Stack>{children}</Stack>
          </Card>
        </Flex>
      </Box>
    </>
  );
}
PasswordLayout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};
