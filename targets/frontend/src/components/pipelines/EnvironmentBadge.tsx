import { Badge } from "theme-ui";

type EnvironementTagProps = {
  environment: string;
};

export function EnvironementBadge({
  environment,
}: EnvironementTagProps): JSX.Element {
  if (environment === "prod")
    return <Badge variant="accent">{environment}</Badge>;
  return <Badge variant="secondary">{environment}</Badge>;
}
