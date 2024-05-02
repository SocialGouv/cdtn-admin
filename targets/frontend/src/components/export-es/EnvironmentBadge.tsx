import { Environment } from "@socialgouv/cdtn-types";
import { Chip } from "@mui/material";

type EnvironmentTagProps = {
  environment: Environment;
};

export function EnvironmentBadge({
  environment,
}: EnvironmentTagProps): JSX.Element {
  return (
    <Chip
      color={environment === Environment.production ? "primary" : "secondary"}
      label={environment}
    />
  );
}
