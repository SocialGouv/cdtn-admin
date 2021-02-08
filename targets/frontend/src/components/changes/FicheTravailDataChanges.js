import PropTypes from "prop-types";
import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { Button, Card, Text } from "theme-ui";

import { ViewDiff } from "./ViewDiff";

export function FicheTravailDataChanges({ change }) {
  const [isVisible, setVisible] = useState(false);
  const hasChange = (change.previousIntro && change.intro) || change.sections;
  return (
    <li>
      <a target="_blank" rel="noreferrer noopener" href={change.url}>
        {change.title}
      </a>
      <br />
      {hasChange && (
        <Button
          aria-controls={change.pubId}
          aria-expanded={isVisible}
          size="small"
          variant="link"
          sx={{
            "&:hover": {
              color: "link",
            },
            cursor: "pointer",
            px: 0,
          }}
          onClick={() => setVisible(!isVisible)}
        >
          Voir les modifications{" "}
          {isVisible ? <IoIosArrowDown /> : <IoIosArrowForward />}
        </Button>
      )}
      {isVisible && (
        <Card id={change.pubId}>
          {change.previousIntro && (
            <>
              <Text
                sx={{ fontSize: "large", fontWeight: "xsmall", mb: "small" }}
              >
                Intro
              </Text>
              <ViewDiff
                inputA={change.previousIntro}
                inputB={change.intro}
                type={"words"}
                style={{
                  background: "#fff",
                  border: "1px solid silver",
                  borderRadius: 3,
                  padding: 5,
                  whiteSpace: "pre-line",
                }}
              />
            </>
          )}
          {change.sections.map(({ title, text, previousText }, index) => {
            return (
              <React.Fragment key={`${change.pubId}-section-${index}`}>
                <Text
                  sx={{ fontSize: "large", fontWeight: "xsmall", mb: "small" }}
                >
                  Section: {title}
                </Text>
                {
                  <ViewDiff
                    inputA={previousText}
                    inputB={text}
                    type={"sentences"}
                    style={{
                      background: "#fff",
                      border: "1px solid silver",
                      borderRadius: 3,
                      padding: 5,
                      whiteSpace: "pre-line",
                    }}
                  />
                }
              </React.Fragment>
            );
          })}
        </Card>
      )}
    </li>
  );
}

FicheTravailDataChanges.propTypes = {
  change: PropTypes.shape({
    intro: PropTypes.string,
    previousIntro: PropTypes.string,
    pubId: PropTypes.string.isRequired,
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        previsouText: PropTypes.text,
        text: PropTypes.text,
        title: PropTypes.string,
      })
    ),
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }),
};
