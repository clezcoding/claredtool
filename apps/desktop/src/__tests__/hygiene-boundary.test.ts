import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(here, "..");
const removedModulePath = join(srcRoot, "components/create-disabled-button.tsx");

function walkSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "__tests__") {
      continue;
    }
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out.push(...walkSourceFiles(path));
      continue;
    }
    if (/\.(ts|tsx)$/.test(name)) {
      out.push(path);
    }
  }
  return out;
}

const sourceFiles = walkSourceFiles(srcRoot);

describe("hygiene boundary (D-15, REL-05)", () => {
  it("CreateDisabledButton module stays deleted after zero-caller proof", () => {
    expect(existsSync(removedModulePath)).toBe(false);
  });

  it("desktop src files do not import create-disabled-button", () => {
    for (const path of sourceFiles) {
      const source = readFileSync(path, "utf8");
      expect(source).not.toMatch(/create-disabled-button/);
      expect(source).not.toMatch(/CreateDisabledButton/);
    }
  });
});
