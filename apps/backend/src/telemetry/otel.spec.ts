import { initOtel } from "./otel";

describe("initOtel", () => {
  const origTraces = process.env.OTEL_TRACES_EXPORTER;
  const origLogs = process.env.OTEL_LOGS_EXPORTER;

  afterEach(() => {
    if (origTraces === undefined) {
      delete process.env.OTEL_TRACES_EXPORTER;
    } else {
      process.env.OTEL_TRACES_EXPORTER = origTraces;
    }
    if (origLogs === undefined) {
      delete process.env.OTEL_LOGS_EXPORTER;
    } else {
      process.env.OTEL_LOGS_EXPORTER = origLogs;
    }
  });

  it("does not throw when OTEL_TRACES_EXPORTER=none and OTEL_LOGS_EXPORTER=none", () => {
    process.env.OTEL_TRACES_EXPORTER = "none";
    process.env.OTEL_LOGS_EXPORTER = "none";
    expect(() => initOtel()).not.toThrow();
  });
});
