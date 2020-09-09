/** @jsx jsx */
import PropTypes from "prop-types";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { Button as TButton, Card, jsx, Text } from "theme-ui";

import { ViewDiff } from "./ViewDiff";

export function FicheTravailDiffchange({ change }) {
  const [isVisible, setVisible] = useState(false);
  console.log(change);
  return (
    <li>
      <a target="_blank" rel="noreferrer noopener" href={change.url}>
        {change.title}
      </a>
      <br />
      <TButton
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
      </TButton>
      {isVisible && (
        <Card id={change.pubId}>
          {change.previousIntro && (
            <>
              <Text>Intro</Text>
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
              <>
                <Text>Section {title}</Text>
                <ViewDiff
                  key={`${change.pubId}-section-${index}`}
                  inputA={previousText}
                  inputB={text}
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
            );
          })}
        </Card>
      )}
    </li>
  );
}

FicheTravailDiffchange.propTypes = {
  change: PropTypes.shape({
    intro: PropTypes.string.isRequired,
    previousIntro: PropTypes.string.isRequired,
    pubId: PropTypes.string.isRequired,
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        previsouText: PropTypes.text,
        text: PropTypes.text,
        title: PropTypes.string,
      })
    ),
    title: PropTypes.string.isRequired,
  }),
};
