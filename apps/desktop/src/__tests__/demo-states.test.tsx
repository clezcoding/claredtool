import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";
import { SAMPLE_INVOICE } from "../data/sample-invoice";

afterEach(() => {
  cleanup();
});

async function renderRechnung() {
  window.location.hash = "#/";
  render(<App />);
  await waitFor(() => {
    expect(screen.getByRole("navigation")).toBeTruthy();
  });
}

describe("demo states", () => {
  it("loading demo shows skeleton + spinner and hides line-item cards", async () => {
    await renderRechnung();
    fireEvent.click(screen.getByRole("button", { name: "Demo: Laden" }));

    expect(screen.getByTestId("invoice-skeleton")).toBeTruthy();
    expect(screen.getByTestId("spinner")).toBeTruthy();
    expect(screen.queryAllByTestId("line-item-card")).toHaveLength(0);
  });

  it("error demo shows exact copy and retry restores cards", async () => {
    await renderRechnung();
    fireEvent.click(screen.getByRole("button", { name: "Demo: Fehler" }));

    const errorText = screen.getByText(
      "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
    );
    expect(errorText).toBeTruthy();

    const retryButton = screen.getByRole("button", {
      name: "Erneut versuchen",
    });
    expect(retryButton).toBeTruthy();

    fireEvent.click(retryButton);
    expect(screen.getAllByTestId("line-item-card")).toHaveLength(
      SAMPLE_INVOICE.lineItems.length,
    );
  });
});
