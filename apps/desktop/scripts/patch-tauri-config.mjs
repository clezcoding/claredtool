#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildUpdaterEndpoints } from "./updater-endpoint-list.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const srcConf = path.resolve(root, "../src-tauri/tauri.conf.json");
const buildConf = path.resolve(root, "../src-tauri/tauri.conf.build.json");
const endpointsPath = path.resolve(root, "../updater-endpoints.json");
const {
  production: PROD_ENDPOINT,
  staging: STAGING_ENDPOINT,
  faynosyncWindowsArch,
} = JSON.parse(readFileSync(endpointsPath, "utf8"));

const config = JSON.parse(readFileSync(srcConf, "utf8"));
const endpoint = process.env.TAURI_UPDATER_ENDPOINT?.trim() || PROD_ENDPOINT;

if (
  endpoint !== PROD_ENDPOINT &&
  endpoint !== STAGING_ENDPOINT &&
  !endpoint.includes("checkVersion")
) {
  console.error("TAURI_UPDATER_ENDPOINT must be a FaynoSync checkVersion URL");
  process.exit(1);
}

config.plugins ??= {};
config.plugins.updater ??= {};
config.plugins.updater.endpoints = buildUpdaterEndpoints(
  endpoint,
  faynosyncWindowsArch,
);

config.app ??= {};
config.app.security ??= {};
config.app.security.csp = {
  "default-src": "'self'",
  "connect-src":
    "'self' https://clared-api.puzzlessdev.online https://clared-auth.puzzlessdev.online https://*.sentry.io https://updates.puzzlessdev.online https://updates-staging.puzzlessdev.online https://updates-assets.puzzlessdev.online https://updates-assets-staging.puzzlessdev.online",
  "script-src": "'self'",
  "style-src": "'self' 'unsafe-inline'",
  "img-src": "'self' data: blob: https:",
  "font-src": "'self' data:",
  "frame-src":
    "'self' https://clared-api.puzzlessdev.online https://clared-auth.puzzlessdev.online",
};

writeFileSync(buildConf, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Wrote ${path.basename(buildConf)}`);
