import { Badge } from "theme-ui";

type EnvironmentTagProps = {
  environment: string;
};

export function EnvironmentBadge({
  environment,
}: EnvironmentTagProps): JSX.Element {
  if (environment === "prod")
    return <Badge variant="accent">{environment}</Badge>;
  return <Badge variant="secondary">{environment}</Badge>;
}
