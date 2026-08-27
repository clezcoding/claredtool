#!/usr/bin/env node
/**
 * Compare two PNGs with pngjs + pixelmatch (threshold 0).
 * Exit 0 on equal pixels; non-zero on dimension or pixel mismatch.
 * Writes a diff PNG when pixels differ.
 *
 * Pairwise: pixel-diff.mjs <expected.png> <actual.png> [diff.png]
 * Manifest: pixel-diff.mjs --manifest <approvedDir> --captures <dir>
 *           --required '02-07' --themes available --threshold 0
 * Self-test: pixel-diff.mjs --self-test equal,dimension-different,pixel-different
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

function usage() {
  process.stderr.write(
    "usage: pixel-diff.mjs <expected.png> <actual.png> [diff.png]\n" +
      "       pixel-diff.mjs --manifest <approvedDir> --captures <dir> --required '02-07' --themes available [--threshold 0]\n" +
      "       pixel-diff.mjs --self-test equal,dimension-different,pixel-different\n",
  );
}

/**
 * @param {number} width
 * @param {number} height
 * @param {{ r: number, g: number, b: number }} fill
 * @param {{ x: number, y: number, r: number, g: number, b: number } | null} [pixel]
 */
function makePngBuffer(width, height, fill, pixel = null) {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (width * y + x) << 2;
      png.data[i] = fill.r;
      png.data[i + 1] = fill.g;
      png.data[i + 2] = fill.b;
      png.data[i + 3] = 255;
    }
  }
  if (pixel) {
    const i = (width * pixel.y + pixel.x) << 2;
    png.data[i] = pixel.r;
    png.data[i + 1] = pixel.g;
    png.data[i + 2] = pixel.b;
    png.data[i + 3] = 255;
  }
  return PNG.sync.write(png);
}

/**
 * @param {string} expectedPath
 * @param {string} actualPath
 * @param {string} [diffPath]
 * @param {number} [threshold]
 * @returns {{ code: number, expectedWidth?: number, expectedHeight?: number, actualWidth?: number, actualHeight?: number, diffCount?: number, error?: string }}
 */
function compareResult(expectedPath, actualPath, diffPath, threshold = 0) {
  if (!existsSync(expectedPath)) {
    return { code: 2, error: `missing expected: ${expectedPath}` };
  }
  if (!existsSync(actualPath)) {
    return { code: 2, error: `missing capture: ${actualPath}` };
  }
  const expected = PNG.sync.read(readFileSync(expectedPath));
  const actual = PNG.sync.read(readFileSync(actualPath));
  if (expected.width !== actual.width || expected.height !== actual.height) {
    process.stderr.write(
      `dimension mismatch: ${expected.width}x${expected.height} vs ${actual.width}x${actual.height}\n`,
    );
    return {
      code: 2,
      expectedWidth: expected.width,
      expectedHeight: expected.height,
      actualWidth: actual.width,
      actualHeight: actual.height,
      diffCount: null,
      error: "dimension mismatch",
    };
  }
  const diff = new PNG({ width: expected.width, height: expected.height });
  const n = pixelmatch(
    expected.data,
    actual.data,
    diff.data,
    expected.width,
    expected.height,
    { threshold },
  );
  if (n !== 0) {
    const out = diffPath ?? join(dirname(actualPath), "diff.png");
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, PNG.sync.write(diff));
    process.stderr.write(`${n} pixels differ; wrote ${out}\n`);
    return {
      code: 1,
      expectedWidth: expected.width,
      expectedHeight: expected.height,
      actualWidth: actual.width,
      actualHeight: actual.height,
      diffCount: n,
    };
  }
  return {
    code: 0,
    expectedWidth: expected.width,
    expectedHeight: expected.height,
    actualWidth: actual.width,
    actualHeight: actual.height,
    diffCount: 0,
  };
}

/**
 * @param {string} expectedPath
 * @param {string} actualPath
 * @param {string} [diffPath]
 * @returns {number} exit code
 */
function compare(expectedPath, actualPath, diffPath) {
  return compareResult(expectedPath, actualPath, diffPath, 0).code;
}

/**
 * @param {string} spec
 * @returns {string[]}
 */
export function parseRequiredPrefixes(spec) {
  const match = /^(\d{2})-(\d{2})$/.exec(spec.trim());
  if (!match) {
    throw new Error(`invalid --required '${spec}' (expected NN-NN)`);
  }
  const start = Number(match[1]);
  const end = Number(match[2]);
  if (end < start) {
    throw new Error(`invalid --required '${spec}' (end < start)`);
  }
  const out = [];
  for (let n = start; n <= end; n++) {
    out.push(String(n).padStart(2, "0"));
  }
  return out;
}

/**
 * @param {string} filename
 * @returns {"light" | "dark" | "single"}
 */
export function themeFromFilename(filename) {
  if (/-light\./i.test(filename)) return "light";
  if (/-dark\./i.test(filename)) return "dark";
  return "single";
}

/**
 * @param {string} manifestDir
 * @param {string[]} prefixes
 * @param {string} themes
 * @returns {string[]}
 */
export function listApprovedReferences(manifestDir, prefixes, themes) {
  if (!existsSync(manifestDir)) {
    throw new Error(`manifest dir missing: ${manifestDir}`);
  }
  const prefixSet = new Set(prefixes);
  const files = readdirSync(manifestDir)
    .filter((name) => name.toLowerCase().endsWith(".png"))
    .filter((name) => prefixSet.has(name.slice(0, 2)))
    .sort();
  if (themes !== "available") {
    throw new Error(`unsupported --themes '${themes}' (only 'available')`);
  }
  for (const prefix of prefixes) {
    if (!files.some((name) => name.startsWith(prefix))) {
      throw new Error(`required prefix ${prefix} missing from ${manifestDir}`);
    }
  }
  return files;
}

/**
 * @param {string[]} argv
 * @returns {Record<string, string | boolean>}
 */
function parseFlags(argv) {
  /** @type {Record<string, string | boolean>} */
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }
  return flags;
}

/**
 * @param {Record<string, string | boolean>} flags
 * @returns {number}
 */
function runManifest(flags) {
  const manifestDir = resolve(String(flags.manifest));
  const capturesDir = resolve(String(flags.captures));
  const required = parseRequiredPrefixes(String(flags.required ?? "02-07"));
  const themes = String(flags.themes ?? "available");
  const threshold = Number(flags.threshold ?? 0);
  const files = listApprovedReferences(manifestDir, required, themes);
  mkdirSync(capturesDir, { recursive: true });
  const rows = [];
  let worst = 0;
  for (const name of files) {
    const expectedPath = join(manifestDir, name);
    const actualPath = join(capturesDir, name);
    const diffPath = join(capturesDir, `diff-${name}`);
    const result = compareResult(expectedPath, actualPath, diffPath, threshold);
    if (result.code > worst) worst = result.code;
    const status =
      result.code === 0 ? "PASS" : result.error === "missing capture" || result.error?.startsWith("missing") ? "MISSING" : "FAIL";
    if (!existsSync(actualPath)) {
      process.stderr.write(`missing capture: ${actualPath}\n`);
      worst = Math.max(worst, 2);
    }
    rows.push({
      id: name.replace(/\.png$/i, ""),
      file: name,
      theme: themeFromFilename(name),
      expected: expectedPath,
      capture: actualPath,
      diff: existsSync(diffPath) ? diffPath : null,
      expectedSize:
        result.expectedWidth !== undefined
          ? `${result.expectedWidth}x${result.expectedHeight}`
          : null,
      actualSize:
        result.actualWidth !== undefined
          ? `${result.actualWidth}x${result.actualHeight}`
          : null,
      diffCount: result.diffCount ?? null,
      result: existsSync(actualPath) ? (result.code === 0 ? "PASS" : "FAIL") : "MISSING",
      code: existsSync(actualPath) ? result.code : 2,
      error: existsSync(actualPath) ? result.error ?? null : "missing capture",
    });
    void status;
  }
  const reportPath = join(capturesDir, "pixel-diff-report.json");
  writeFileSync(reportPath, `${JSON.stringify({ threshold, rows }, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ threshold, rows, report: reportPath })}\n`);
  return worst === 0 ? 0 : 1;
}

/**
 * @param {string} list
 * @returns {number}
 */
function selfTest(list) {
  const cases = list.split(",").map((s) => s.trim()).filter(Boolean);
  const dir = mkdtempSync(join(tmpdir(), "pixel-diff-"));
  const white = { r: 255, g: 255, b: 255 };
  let failed = 0;
  try {
    for (const name of cases) {
      let expectedCode;
      const a = join(dir, `${name}-a.png`);
      const b = join(dir, `${name}-b.png`);
      const diff = join(dir, `${name}-diff.png`);
      if (name === "equal") {
        const buf = makePngBuffer(8, 8, white);
        writeFileSync(a, buf);
        writeFileSync(b, buf);
        expectedCode = 0;
      } else if (name === "dimension-different") {
        writeFileSync(a, makePngBuffer(8, 8, white));
        writeFileSync(b, makePngBuffer(8, 16, white));
        expectedCode = 2;
      } else if (name === "pixel-different") {
        writeFileSync(a, makePngBuffer(8, 8, white));
        writeFileSync(
          b,
          makePngBuffer(8, 8, white, { x: 0, y: 0, r: 0, g: 0, b: 0 }),
        );
        expectedCode = 1;
      } else if (name === "manifest-missing-capture") {
        const approved = join(dir, "approved");
        const captures = join(dir, "captures");
        mkdirSync(approved);
        mkdirSync(captures);
        writeFileSync(join(approved, "02-rechnung-light.png"), makePngBuffer(8, 8, white));
        writeFileSync(join(approved, "03-rechnung-dark.png"), makePngBuffer(8, 8, white));
        writeFileSync(join(approved, "04-entities-light.png"), makePngBuffer(8, 8, white));
        writeFileSync(join(approved, "05-entities-dark.png"), makePngBuffer(8, 8, white));
        writeFileSync(join(approved, "06-tax-engine.png"), makePngBuffer(8, 8, white));
        writeFileSync(join(approved, "07-pdf-viewer.png"), makePngBuffer(8, 8, white));
        const code = runManifest({
          manifest: approved,
          captures,
          required: "02-07",
          themes: "available",
          threshold: "0",
        });
        if (code === 0) {
          process.stderr.write("self-test manifest-missing-capture: expected non-zero\n");
          failed += 1;
        }
        continue;
      } else {
        process.stderr.write(`unknown self-test case: ${name}\n`);
        failed += 1;
        continue;
      }
      const code = compare(a, b, diff);
      if (code !== expectedCode) {
        process.stderr.write(
          `self-test ${name}: expected exit ${expectedCode}, got ${code}\n`,
        );
        failed += 1;
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return failed === 0 ? 0 : 1;
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return pathToFileURL(resolve(entry)).href === import.meta.url;
}

if (isDirectRun()) {
  const args = process.argv.slice(2);
  if (args[0] === "--self-test") {
    const list = args[1] ?? "equal,dimension-different,pixel-different,manifest-missing-capture";
    process.exit(selfTest(list));
  }

  const flags = parseFlags(args);
  if (flags.manifest) {
    if (!flags.captures) {
      usage();
      process.exit(2);
    }
    process.exit(runManifest(flags));
  }

  if (args.length < 2) {
    usage();
    process.exit(2);
  }

  process.exit(compare(args[0], args[1], args[2]));
}
