import { debug, error, info } from "@tauri-apps/plugin-log";

export type LogLevel = "debug" | "info";

/** D-43: dev=debug, prod=info. */
export function logLevelForEnvironment(env: string): LogLevel {
  if (env === "development" || env === "dev") return "debug";
  return "info";
}

function shouldLogDebug(): boolean {
  return import.meta.env.DEV || logLevelForEnvironment(import.meta.env.MODE) === "debug";
}

/** D-42/D-54: thin wrapper over official plugin-log; German ops messages at call sites. */
export const desktopLog = {
  debug(message: string): void {
    if (!shouldLogDebug()) return;
    void debug(message);
  },
  info(message: string): void {
    void info(message);
  },
  error(message: string): void {
    void error(message);
  },
};
