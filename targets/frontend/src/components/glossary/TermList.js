import Link from "next/link";
import PropTypes from "prop-types";
import React from "react";
import { Li, List } from "src/components/list";
import { Box } from "@mui/material";
import { theme } from "../../theme";

const TermList = ({ termsByLetters = [] }) => {
  return (
    <Box
      sx={{
        flexWrap: "wrap",
        gap: theme.space.xsmall,
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
                borderRadius: theme.space.small,
                flex: "1 0 auto",
              }}
              p={theme.space.small}
            >
              <h2
                id={`ancre-${letter}`}
                style={{
                  fontSize: theme.fontSizes.xlarge,
                  marginTop: 0,
                }}
              >
                {letter}
              </h2>
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
