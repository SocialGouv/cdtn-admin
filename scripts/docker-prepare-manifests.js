// Prepares the pnpm workspace manifests that seed a Docker install layer.
// Run from the directory holding pnpm-lock.yaml and the copied package.json files.
//
// 1. Blanks every `version` field. The release bot rewrites those on every
//    `chore(release)` without touching pnpm-lock.yaml, which would otherwise
//    invalidate the install layer for a change that affects no dependency.
// 2. Asserts every workspace member declared in the lockfile is present.
//
// Blanking versions is safe only because every workspace link uses the
// range-less `workspace:^` protocol; an exact pin such as `workspace:2.77.0`
// would resolve against the blanked version and break the install.

const fs = require("fs");
const path = require("path");

const listManifests = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listManifests(full);
    return entry.name === "package.json" ? [full] : [];
  });

const lockfileImporters = (file) => {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const start = lines.indexOf("importers:");
  if (start === -1) throw new Error(`no \`importers:\` section in ${file}`);

  const importers = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break;
    const match = /^ {2}(\S.*?):\s*$/.exec(line);
    if (match) importers.push(match[1].replace(/^['"]|['"]$/g, ""));
  }
  return importers;
};

// `pnpm install --frozen-lockfile` skips an importer whose directory is absent
// and still exits 0, so a workspace member left out of the Dockerfile COPY list
// would only surface much later, or not at all.
const missing = lockfileImporters("pnpm-lock.yaml").filter(
  (importer) => !fs.existsSync(path.join(importer, "package.json"))
);
if (missing.length > 0) {
  throw new Error(
    `workspace members declared in pnpm-lock.yaml but missing here: ${missing.join(", ")}. ` +
      `Add their package.json to the COPY list of the \`manifests\` stage.`
  );
}

for (const manifest of listManifests(".")) {
  const parsed = JSON.parse(fs.readFileSync(manifest, "utf8"));
  if (!parsed.version) continue;
  parsed.version = "0.0.0";
  fs.writeFileSync(manifest, `${JSON.stringify(parsed, null, 2)}\n`);
}
