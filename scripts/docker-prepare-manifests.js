// Prepares the pnpm workspace manifests that seed a Docker install layer.
// Run from the directory holding pnpm-lock.yaml and the copied package.json files.
//
// 1. Blanks every `version` field. The release bot rewrites those on every
//    `chore(release)` without touching pnpm-lock.yaml, which would otherwise
//    invalidate the install layer for a change that affects no dependency.
// 2. Asserts every workspace member declared in the lockfile is present. The
//    Dockerfiles copy the `pnpm-workspace.yaml` globs wholesale, so a new member
//    arrives on its own; this catches the remaining drift, a glob added to the
//    workspace but not to the COPY lines.
//
// Blanking is safe because pnpm records workspace links as `link:<path>` and
// `--frozen-lockfile` never re-resolves them, so the linked package's declared
// version is not consulted — measured to hold even for an exact `workspace:x.y.z` pin.

const fs = require("fs");
const path = require("path");

const listManifests = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listManifests(full);
    return entry.name === "package.json" ? [full] : [];
  });

// Stripping one leading and one trailing quote unconditionally would truncate an
// unquoted key that merely ends in one, and a truncated key can land on a
// directory that does exist — turning the check below back into a silent pass.
const unquote = (key) => {
  if (key.length >= 2 && key.startsWith("'") && key.endsWith("'"))
    return key.slice(1, -1).replace(/''/g, "'");
  if (key.length >= 2 && key.startsWith('"') && key.endsWith('"'))
    return JSON.parse(key);
  return key;
};

const lockfileImporters = (file) => {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const start = lines.indexOf("importers:");
  if (start === -1) throw new Error(`no \`importers:\` section in ${file}`);

  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break;
    body.push(line);
  }

  // Every line indented exactly two spaces is an importer key. pnpm writes a
  // dependency-less importer inline (`  shared/config: {}`) and a populated one
  // as a block, so both forms are read here.
  const keys = body.filter((line) => /^ {2}\S/.test(line));
  const importers = [];
  for (const line of keys) {
    const match = /^ {2}(\S.*?):(?:\s*$|\s+\{\s*\}\s*$)/.exec(line);
    if (match) importers.push(unquote(match[1]));
  }

  // Counting rather than widening the pattern: any key this parser cannot read
  // would silently narrow the check below into the no-op it exists to prevent,
  // so an unread key is an error whatever future spelling produced it.
  if (importers.length !== keys.length || !importers.includes(".")) {
    throw new Error(
      `could not parse the \`importers:\` section of ${file} ` +
        `(read ${importers.length} of ${keys.length} keys, root ${importers.includes(".") ? "among" : "not among"} them). ` +
        `The lockfile format changed — update this parser.`
    );
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
