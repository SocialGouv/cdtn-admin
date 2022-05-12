import { Environment } from "@shared/types";
import { Badge } from "theme-ui";

type EnvironmentTagProps = {
  environment: Environment;
};

export function EnvironmentBadge({
  environment,
}: EnvironmentTagProps): JSX.Element {
  if (environment === Environment.production)
    return <Badge variant="accent">{environment}</Badge>;
  return <Badge variant="secondary">{environment}</Badge>;
}
