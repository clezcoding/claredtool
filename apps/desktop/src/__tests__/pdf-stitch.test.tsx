/// <reference types="node" />
import { createElement } from "react";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import "../i18n";
import { PdfScreen } from "../routes/pdf";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const PDF_SRC = resolve(ROOT, "apps/desktop/src/routes/pdf.tsx");
const PAPER_SRC = resolve(ROOT, "apps/desktop/src/components/pdf-paper.tsx");

function renderPdf(props: Record<string, unknown> = {}) {
  return render(
    <MemoryRouter>
      {createElement(PdfScreen, props as never)}
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

describe("pdf Stitch conversion", () => {
  it("exports PdfScreenProps for stitch:validate", () => {
    const src = readFileSync(PDF_SRC, "utf8");
    expect(src).toMatch(/export interface PdfScreenProps/);
  });

  it("subscribes to tax-live-store via useSyncExternalStore", () => {
    const src = readFileSync(PDF_SRC, "utf8");
    expect(src).toMatch(/subscribeTaxLive/);
    expect(src).toMatch(/getTaxLiveState/);
    expect(src).toMatch(/useSyncExternalStore/);
  });

  it("PdfPaper keeps inline #fff and #111 invert guard", () => {
    const src = readFileSync(PAPER_SRC, "utf8");
    expect(src).toMatch(/background:\s*["']#fff["']/);
    expect(src).toMatch(/color:\s*["']#111["']/);
  });

  it("does not embed Stitch HTML via iframe or dangerouslySetInnerHTML", () => {
    const src = readFileSync(PDF_SRC, "utf8");
    expect(src).not.toMatch(/iframe/);
    expect(src).not.toMatch(/dangerouslySetInnerHTML/);
  });

  it("uses Material Symbols for F-06 chrome, not Lucide", () => {
    const src = readFileSync(PDF_SRC, "utf8");
    expect(src).not.toMatch(/from ["']lucide-react["']/);
    renderPdf();
    const icons = document.querySelectorAll(".material-symbols-outlined");
    expect(icons.length).toBeGreaterThan(0);
    const ligatures = [...icons].map((node) => node.textContent ?? "");
    expect(ligatures.some((text) => text.includes("open_in_full"))).toBe(true);
    expect(ligatures.some((text) => text.includes("arrow_back"))).toBe(true);
  });

  it("EN/DE toggle changes paper document language", () => {
    renderPdf();
    fireEvent.click(screen.getByRole("button", { name: "DE" }));
    expect(within(screen.getByTestId("pdf-paper")).getByText("RECHNUNG")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(within(screen.getByTestId("pdf-paper")).getByText("INVOICE")).toBeTruthy();
  });

  it("fullscreen control is interactive and toggles pressed state", () => {
    renderPdf();
    const fullscreen = screen.getByRole("button", { name: /Vollbild|Fullscreen/i });
    expect(fullscreen.hasAttribute("disabled")).toBe(false);
    fireEvent.click(fullscreen);
    expect(fullscreen.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(fullscreen);
    expect(fullscreen.getAttribute("aria-pressed")).toBe("false");
  });

  it("shows F-06 breadcrumb invoice id and audit timeline chrome", () => {
    renderPdf();
    expect(screen.getAllByText("RE-2026-001").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Prüfpfad")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Prüfpfad/ })).toBeTruthy();
  });

  it("loading demoState shows an in-progress indicator", () => {
    renderPdf({ demoState: "loading" });
    expect(screen.getByRole("progressbar")).toBeTruthy();
    expect(screen.queryByTestId("pdf-paper")).toBeNull();
  });

  it("error demoState shows Erneut versuchen", () => {
    renderPdf({ demoState: "error" });
    expect(screen.getByRole("button", { name: /Erneut versuchen/ })).toBeTruthy();
    expect(screen.queryByTestId("pdf-paper")).toBeNull();
  });

  it("empty demoState shows no document selected", () => {
    renderPdf({ demoState: "empty" });
    expect(screen.getByText(/Kein Dokument ausgewählt|No document selected/i)).toBeTruthy();
    expect(screen.queryByTestId("pdf-paper")).toBeNull();
  });
});
