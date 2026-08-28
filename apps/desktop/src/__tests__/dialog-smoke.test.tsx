import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import {
  AlertDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@clared/ui";

afterEach(() => {
  cleanup();
});

function OpenDialogFixture() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Smoke dialog</DialogTitle>
        <DialogDescription>Escape closes; Back does not.</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

describe("dialog-smoke D-35/D-36", () => {
  it("re-exports Dialog and AlertDialog from @clared/ui", () => {
    expect(typeof Dialog).toBe("function");
    expect(typeof AlertDialog).toBe("function");
  });

  it("closes the dialog on Escape", () => {
    render(<OpenDialogFixture />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("leaves the dialog open on history.back()", () => {
    window.history.pushState({}, "", "#/rechnung");
    window.history.pushState({}, "", "#/rechnung?modal=1");
    render(<OpenDialogFixture />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    window.history.back();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});
