import { describe, expect, it } from "vitest";
import { logLevelForEnvironment } from "./log";

describe("log helper (D-43)", () => {
  it("uses debug level in development", () => {
    expect(logLevelForEnvironment("development")).toBe("debug");
    expect(logLevelForEnvironment("dev")).toBe("debug");
  });

  it("uses info level in production", () => {
    expect(logLevelForEnvironment("production")).toBe("info");
    expect(logLevelForEnvironment("prod")).toBe("info");
    expect(logLevelForEnvironment("staging")).toBe("info");
  });
});
