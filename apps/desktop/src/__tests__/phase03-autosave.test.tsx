import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { fetchMock, resetAuthMocks } from "./auth-test-doubles";
import { signedInOwner } from "./auth-signed-in";

describe.skip("phase03-product", () => {
  afterEach(() => {
    cleanup();
    resetAuthMocks();
  });

  it("shows Speichert then Gespeichert after the 600ms typing pause", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/me")) {
        return new Response(JSON.stringify(signedInOwner), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/invoices") && init?.method === "POST") {
        return new Response(
          JSON.stringify({ id: "inv-1", items: [] }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.includes("/api/invoices/") && init?.method === "PATCH") {
        return new Response(
          JSON.stringify({ id: "inv-1", items: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("not found", { status: 404 });
    });

    window.location.hash = "#/";
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("navigation")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Neue Rechnung" }));

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "Draft note" } });

    await waitFor(
      () => {
        expect(screen.getByText(/Speichert/)).toBeTruthy();
      },
      { timeout: 2000 },
    );

    await waitFor(
      () => {
        expect(screen.getByText("Gespeichert")).toBeTruthy();
      },
      { timeout: 2000 },
    );

    expect(screen.queryByRole("button", { name: "Speichern" })).toBeNull();
  });
});
