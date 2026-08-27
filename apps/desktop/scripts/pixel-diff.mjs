#!/usr/bin/env node
/**
 * Compare two PNGs with pngjs + pixelmatch (threshold 0).
 * Exit 0 on equal pixels; non-zero on dimension or pixel mismatch.
 * Writes a diff PNG when pixels differ.
 */
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

function usage() {
  process.stderr.write(
    "usage: pixel-diff.mjs <expected.png> <actual.png> [diff.png]\n" +
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
 * @returns {number} exit code
 */
function compare(expectedPath, actualPath, diffPath) {
  const expected = PNG.sync.read(readFileSync(expectedPath));
  const actual = PNG.sync.read(readFileSync(actualPath));
  if (expected.width !== actual.width || expected.height !== actual.height) {
    process.stderr.write(
      `dimension mismatch: ${expected.width}x${expected.height} vs ${actual.width}x${actual.height}\n`,
    );
    return 2;
  }
  const diff = new PNG({ width: expected.width, height: expected.height });
  const n = pixelmatch(
    expected.data,
    actual.data,
    diff.data,
    expected.width,
    expected.height,
    { threshold: 0 },
  );
  if (n !== 0) {
    const out = diffPath ?? join(dirname(actualPath), "diff.png");
    writeFileSync(out, PNG.sync.write(diff));
    process.stderr.write(`${n} pixels differ; wrote ${out}\n`);
    return 1;
  }
  return 0;
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

const args = process.argv.slice(2);
if (args[0] === "--self-test") {
  const list = args[1] ?? "equal,dimension-different,pixel-different";
  process.exit(selfTest(list));
}

if (args.length < 2) {
  usage();
  process.exit(2);
}

process.exit(compare(args[0], args[1], args[2]));
