import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  UPDATER_ENDPOINT_DEV,
  UPDATER_ENDPOINT_PRODUCTION,
  UPDATER_ENDPOINT_STAGING,
} from "./updater-endpoint";

const here = dirname(fileURLToPath(import.meta.url));
const tauriConf = JSON.parse(
  readFileSync(join(here, "../../src-tauri/tauri.conf.json"), "utf8"),
) as {
  plugins?: { updater?: { endpoints?: string[] } };
};

describe("updater-endpoint SSOT", () => {
  it("exports staging and production URLs from shared JSON", () => {
    expect(UPDATER_ENDPOINT_STAGING).toContain("updates-staging");
    expect(UPDATER_ENDPOINT_PRODUCTION).toContain("updates.puzzlessdev.online");
    expect(UPDATER_ENDPOINT_DEV).toBe(UPDATER_ENDPOINT_STAGING);
  });

  it("matches tauri.conf.json dev default endpoint", () => {
    const configured = tauriConf.plugins?.updater?.endpoints?.[0];
    expect(configured).toBe(UPDATER_ENDPOINT_DEV);
  });
});
