import Link from "next/link";
import PropTypes from "prop-types";
import React from "react";
import { Li, List } from "src/components/list";
import { Box, Flex, NavLink, Text } from "theme-ui";

const TermList = ({ termsByLetters = [] }) => {
  return (
    <Flex sx={{ flexWrap: "wrap", gap: "xsmall", justifyContent: "stretch" }}>
      {termsByLetters.map(
        ({ letter, terms }) =>
          terms.length > 0 && (
            <Box
              key={letter}
              sx={{
                border: "2px solid",
                borderColor: "neutral",
                borderRadius: "small",
                flex: "1 0 auto",
              }}
              p="xsmall"
            >
              <Text as="h2" id={`ancre-${letter}`} fontSize="xlarge" mt="0">
                {letter}
              </Text>
              <List>
                {terms.map(({ term, id }) => (
                  <Li key={id}>
                    <Link href={`/glossary/edit/${id}`} passHref>
                      {/* eslint-disable-next-line */}
                      <NavLink
                        sx={{
                          display: "inline-block",
                          p: "0.2rem 0",
                          ...linkStyles,
                        }}
                      >
                        {term}
                      </NavLink>
                    </Link>
                  </Li>
                ))}
              </List>
            </Box>
          )
      )}
    </Flex>
  );
};

TermList.PropTypes = {
  termsByLetters: PropTypes.object,
};

const MemoisedTermList = React.memo(TermList);

export { MemoisedTermList as TermList };

const linkStyles = {
  ":hover": {
    color: "primary",
  },
  ":visited": {
    color: "text",
  },
  color: "text",
};
