import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP_CSS = path.join(here, "../styles/globals.css");
const UI_CSS = path.join(here, "../../../../packages/ui/src/styles/globals.css");

function selectorBlock(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`^${escaped}\\s*\\{([^}]*)\\}`, "m"));
  if (!match) throw new Error(`missing ${selector} block`);
  return match[1];
}

function customProps(body: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const line of body.split("\n")) {
    const match = line.trim().match(/^(--[\w-]+)\s*:\s*(.+?);?\s*$/);
    if (match) map[match[1]] = match[2].replace(/;$/, "").trim();
  }
  return map;
}

function colorScheme(body: string): string | undefined {
  return body.match(/^\s*color-scheme:\s*([^;]+);/m)?.[1].trim();
}

const desktop = readFileSync(DESKTOP_CSS, "utf-8");
const ui = readFileSync(UI_CSS, "utf-8");

describe("token sheets", () => {
  it(":root custom properties match between desktop and ui", () => {
    expect(customProps(selectorBlock(desktop, ":root"))).toEqual(
      customProps(selectorBlock(ui, ":root")),
    );
  });

  it(".dark custom properties match between desktop and ui", () => {
    expect(customProps(selectorBlock(desktop, ".dark"))).toEqual(
      customProps(selectorBlock(ui, ".dark")),
    );
  });

  it("both sheets set color-scheme light on :root and dark on .dark", () => {
    expect(colorScheme(selectorBlock(desktop, ":root"))).toBe("light");
    expect(colorScheme(selectorBlock(ui, ":root"))).toBe("light");
    expect(colorScheme(selectorBlock(desktop, ".dark"))).toBe("dark");
    expect(colorScheme(selectorBlock(ui, ".dark"))).toBe("dark");
  });
});
