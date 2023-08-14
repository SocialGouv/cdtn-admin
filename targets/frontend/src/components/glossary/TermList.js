import Link from "next/link";
import PropTypes from "prop-types";
import React from "react";
import { Li, List } from "src/components/list";
import { Box, Text } from "@mui/material";

const TermList = ({ termsByLetters = [] }) => {
  return (
    <Box
      sx={{
        flexWrap: "wrap",
        gap: "xsmall",
        justifyContent: "stretch",
        display: "flex",
      }}
    >
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
                      {term}
                    </Link>
                  </Li>
                ))}
              </List>
            </Box>
          )
      )}
    </Box>
  );
};

TermList.PropTypes = {
  termsByLetters: PropTypes.object,
};

const MemoisedTermList = React.memo(TermList);

export { MemoisedTermList as TermList };
