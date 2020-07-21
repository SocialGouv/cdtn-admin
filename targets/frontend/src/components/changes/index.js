/** @jsx jsx */
import { jsx, Badge, Card, Text } from "theme-ui";
import { ViewDiff } from "./ViewDiff";
import { Collapsible } from "../collapsible";
import PropTypes from "prop-types";

export function DilaDiffChange({ change }) {
  const { data, previous } = change;
  const textFieldname =
    change.context.containerId === "LEGITEXT000006072050" ? "text" : "content";
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
const ficheVddTypeSlug = {
  associations: "associations",
  particuliers: "particuliers",
  professionnels: "professionnels-entreprise",
};
function getFicheVddUrl(change) {
  return `https://www.service-public.fr/${
    ficheVddTypeSlug[change.type]
  }/vosdroits/${change.id}`;
}
export function FicheVddDiffchange({ change }) {
  return (
    <li>
      <a
        target="_blank"
        rel="noreferrer noopener"
        href={getFicheVddUrl(change)}
      >
        {change.title}
      </a>
      <br />
      <Text sx={{ fontSize: "small" }}>{change.theme}</Text>
    </li>
  );
}

export function DiffChange({ change, type }) {
  switch (type) {
    case "dila":
      return <DilaDiffChange change={change} />;
    case "vdd":
      return <FicheVddDiffchange change={change} />;
  }
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
