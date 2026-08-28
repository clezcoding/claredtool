import endpoints from "../../updater-endpoints.json";

export const UPDATER_ENDPOINT_PRODUCTION = endpoints.production;
export const UPDATER_ENDPOINT_STAGING = endpoints.staging;
/** Dev/debug display — keep in sync with tauri.conf.json default. */
export const UPDATER_ENDPOINT_DEV = endpoints.staging;
