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
  if (key.length >= 2 && key.startsWith('"') && key.endsWith('"')) {
    try {
      return JSON.parse(key);
    } catch (cause) {
      // YAML escapes JSON does not share (\x41, \N, \_). Refusing is right, but
      // the raw parser error would not say which key.
      throw new Error(`cannot unescape importer key ${key}`, { cause });
    }
  }
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
// isFile(), not existsSync(): a directory named `package.json` would satisfy
// mere existence while the manifest it stands for is gone.
const importers = lockfileImporters("pnpm-lock.yaml");

const missing = importers.filter(
  (importer) =>
    !fs
      .statSync(path.join(importer, "package.json"), { throwIfNoEntry: false })
      ?.isFile()
);
if (missing.length > 0) {
  throw new Error(
    `workspace members declared in pnpm-lock.yaml but missing here: ${missing.join(", ")}. ` +
      `Either a \`pnpm-workspace.yaml\` glob is not covered by the COPY lines of the ` +
      `\`manifests\` stage, or a .dockerignore rule swallows the manifest.`
  );
}

const manifests = listManifests(".");
const importerOf = (manifest) => {
  const dir = path.dirname(manifest);
  return dir === "." ? "." : dir.replace(/^\.\//, "");
};

// Everything still here sits where a `pnpm-workspace.yaml` glob selects, so a
// manifest the lockfile does not declare is lockfile drift, not noise — and
// dropping it would hand pnpm a workspace it believes complete. Raising keeps
// the same verdict pnpm gives on the untouched tree: ERR_PNPM_OUTDATED_LOCKFILE.
const undeclared = manifests.filter(
  (manifest) => !importers.includes(importerOf(manifest))
);
if (undeclared.length > 0) {
  throw new Error(
    `manifests present but not declared in pnpm-lock.yaml: ${undeclared.join(", ")}. ` +
      `Run \`pnpm install --lockfile-only\` to record them, or move them out of the ` +
      `\`shared/\` and \`targets/\` workspace globs.`
  );
}

for (const manifest of manifests) {
  const parsed = JSON.parse(fs.readFileSync(manifest, "utf8"));
  if (!parsed.version) continue;
  parsed.version = "0.0.0";
  fs.writeFileSync(manifest, `${JSON.stringify(parsed, null, 2)}\n`);
}
