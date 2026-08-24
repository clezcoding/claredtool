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

afterEach(() => {
  cleanup();
  resetAuthMocks();
});

function mockInvoiceLoadSequence(options: { fail?: boolean } = {}) {
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/me")) {
      return new Response(JSON.stringify(signedInOwner), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (options.fail) {
      return new Response("error", { status: 500 });
    }
    if (url.includes("/api/entities")) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.endsWith("/api/invoices")) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("not found", { status: 404 });
  });
}

describe("invoice load states", () => {
  it("shows skeleton placeholders while drafts load", async () => {
    let releaseInvoices: (value: Response) => void = () => undefined;
    const invoicesPending = new Promise<Response>((resolve) => {
      releaseInvoices = resolve;
    });

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/me")) {
        return new Response(JSON.stringify(signedInOwner), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/entities") && (!init?.method || init.method === "GET")) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/invoices") && (!init?.method || init.method === "GET")) {
        return invoicesPending;
      }
      return new Response("not found", { status: 404 });
    });

    window.location.hash = "#/";
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("navigation")).toBeTruthy();
      expect(screen.getByTestId("invoice-skeleton")).toBeTruthy();
    });

    releaseInvoices(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await waitFor(() => {
      expect(screen.queryByTestId("invoice-skeleton")).toBeNull();
    });
  });

  it("shows ErrorState and retry reloads drafts", async () => {
    mockInvoiceLoadSequence({ fail: true });
    window.location.hash = "#/";
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("error-state")).toBeTruthy();
    });

    mockInvoiceLoadSequence();
    fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));

    await waitFor(() => {
      expect(screen.queryByTestId("error-state")).toBeNull();
      expect(
        screen.getByRole("heading", { name: "Noch keine Rechnung erstellt" }),
      ).toBeTruthy();
    });
  });
});
