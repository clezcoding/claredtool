#!/usr/bin/env node
/**
 * Gate 04.1-QA.md pixel rows. FAIL without a named residual decision exits non-zero.
 *
 * usage: verify-pixel-qa.mjs <04.1-QA.md> --require-all --block-fail-without-residual-decision
 *        [--manifest <approvedDir>] [--required '02-07'] [--themes available]
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  listApprovedReferences,
  parseRequiredPrefixes,
  themeFromFilename,
} from "./pixel-diff.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");

const DEFAULT_MANIFEST = join(
  repoRoot,
  ".planning/phases/04-premium-ui-brand-redesign/mockups/approved",
);

/**
 * @param {string[]} argv
 * @returns {{ positional: string[], flags: Record<string, string | boolean> }}
 */
function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }
  return { positional, flags };
}

/**
 * @param {string} markdown
 * @param {string} marker
 * @returns {object[]}
 */
function parseComments(markdown, marker) {
  const re = new RegExp(
    "<!--\\s*" + marker + ":\\s*(\\{[\\s\\S]*?\\})\\s*-->",
    "g",
  );
  const out = [];
  for (const match of markdown.matchAll(re)) {
    try {
      out.push(JSON.parse(match[1]));
    } catch (err) {
      throw new Error(`invalid ${marker} JSON: ${err instanceof Error ? err.message : err}`);
    }
  }
  return out;
}

const REQUIRED_FIELDS = [
  "id",
  "route",
  "theme",
  "path",
  "command",
  "dimensions",
  "diff_count",
  "result",
  "date",
  "sw_vers",
];

function main() {
const args = parseArgs(process.argv.slice(2));
const qaPath = args.positional[0];
if (!qaPath) {
  process.stderr.write(
    "usage: verify-pixel-qa.mjs <04.1-QA.md> --require-all --block-fail-without-residual-decision\n",
  );
  process.exit(2);
}

const markdown = readFileSync(qaPath, "utf8");
const rows = parseComments(markdown, "pixel-qa");
const residuals = parseComments(markdown, "residual-decision");
const manifestDir = resolve(String(args.flags.manifest ?? DEFAULT_MANIFEST));
const prefixes = parseRequiredPrefixes(String(args.flags.required ?? "02-07"));
const themes = String(args.flags.themes ?? "available");
const requiredFiles = listApprovedReferences(manifestDir, prefixes, themes);
const requiredIds = requiredFiles.map((name) => name.replace(/\.png$/i, ""));

let failed = 0;

if (args.flags["require-all"]) {
  for (const id of requiredIds) {
    const row = rows.find((item) => item.id === id);
    if (!row) {
      process.stderr.write(`missing pixel-qa row for ${id}\n`);
      failed += 1;
      continue;
    }
    for (const field of REQUIRED_FIELDS) {
      if (row[field] === undefined || row[field] === null || row[field] === "") {
        process.stderr.write(`${id} missing field ${field}\n`);
        failed += 1;
      }
    }
    const expectedTheme = themeFromFilename(`${id}.png`);
    if (row.theme !== expectedTheme) {
      process.stderr.write(`${id} theme ${row.theme} != ${expectedTheme}\n`);
      failed += 1;
    }
  }
}

function residualCovers(id) {
  const hit = residuals.find((item) => item.id === id);
  if (!hit) return false;
  const decision = String(hit.decision ?? "").trim();
  if (!decision) return false;
  if (/^(pending|draft|tbd|\[human required\]|human required|awaiting)$/i.test(decision)) {
    return false;
  }
  if (!hit.owner || !hit.scope || !hit.diff) return false;
  return true;
}

if (args.flags["block-fail-without-residual-decision"]) {
  for (const row of rows) {
    if (row.result === "PASS") continue;
    if (row.result === "FAIL" || row.result === "MISSING") {
      if (!residualCovers(row.id)) {
        process.stderr.write(
          `FAIL ${row.id} has no named residual decision (id/decision/diff/owner/scope)\n`,
        );
        failed += 1;
      }
    }
  }
}

if (failed > 0) {
  process.exit(1);
}
process.stdout.write(`verify-pixel-qa: ${rows.length} rows, ${residuals.length} residuals, ok\n`);
}

main();
