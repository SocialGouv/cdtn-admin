import { AlertChanges } from "@socialgouv/cdtn-types";
import React, { useState } from "react";
import { Link as LinkIcon, Forum } from "../utils/dsfrIcons";
import { Box, Stack, Chip, Tooltip } from "@mui/material";

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
    <>
      <Stack direction="row" alignItems="center" spacing={1}>
        <AlertStatus alertId={alertId} />
        <h3 style={{ marginBottom: 0, marginTop: 0, flex: 1 }}>{children}</h3>
        {info.type === "dila" && info.num && (
          <Tooltip title="Voir sur Légifrance">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://legifrance.gouv.fr/conv_coll/id/${info.id}`}
              style={{ display: "inline-flex" }}
            >
              <Chip
                icon={<LinkIcon fontSize="small" />}
                label="Légifrance"
                size="small"
                variant="outlined"
                clickable
              />
            </a>
          </Tooltip>
        )}
        <Tooltip title="Commentaires">
          <IconButton onClick={() => setShowComment(!showComment)}>
            <Forum aria-label="Voir les commentaires" fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      {showComment && <Comments alertId={alertId} />}
    </>
  );
};
