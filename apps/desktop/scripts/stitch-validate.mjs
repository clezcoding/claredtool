#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

function discoverStitchValidate() {
  const roots = [
    join(homedir(), ".cursor/plugins/cache/google-labs-code-stitch-skills"),
    join(
      homedir(),
      ".cursor/plugins/marketplaces/github.com/google-labs-code/stitch-skills",
    ),
  ];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const candidates = [
        join(root, entry.name, "skills/react-components/scripts/validate.js"),
        join(
          root,
          entry.name,
          "plugins/stitch-build/skills/react-components/scripts/validate.js",
        ),
        join(
          root,
          entry.name,
          "stitch-build",
          entry.name,
          "skills/react-components/scripts/validate.js",
        ),
      ];
      const found = candidates.find((path) => existsSync(path));
      if (found) return found;
    }
  }
  return null;
}

const candidates = [process.env.STITCH_VALIDATE, discoverStitchValidate()].filter(
  Boolean,
);

const VALIDATE = candidates.find((path) => existsSync(path));
if (!VALIDATE) {
  process.stderr.write(
    "Set STITCH_VALIDATE to validate.js or install the Stitch react-components skill.\n",
  );
  process.exit(1);
}

const raw = process.argv.slice(2).filter((arg) => arg !== "--");
const requested = raw[0];
if (!requested) {
  process.stderr.write("Usage: stitch:validate <path-to-component>\n");
  process.exit(1);
}

const fileCandidates = [
  requested,
  resolve(process.cwd(), requested),
  resolve(process.cwd(), "../..", requested),
];
const filePath = fileCandidates.find((candidate) => existsSync(candidate));
if (!filePath) {
  process.stderr.write(`File not found: ${requested}\n`);
  process.exit(1);
}

const result = spawnSync(process.execPath, [VALIDATE, filePath], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
