import Link from "next/link";
import React from "react";
import { Flex } from "theme-ui";

export const TermList = React.memo(function _TermList({ termsByLetters = [] }) {
  return (
    <Flex sx={{ flexWrap: "wrap", gap: "xsmall", justifyContent: "stretch" }}>
      {termsByLetters.map(
        ({ letter, terms }) =>
          terms.length > 0 && (
            <div
              key={letter}
              sx={{
                border: "2px solid",
                borderColor: "neutral",
                borderRadius: "small",
                flex: "1 0 auto",
                p: "xsmall",
              }}
            >
              <h2 id={`ancre-${letter}`} sx={{ fontSize: "xlarge", mt: 0 }}>
                {letter}
              </h2>
              <ul sx={{ listStyleType: "none", m: 0, p: 0 }}>
                {terms.map(({ term, id }) => (
                  <li key={id}>
                    <Link href={`/glossary/edit/${id}`} passHref>
                      {/* eslint-disable-next-line */}
                      <a
                        sx={{
                          display: "inline-block",
                          p: "0.2rem 0",
                          ...linkStyles,
                        }}
                      >
                        {term}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
      )}
    </Flex>
  );
});

const linkStyles = {
  ":hover": {
    color: "primary",
  },
  ":visited": {
    color: "text",
  },
  color: "text",
};
