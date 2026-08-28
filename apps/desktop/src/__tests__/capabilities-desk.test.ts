import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const defaultCapabilitiesPath = join(
  here,
  "../../src-tauri/capabilities/default.json",
);

type CapabilityFile = {
  identifier: string;
  permissions: string[];
};

function readDefaultCapabilities(): CapabilityFile {
  return JSON.parse(
    readFileSync(defaultCapabilitiesPath, "utf8"),
  ) as CapabilityFile;
}

describe("capabilities default.json (D-04/D-49/D-51)", () => {
  it("reads default.json from src-tauri/capabilities", () => {
    const caps = readDefaultCapabilities();
    expect(caps.identifier).toBe("default");
    expect(Array.isArray(caps.permissions)).toBe(true);
  });

  // End-state: Plan 02+ grants clipboard write-only (D-04).
  it.todo(
    "must include clipboard-manager:allow-write-text once plugin is wired",
  );

  it("must not grant clipboard-manager:allow-read-text", () => {
    const caps = readDefaultCapabilities();
    expect(caps.permissions).not.toContain(
      "clipboard-manager:allow-read-text",
    );
  });

  // End-state: release builds must not expose mcp-bridge (D-49/D-51).
  it("release default capability set must not grant mcp-bridge:default", () => {
    const caps = readDefaultCapabilities();
    expect(caps.permissions).not.toContain("mcp-bridge:default");
  });
});
