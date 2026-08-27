#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const VALIDATE =
  "/Users/puzzless/.cursor/plugins/cache/google-labs-code-stitch-skills/stitch-build/0337446dadde6f8c94210444e2aa9d546126480f/skills/react-components/scripts/validate.js";

const raw = process.argv.slice(2).filter((arg) => arg !== "--");
const requested = raw[0];
if (!requested) {
  process.stderr.write("Usage: stitch:validate <path-to-component>\n");
  process.exit(1);
}

const candidates = [
  requested,
  resolve(process.cwd(), requested),
  resolve(process.cwd(), "../..", requested),
];
const filePath = candidates.find((candidate) => existsSync(candidate));
if (!filePath) {
  process.stderr.write(`File not found: ${requested}\n`);
  process.exit(1);
}

const result = spawnSync(process.execPath, [VALIDATE, filePath], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
