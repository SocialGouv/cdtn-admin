import { GITLAB_LIKE_ENVIRONMENT_SLUG } from "./GITLAB_LIKE_ENVIRONMENT_SLUG";

export const PG_ENVIRONMENT_SLUG = process.env.CI_COMMIT_TAG
  ? "preprod"
  : GITLAB_LIKE_ENVIRONMENT_SLUG.replace(/-/g, "");
