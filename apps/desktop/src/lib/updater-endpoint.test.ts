import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildUpdaterEndpoints,
  FAYNOSYNC_WINDOWS_ARCH,
  UPDATER_ENDPOINT_DEV,
  UPDATER_ENDPOINT_PRODUCTION,
  UPDATER_ENDPOINT_STAGING,
  UPDATER_ENDPOINTS_DEV,
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

  it("adds FaynoSync Windows arch fallback after Tauri {{arch}} endpoint", () => {
    const endpoints = buildUpdaterEndpoints(UPDATER_ENDPOINT_STAGING);
    expect(endpoints).toHaveLength(2);
    expect(endpoints[0]).toContain("arch={{arch}}");
    expect(endpoints[1]).toContain(`arch=${FAYNOSYNC_WINDOWS_ARCH}`);
    expect(endpoints[1]).not.toContain("{{arch}}");
  });

  it("matches tauri.conf.json dev updater endpoints", () => {
    expect(tauriConf.plugins?.updater?.endpoints).toEqual(UPDATER_ENDPOINTS_DEV);
  });
});
