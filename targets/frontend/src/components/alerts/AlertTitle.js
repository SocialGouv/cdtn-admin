import PropTypes from "prop-types";
import { useState } from "react";
import { IoIosLink, IoMdChatbubbles } from "react-icons/io";
import { Box, Flex } from "theme-ui";

import { IconButton } from "../button";
import { Comments } from "../comments";
import { AlertStatus } from "./Status";

export function AlertTitle({ alertId, info, ...props }) {
  const [showComment, setShowComment] = useState(false);
  return (
    <Flex sx={{ alignItems: "center", justifyContent: "stretch" }}>
      <AlertStatus alertId={alertId} />
      <Box as="h2" sx={{ paddingLeft: "xsmall" }} {...props} />
      {info.num && (
        <a
          sx={{ px: "xsmall" }}
          target="_blank"
          rel="noopener noreferrer"
          href={`https://beta.legifrance.gouv.fr/conv_coll/id/${info.id}`}
        >
          <IconButton variant="secondary">
            <IoIosLink
              aria-label="Voir la convention sur legifrance"
              style={{ height: "iconXSmall", width: "iconXSmall" }}
            />
          </IconButton>
        </a>
      )}
      <div sx={{ flex: "1 1 0" }} />
      <IconButton
        sx={{ justifyItems: "flex-end" }}
        variant="secondary"
        onClick={() => setShowComment(!showComment)}
      >
        <IoMdChatbubbles
          aria-label="Voir les commentaires"
          style={{ height: "iconXSmall", width: "iconXSmall" }}
        />
      </IconButton>
      {showComment && <Comments alertId={alertId} />}
    </Flex>
  );
}

AlertTitle.propTypes = {
  alertId: PropTypes.string.isRequired,
  info: PropTypes.shape({
    id: PropTypes.string,
    num: PropTypes.number,
  }),
};
