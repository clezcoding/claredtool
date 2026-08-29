import { initOtel, isAllowedSpanAttribute } from "./otel";

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

  it("is idempotent — second call is a no-op", () => {
    process.env.OTEL_TRACES_EXPORTER = "none";
    process.env.OTEL_LOGS_EXPORTER = "none";
    expect(() => {
      initOtel();
      initOtel();
    }).not.toThrow();
  });
});

describe("isAllowedSpanAttribute", () => {
  it("allows operational keys and denies customer names, IBAN, tokens (D-23)", () => {
    expect(isAllowedSpanAttribute("http.method")).toBe(true);
    expect(isAllowedSpanAttribute("http.status_code")).toBe(true);
    expect(isAllowedSpanAttribute("customerName")).toBe(false);
    expect(isAllowedSpanAttribute("customer_name")).toBe(false);
    expect(isAllowedSpanAttribute("iban")).toBe(false);
    expect(isAllowedSpanAttribute("authorization")).toBe(false);
    expect(isAllowedSpanAttribute("access_token")).toBe(false);
  });
});
