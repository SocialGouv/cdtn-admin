import PropTypes from "prop-types";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { Button, Card } from "theme-ui";

import { ViewDiff } from "./ViewDiff";

const ficheVddTypeSlug = {
  associations: "associations",
  particuliers: "particuliers",
  professionnels: "professionnels-entreprises",
};
function getFicheVddUrl(change) {
  return `https://www.service-public.fr/${
    ficheVddTypeSlug[change.type]
  }/vosdroits/${change.id}`;
}
export function FicheVddChanges({ change }) {
  const [isVisible, setVisible] = useState(false);
  const hasChange = change.currentText && change.previousText;
  return (
    <li>
      <a
        target="_blank"
        rel="noreferrer noopener"
        href={getFicheVddUrl(change)}
      >
        {change.title}
        {change.type && <strong> - {change.type.toUpperCase()}</strong>}
      </a>
      <br />
      {hasChange && (
        <Button
          aria-controls={change.id}
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
        <Card id={change.id}>
          <ViewDiff
            inputA={change.previousText}
            inputB={change.currentText}
            type={"sentences"}
            style={{
              background: "#fff",
              border: "1px solid silver",
              borderRadius: 3,
              padding: 5,
              whiteSpace: "pre-line",
            }}
          />
        </Card>
      )}
    </li>
  );
}

FicheVddChanges.propTypes = {
  change: PropTypes.shape({
    currentText: PropTypes.string,
    id: PropTypes.string.isRequired,
    previousText: PropTypes.string,
    title: PropTypes.string.isRequired,
    type: PropTypes.string,
  }).isRequired,
};
