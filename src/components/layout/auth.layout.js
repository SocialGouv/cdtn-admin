/** @jsx jsx */
import { IconContext } from "react-icons";
import { Box, Flex, jsx } from "theme-ui";
import { Header } from "./header";
import { Nav } from "./Nav";

export function Layout({ children }) {
  return (
    <IconContext.Provider value={{ style: { verticalAlign: "middle" } }}>
      <Box>
        <Header />
        <Flex>
          <Nav />
          <Box as="main" sx={{ flex: "1 1 auto" }} padding="large">
            {children}
          </Box>
        </Flex>
      </Box>
    </IconContext.Provider>
  );
}
