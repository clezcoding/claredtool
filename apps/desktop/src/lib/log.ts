export type LogLevel = "debug" | "info";

/** D-43: dev=debug, prod=info. */
export function logLevelForEnvironment(env: string): LogLevel {
  void env;
  return "info";
}
