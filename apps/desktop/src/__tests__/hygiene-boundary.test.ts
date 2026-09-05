import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const removedModulePath = join(
  here,
  "../components/create-disabled-button.tsx",
);
const routeSources = readdirSync(join(here, "../routes"))
  .filter((name) => name.endsWith(".tsx"))
  .map((name) => join(here, "../routes", name));

describe("hygiene boundary (D-15, REL-05)", () => {
  it("CreateDisabledButton module stays deleted after zero-caller proof", () => {
    expect(existsSync(removedModulePath)).toBe(false);
  });

  it("route files do not import create-disabled-button", () => {
    for (const path of routeSources) {
      const source = readFileSync(path, "utf8");
      expect(source).not.toMatch(/create-disabled-button/);
      expect(source).not.toMatch(/CreateDisabledButton/);
    }
  });
});
