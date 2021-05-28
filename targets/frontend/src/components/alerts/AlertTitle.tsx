/** @jsxImportSource theme-ui */

import type { AlertChanges } from "alert-cli";
import React, { useState } from "react";
import { IoIosLink, IoMdChatbubbles } from "react-icons/io";
import { Box, Flex } from "theme-ui";

import { IconButton } from "../button";
import { Comments } from "../comments";
import { AlertStatus } from "./Status";

type Props = {
  alertId: string;
  info: AlertChanges;
};
export const AlertTitle: React.FC<Props> = ({ alertId, info, ...props }) => {
  const [showComment, setShowComment] = useState(false);
  return (
    <Flex sx={{ alignItems: "center", justifyContent: "stretch" }}>
      <AlertStatus alertId={alertId} />
      <Box as="h2" sx={{ paddingLeft: "xsmall" }} {...props} />
      {info.type === "dila" && info.num && (
        <a
          sx={{ px: "xsmall" }}
          target="_blank"
          rel="noopener noreferrer"
          href={`https://legifrance.gouv.fr/conv_coll/id/${info.id}`}
        >
          <IconButton variant="secondary">
            <IoIosLink
              aria-label="Voir la convention sur legifrance"
              style={{ height: "iconXSmall", width: "iconXSmall" }}
            />
          </IconButton>
        </a>
      )}
      <Box sx={{ flex: "1 1 0" }} />
      <button />
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
};
