import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));
const stubs = path.resolve(root, "src/__tests__/stubs");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@tauri-apps/plugin-store": path.resolve(stubs, "plugin-store.ts"),
      "@tauri-apps/plugin-clipboard-manager": path.resolve(
        stubs,
        "plugin-clipboard-manager.ts",
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
