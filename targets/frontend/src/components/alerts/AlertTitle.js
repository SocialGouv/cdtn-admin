/** @jsx jsx */

import PropTypes from "prop-types";
import { useState } from "react";
import { IoMdChatbubbles } from "react-icons/io";
import { Box, Flex, jsx } from "theme-ui";

import { IconButton } from "../button";
import { Comments } from "../comments";
import { AlertStatus } from "./Status";

export function AlertTitle({ alertId, ...props }) {
  const [showComment, setShowComment] = useState(false);
  return (
    <Flex sx={{ alignItems: "center" }}>
      <AlertStatus alertId={alertId} />
      <Box
        as="h2"
        sx={{ flex: "1 1 auto", paddingLeft: "xsmall" }}
        {...props}
      />
      <IconButton
        variant="secondary"
        onClick={() => setShowComment(!showComment)}
      >
        <IoMdChatbubbles
          aria-label="Voir les commentaires"
          style={{ height: "1em", width: "1em" }}
        />
      </IconButton>
      {showComment && <Comments alertId={alertId} />}
    </Flex>
  );
}

AlertTitle.propTypes = {
  alertId: PropTypes.string.isRequired,
};
