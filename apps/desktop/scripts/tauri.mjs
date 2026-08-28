#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.resolve(root, "..");
const args = process.argv.slice(2);

function loadDesktopEnv() {
  const envPath = path.join(desktopRoot, ".env");
  try {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // optional apps/desktop/.env
  }
}

loadDesktopEnv();

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
