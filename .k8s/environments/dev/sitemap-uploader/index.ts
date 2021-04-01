import { ok } from "assert";
ok(
  process.env.BASE_URL,
  `

===

# THIS JOB REQUIRE AN BASE_URL ON FEATURE BRANCHES

---

Example:
BASE_URL = https://xxx-code-travail.dev2.fabrique.social.gouv.fr/


===

`
);
export default {
  DESTINATION_NAME: `sitemap.xml`,
  SECRET_NAME: "azure-cdtnadmindev-volume",
  SITEMAP_ENDPOINT: "http://www",
};
