import Head from "next/head";
import PropTypes from "prop-types";
import { Box, Card, Typography } from "@mui/material";

import { Header } from "./header";
import { Stack } from "./Stack";

export function PasswordLayout({ children, title }) {
  return (
    <>
      <Head>
        <title>{title} | Admin cdtn </title>
      </Head>
      <Box>
        <Header />
        <Box
          as="main"
          paddingTop="xxlarge"
          px="xxsmall"
          sx={{ flex: 1, justifyContent: "center", display: "flex" }}
        >
          <Card sx={{ flexBasis: ["auto", "30em", "40em"] }}>
            <Typography variant="h1">{title}</Typography>
            <Stack>{children}</Stack>
          </Card>
        </Box>
      </Box>
    </>
  );
}
PasswordLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired,
};
