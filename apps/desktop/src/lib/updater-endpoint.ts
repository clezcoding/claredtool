import endpoints from "../../updater-endpoints.json";

export const FAYNOSYNC_WINDOWS_ARCH = endpoints.faynosyncWindowsArch;

export const UPDATER_ENDPOINT_PRODUCTION = endpoints.production;
export const UPDATER_ENDPOINT_STAGING = endpoints.staging;
/** Dev/debug display — keep in sync with tauri.conf.json default. */
export const UPDATER_ENDPOINT_DEV = endpoints.staging;

/** Tauri sends `x86_64` on Windows; FaynoSync only accepts alphanumeric arch names (e.g. `x64`). */
export function buildUpdaterEndpoints(primary: string): string[] {
  const fallback = primary.replace(
    "arch={{arch}}",
    `arch=${FAYNOSYNC_WINDOWS_ARCH}`,
  );
  return fallback === primary ? [primary] : [primary, fallback];
}

export const UPDATER_ENDPOINTS_DEV = buildUpdaterEndpoints(UPDATER_ENDPOINT_DEV);
