import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const removedModulePath = join(
  here,
  "../components/create-disabled-button.tsx",
);
const routeSources = [
  join(here, "../routes/entities.tsx"),
  join(here, "../routes/kunden.tsx"),
];

describe("hygiene boundary (D-15, REL-05)", () => {
  it("CreateDisabledButton module stays deleted after zero-caller proof", () => {
    expect(existsSync(removedModulePath)).toBe(false);
  });

  it("entity and customer routes do not import create-disabled-button", () => {
    for (const path of routeSources) {
      const source = readFileSync(path, "utf8");
      expect(source).not.toMatch(/create-disabled-button/);
      expect(source).not.toMatch(/CreateDisabledButton/);
    }
  });
});
