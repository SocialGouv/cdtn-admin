/** @jsx jsx */
import { jsx, Badge, Card } from "theme-ui";
import { ViewDiff } from "./ViewDiff";
import { Collapsible } from "../collapsible";
import PropTypes from "prop-types";

export function DiffChange({ change, repository }) {
  const { data, previous } = change;
  const textFieldname = /legi-data/.test(repository) ? "texte" : "content";
  const content = data[textFieldname] || "";
  const previousContent = previous?.data[textFieldname] || "";
  const showDiff = previous && content !== previousContent;
  const showNotaDiff = previous && previous.data.nota !== data.nota;
  return (
    <div>
      Article {data.num}{" "}
      {previous?.data.etat && previous?.data.etat !== data.etat && (
        <>
          <Badge sx={{ px: "xxsmall", bg: getBadgeColor(previous.data.etat) }}>
            {previous.data.etat}
          </Badge>{" "}
          ›{" "}
        </>
      )}
      <Badge sx={{ px: "xxsmall", bg: getBadgeColor(data.etat) }}>
        {data.etat}
      </Badge>
      {showDiff && (
        <Collapsible label="voir les modifications">
          <Card>
            <ViewDiff
              inputA={previousContent}
              inputB={content}
              type={"words"}
              style={{
                padding: 5,
                whiteSpace: "pre-line",
                border: "1px solid silver",
                background: "#fff",
                borderRadius: 3,
              }}
            />
          </Card>
        </Collapsible>
      )}
      {showNotaDiff && (
        <Collapsible label="voir le changement de nota">
          <Card>
            <ViewDiff
              inputA={previous.data.nota}
              inputB={data.nota}
              type={"words"}
              style={{
                padding: 5,
                whiteSpace: "pre-line",
                border: "1px solid silver",
                background: "#fff",
                borderRadius: 3,
              }}
            />
          </Card>
        </Collapsible>
      )}
    </div>
  );
}

DiffChange.propTypes = {
  repository: PropTypes.string.isRequired,
  change: PropTypes.object.isRequired,
};

function getBadgeColor(etat) {
  switch (etat) {
    case "VIGUEUR":
      return "positive";
    case "MOIFIE":
      return "caution";
    case "ABROGE":
    case "ABROGE_DIFF":
      return "critical";
    default:
      return "info";
  }
}
