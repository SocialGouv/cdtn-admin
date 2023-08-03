import { Status } from "@shared/types";
import React, { ReactNode } from "react";
import { MdSyncProblem, MdTimelapse, MdTimerOff } from "react-icons/md";
import { Chip } from "@mui/material";

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
  return (
    <ConfirmButton disabled={isDisabled} onClick={onClick} variant={variant}>
      {status === "running" && <MdTimelapse sx={{ mr: ".2rem" }} />}
      {status === "failed" && <MdSyncProblem sx={{ mr: ".2rem" }} />}
      {status === "timeout" && <MdTimerOff sx={{ mr: ".2rem" }} />}
      {children}
      {status === "failed" && (
        <Chip color="error" sx={{ ml: "-3rem", mt: "-3rem" }} label="Erreur" />
      )}
      {status === "running" && (
        <Chip sx={{ ml: "-3rem", mt: "-3rem" }} label="En cours" />
      )}
      {status === "timeout" && (
        <Chip color="error" sx={{ ml: "-3rem", mt: "-3rem" }} label="Timeout" />
      )}
    </ConfirmButton>
  );
}

export const TriggerButton = React.memo(Index);
