import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MaterialIcon } from "../components/material-icon";

afterEach(() => {
  cleanup();
});

describe("MaterialIcon", () => {
  it("decorative=true sets aria-hidden", () => {
    const { container } = render(<MaterialIcon ligature="menu" decorative />);
    const el = container.querySelector(".material-symbols-outlined");
    expect(el).toBeTruthy();
    expect(el?.getAttribute("aria-hidden")).toBe("true");
  });

  it("decorative=false exposes aria-label and hides ligature from accessible name", () => {
    render(
      <MaterialIcon ligature="receipt_long" decorative={false} label="Rechnung" />,
    );
    const el = screen.getByLabelText("Rechnung");
    expect(el.getAttribute("aria-label")).toBe("Rechnung");
    expect(el.getAttribute("aria-hidden")).not.toBe("true");
    const ligatureNode = el.querySelector("[aria-hidden='true']");
    expect(ligatureNode?.textContent).toBe("receipt_long");
    expect(el.getAttribute("aria-label")).not.toContain("receipt_long");
  });
});
