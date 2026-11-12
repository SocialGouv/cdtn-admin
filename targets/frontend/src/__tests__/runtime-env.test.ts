/**
 * @jest-environment node
 */
import { getClientEnvScript, getRuntimeEnv } from "../runtime-env";

describe("runtime-env", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("lit la valeur dans process.env côté serveur", () => {
    process.env.BUCKET_PUBLIC_ENDPOINT = "https://bucket.test";
    expect(getRuntimeEnv("BUCKET_PUBLIC_ENDPOINT")).toBe("https://bucket.test");
  });

  it("retourne undefined pour une valeur vide", () => {
    process.env.BUCKET_PUBLIC_ENDPOINT = "";
    expect(getRuntimeEnv("BUCKET_PUBLIC_ENDPOINT")).toBeUndefined();
  });

  it("n'expose au navigateur que les variables client", () => {
    process.env.BUCKET_PUBLIC_ENDPOINT = "https://bucket.test";
    process.env.BUCKET_SECRET_KEY = "secret";
    process.env.HASURA_GRAPHQL_ADMIN_SECRET = "secret";
    const script = getClientEnvScript();
    expect(script).toBe(
      'window.__ENV={"BUCKET_PUBLIC_ENDPOINT":"https://bucket.test"};'
    );
    expect(script).not.toContain("secret");
  });

  it("échappe les caractères pouvant fermer la balise script", () => {
    process.env.BUCKET_PUBLIC_ENDPOINT = "</script><script>alert(1)</script>";
    const script = getClientEnvScript();
    expect(script).not.toContain("</script>");
    expect(script).toContain("\\u003c/script>");
  });
});
