const env = require("@kosko/env");
const yaml = require("js-yaml");
const { generate } = require("@kosko/generate");
const { join } = require("path");

const generateManifests = async ({ envName, envVars = {} }) => {
  // Set environment
  process.env = {
    ...process.env,
    ...envVars,
  };
  env.env = envName;
  env.cwd = join(__dirname, "..");
  const manifests = await generate({
    path: join(env.cwd, "../components"),
    components: ["*"],
  });
  return manifests;
};

const getEnvManifests = async ({ envName, envVars = {} }) => {
  const manifests = await generateManifests({ envName, envVars });
  if (!manifests.manifests) {
    return null;
  }
  return yaml.safeDump(
    manifests.manifests.map((m) => m.data),
    { noRefs: true }
  );
};

module.exports = { getEnvManifests };
