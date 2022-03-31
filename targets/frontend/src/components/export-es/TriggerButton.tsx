import React, { ReactNode } from "react";
import { MdLoop, MdSyncProblem, MdTimelapse } from "react-icons/md";
import { Badge } from "theme-ui";

import { ConfirmButton } from "../confirmButton";

type GitlabBButtonProps = {
  environment: "preprod" | "prod";
  variant: "accent" | "secondary" | "primary" | "link";
  onClick: () => void;
  children: ReactNode | ReactNode[];
  isDisabled?: boolean;
  status: "pending" | "ready" | "error";
};

function Index({
  variant,
  onClick,
  children,
  isDisabled = false,
  status,
}: GitlabBButtonProps) {
  return (
    <ConfirmButton disabled={isDisabled} onClick={onClick} variant={variant}>
      {status === "pending" && <MdTimelapse sx={{ mr: ".2rem" }} />}
      {status === "ready" && <MdLoop sx={{ mr: ".2rem" }} />}
      {status === "error" && <MdSyncProblem sx={{ mr: ".2rem" }} />}
      {children}
      {status === "error" && (
        <Badge bg="critical" sx={{ ml: "-3rem", mt: "-3rem" }}>
          Erreur
        </Badge>
      )}
    </ConfirmButton>
  );
}

export const TriggerButton = React.memo(Index);
