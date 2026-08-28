#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.resolve(root, "..");
const args = process.argv.slice(2);

if (args[0] === "build" && !args.includes("--config")) {
  const patch = spawnSync("node", ["scripts/patch-tauri-config.mjs"], {
    cwd: desktopRoot,
    stdio: "inherit",
  });
  if (patch.status !== 0) process.exit(patch.status ?? 1);
  args.push("--config", "src-tauri/tauri.conf.build.json");
}

const result = spawnSync("tauri", args, {
  cwd: desktopRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
