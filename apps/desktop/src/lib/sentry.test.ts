import { describe, expect, it } from "vitest";
import { scrubSentryEvent } from "./sentry";

describe("sentry scrub (D-40)", () => {
  it("strips Authorization headers", () => {
    const scrubbed = scrubSentryEvent({
      request: { headers: { Authorization: "Bearer secret-token" } },
    });
    expect(scrubbed.request?.headers?.Authorization).toBeUndefined();
  });

  it("redacts token-like strings in extras", () => {
    const scrubbed = scrubSentryEvent({
      extra: { access_token: "abc123", note: "ok" },
    });
    expect(scrubbed.extra?.access_token).not.toBe("abc123");
    expect(scrubbed.extra?.note).toBe("ok");
  });

  it("redacts email addresses", () => {
    const scrubbed = scrubSentryEvent({
      extra: { contact: "user@example.com" },
    });
    expect(String(scrubbed.extra?.contact)).not.toContain("@");
  });

  it("redacts invoice customer names in breadcrumbs", () => {
    const scrubbed = scrubSentryEvent({
      breadcrumbs: [
        {
          message: "invoice viewed",
          data: { customerName: "Acme GmbH" },
        },
      ],
    });
    expect(scrubbed.breadcrumbs?.[0]?.data?.customerName).not.toBe("Acme GmbH");
  });

  it("redacts email addresses in breadcrumb messages", () => {
    const scrubbed = scrubSentryEvent({
      breadcrumbs: [{ message: "contact user@example.com for invoice" }],
    });
    expect(String(scrubbed.breadcrumbs?.[0]?.message)).not.toContain("@");
  });

  it("redacts string values inside arrays", () => {
    const scrubbed = scrubSentryEvent({
      extra: { contacts: ["user@example.com", "ok"] },
    });
    expect(String(scrubbed.extra?.contacts)).not.toContain("@");
    expect((scrubbed.extra?.contacts as string[])[1]).toBe("ok");
  });

  it("redacts customer names in breadcrumb messages", () => {
    const scrubbed = scrubSentryEvent({
      breadcrumbs: [{ message: "Kunde: Acme GmbH viewed invoice" }],
    });
    expect(String(scrubbed.breadcrumbs?.[0]?.message)).not.toContain("Acme");
    expect(String(scrubbed.breadcrumbs?.[0]?.message)).toContain("[redacted]");
  });
});
