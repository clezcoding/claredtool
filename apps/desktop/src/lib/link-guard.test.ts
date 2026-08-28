import { describe, expect, it } from "vitest";
import { decideLinkAction } from "./link-guard";

describe("link-guard (D-34)", () => {
  it("routes https links through opener", () => {
    expect(decideLinkAction("https://example.com/docs")).toBe("opener");
  });

  it("allows http only for localhost", () => {
    expect(decideLinkAction("http://localhost:5174/")).toBe("in-app");
    expect(decideLinkAction("http://127.0.0.1:5174/")).toBe("in-app");
  });

  it("allows http for dev hostnames", () => {
    expect(decideLinkAction("http://clared.local/")).toBe("in-app");
  });

  it("blocks http for non-dev remote hosts", () => {
    expect(decideLinkAction("http://example.com/")).toBe("block");
  });

  it("keeps clared:// in-app", () => {
    expect(decideLinkAction("clared://auth/callback?ticket=abc")).toBe(
      "in-app",
    );
  });

  it("blocks file: and unknown schemes", () => {
    expect(decideLinkAction("file:///etc/passwd")).toBe("block");
    expect(decideLinkAction("javascript:alert(1)")).toBe("block");
  });
});
