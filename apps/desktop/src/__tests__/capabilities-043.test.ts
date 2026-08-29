import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const defaultCapabilitiesPath = join(
  here,
  "../../src-tauri/capabilities/default.json",
);

type FsAllowEntry = { path?: string };
type CapabilityPermission =
  | string
  | { identifier?: string; allow?: FsAllowEntry[] };

type CapabilityFile = {
  identifier: string;
  permissions: CapabilityPermission[];
};

function fsAllowPathsFromText(text: string): string[] {
  const caps = JSON.parse(text) as CapabilityFile;
  const paths: string[] = [];
  for (const perm of caps.permissions) {
    if (typeof perm === "object" && Array.isArray(perm.allow)) {
      for (const entry of perm.allow) {
        if (typeof entry.path === "string") {
          paths.push(entry.path);
        }
      }
    }
  }
  return paths;
}

describe("capabilities default.json fs allow (D-34)", () => {
  it("reads default.json as text from src-tauri/capabilities", () => {
    const text = readFileSync(defaultCapabilitiesPath, "utf8");
    expect(text.length).toBeGreaterThan(0);
    const caps = JSON.parse(text) as CapabilityFile;
    expect(caps.identifier).toBe("default");
  });

  it("fs allow paths omit the home-directory token $HOME (D-34)", () => {
    const text = readFileSync(defaultCapabilitiesPath, "utf8");
    const paths = fsAllowPathsFromText(text);
    for (const p of paths) {
      expect(p).not.toMatch(/\$HOME\b/);
    }
  });
});
