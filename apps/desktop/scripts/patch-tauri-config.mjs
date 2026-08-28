#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const srcConf = path.resolve(root, "../src-tauri/tauri.conf.json");
const buildConf = path.resolve(root, "../src-tauri/tauri.conf.build.json");

const PROD_ENDPOINT =
  "https://updates.puzzlessdev.online/checkVersion?app_name=clared&version={{current_version}}&platform={{target}}&arch={{arch}}&channel=stable&updater=tauri&owner=admin";

const STAGING_ENDPOINT =
  "https://updates-staging.puzzlessdev.online/checkVersion?app_name=clared&version={{current_version}}&platform={{target}}&arch={{arch}}&channel=stable&updater=tauri&owner=admin";

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
config.plugins.updater.endpoints = [endpoint];

writeFileSync(buildConf, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Wrote ${path.basename(buildConf)}`);
