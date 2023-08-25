import { AlertChanges } from "@shared/types";
import React, { useState } from "react";
import { IoIosLink, IoMdChatbubbles } from "react-icons/io";
import { Box, Stack } from "@mui/material";

import { IconButton } from "../button";
import { Comments } from "../comments";
import { AlertStatus } from "./Status";

type Props = {
  alertId: string;
  info: AlertChanges;
  children: JSX.Element | string | undefined;
};
export const AlertTitle: React.FC<Props> = ({ alertId, info, children }) => {
  const [showComment, setShowComment] = useState(false);
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <AlertStatus alertId={alertId} />
      <h2 style={{ marginBottom: "0" }}>{children}</h2>
      {info.type === "dila" && info.num && (
        <a
          style={{ paddingLeft: "0.8rem", paddingRight: "0.8rem" }}
          target="_blank"
          rel="noopener noreferrer"
          href={`https://legifrance.gouv.fr/conv_coll/id/${info.id}`}
        >
          <IconButton>
            <IoIosLink
              aria-label="Voir la convention sur legifrance"
              style={{ height: "iconXSmall", width: "iconXSmall" }}
            />
          </IconButton>
        </a>
      )}
      <Box sx={{ flex: "1 1 0" }} />
      <IconButton
        sx={{ justifyItems: "flex-end" }}
        onClick={() => setShowComment(!showComment)}
      >
        <IoMdChatbubbles aria-label="Voir les commentaires" />
      </IconButton>
      {showComment && <Comments alertId={alertId} />}
    </Stack>
  );
};
