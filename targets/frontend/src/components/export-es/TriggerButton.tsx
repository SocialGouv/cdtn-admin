import React, { ReactNode } from "react";
import { MdSyncProblem, MdTimelapse, MdTimerOff } from "react-icons/md";
import { Status } from "src/store/export-es";
import { Badge } from "theme-ui";

import { ConfirmButton } from "../confirmButton";

type TriggerButtonProps = {
  variant: "accent" | "secondary" | "primary" | "link";
  onClick: () => void;
  children: ReactNode | ReactNode[];
  isDisabled?: boolean;
  status?: Status;
};

function Index({
  variant,
  onClick,
  children,
  isDisabled = false,
  status,
}: TriggerButtonProps) {
  console.log(status);
  return (
    <ConfirmButton disabled={isDisabled} onClick={onClick} variant={variant}>
      {status === "running" && <MdTimelapse sx={{ mr: ".2rem" }} />}
      {status === "failed" && <MdSyncProblem sx={{ mr: ".2rem" }} />}
      {status === "timeout" && <MdTimerOff sx={{ mr: ".2rem" }} />}
      {children}
      {status === "failed" && (
        <Badge bg="critical" sx={{ ml: "-3rem", mt: "-3rem" }}>
          Erreur
        </Badge>
      )}
    </ConfirmButton>
  );
}

export const TriggerButton = React.memo(Index);
