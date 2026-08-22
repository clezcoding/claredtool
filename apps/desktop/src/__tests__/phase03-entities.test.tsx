import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { fetchMock, resetAuthMocks } from "./auth-test-doubles";

const signedInViewer = {
  sub: "auth0|viewer",
  email: "viewer@clared.test",
  name: "Vera Viewer",
  groups: ["clared-viewer"],
  permissions: ["entity.read", "invoice.read", "tax.evaluate"],
  primaryRole: "viewer",
};

describe.skip("phase03-product", () => {
  afterEach(() => {
    cleanup();
    resetAuthMocks();
  });

  it("shows Anlegen visible but disabled with owner-only hint without entity.create", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input).includes("/me")) {
        return new Response(JSON.stringify(signedInViewer), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("not found", { status: 404 });
    });

    window.location.hash = "#/entities";
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Anlegen" })).toBeTruthy();
    });

    const anlegen = screen.getByRole("button", { name: "Anlegen" });
    expect(anlegen.hasAttribute("disabled")).toBe(true);
    expect(
      screen.getByText("Nur Inhaber können Entities anlegen."),
    ).toBeTruthy();
  });
});
