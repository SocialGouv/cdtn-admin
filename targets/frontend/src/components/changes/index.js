/** @jsx jsx */
import PropTypes from "prop-types";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import {
  Badge,
  Box,
  Button as TButton,
  Card,
  Divider,
  Flex,
  jsx,
  Text,
} from "theme-ui";

import { Stack } from "../layout/Stack";
import { FicheTravailDiffchange } from "./FicheTravailDataChange";
import { ViewDiff } from "./ViewDiff";

export function DilaLink({ info, children }) {
  const { context, data, type } = info;
  let url = "";
  const baseUrl = "https://beta.legifrance.gouv.fr";
  if (context.containerId.startsWith("LEGI")) {
    if (type === "article") {
      // article d'un code
      const today = new Date();
      url = `${baseUrl}/codes/article_lc/${
        data.id
      }/${today.getUTCFullYear()}-${("0" + (today.getUTCMonth() + 1)).slice(
        -2
      )}-${today.getUTCDate()}`;
    } else if (type === "section") {
      // section d'un code
      url = `${baseUrl}/codes/section_lc/${context.containerId}/${data.id}`;
    }
  }
  if (context.containerId.startsWith("KALI")) {
    if (type === "article") {
      // article d'une CC ou teste annexe
      url = `${baseUrl}/conv_coll/article/${data.id}/?idConteneur=${context.containerId}`;
    } else if (type === "section") {
      // si section
      if (data.id && data.id.match(/^KALISCTA/)) {
        url = `${baseUrl}/conv_coll/id/${data.id}/?idConteneur=${context.containerId}`;
        // si texte attaché/annexe
      } else if (data.id && data.id.match(/^KALITEXT/)) {
        url = `${baseUrl}/conv_coll/id/${data.id}/?idConteneur=${context.containerId}`;
      }
    }
  }
  return (
    <a
      rel="nooppener noreferrer"
      target="_blank"
      href={url}
      title={context.parents && context.parents.join(" › ")}
    >
      {children}
    </a>
  );
}

DilaLink.propTypes = {
  children: PropTypes.node,
  info: PropTypes.shape({
    context: PropTypes.shape({
      containerId: PropTypes.string,
      parents: PropTypes.arrayOf(PropTypes.string),
      textId: PropTypes.string,
    }),
    data: PropTypes.shape({
      id: PropTypes.string,
    }),
    type: PropTypes.string,
  }),
};

let COLLAPSIBLE_ID = 1;

export function DilaDiffChange({ change }) {
  const { data, previous } = change;
  const textFieldname = /^KALITEXT\d+$/.test(change.context.containerId)
    ? "content"
    : "texte";
  const content = data[textFieldname] || "";
  const previousContent = previous?.data[textFieldname] || "";
  const showDiff = previous && content !== previousContent;
  const showNotaDiff = previous && previous.data.nota !== data.nota;
  const [isVisible, setVisible] = useState(false);
  const id = `collapsible-component-${COLLAPSIBLE_ID++}`;

  return (
    <li>
      <Flex sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          {change.type === "section" && (
            <>
              {change.context.parents.length > 2 &&
                change.context.parents.slice(-2, -1).join(" › ")}{" "}
              › <DilaLink info={change}>{change.data.title}</DilaLink>
            </>
          )}
          {change.type === "article" && (
            <DilaLink info={change}>Article {data.num}</DilaLink>
          )}
        </Box>

        <Box px="xxsmall">
          {previous?.data.etat && previous?.data.etat !== data.etat && (
            <>
              <Badge
                sx={{ bg: getBadgeColor(previous.data.etat), px: "xxsmall" }}
              >
                {previous.data.etat}
              </Badge>{" "}
              ›{" "}
            </>
          )}
          <Badge sx={{ bg: getBadgeColor(data.etat), px: "xxsmall" }}>
            {data.etat}
          </Badge>
        </Box>
      </Flex>
      {(showDiff || showNotaDiff) && (
        <TButton
          aria-controls={id}
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
      )}
      {isVisible && (
        <Card id={id}>
          <Stack>
            {showDiff && (
              <>
                <strong>Modification du texte</strong>
                <ViewDiff
                  inputA={previousContent}
                  inputB={content}
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
            {showDiff && showNotaDiff && <Divider />}
            {showNotaDiff && (
              <>
                <strong>Modification du Nota</strong>
                <ViewDiff
                  inputA={previous.data.nota}
                  inputB={data.nota}
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
          </Stack>
        </Card>
      )}
    </li>
  );
}

DilaDiffChange.propTypes = {
  change: PropTypes.shape({
    context: PropTypes.object,
    data: PropTypes.object,
    previous: PropTypes.object,
    type: PropTypes.string,
  }).isRequired,
};

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

FicheVddDiffchange.propTypes = {
  change: PropTypes.shape({
    theme: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
};

export function DiffChange({ change, type }) {
  switch (type) {
    case "dila":
      return <DilaDiffChange change={change} />;
    case "vdd":
      return <FicheVddDiffchange change={change} />;
    case "travail-data":
      return <FicheTravailDiffchange change={change} />;
  }
  return null;
}

DiffChange.propTypes = {
  change: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
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
