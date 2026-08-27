import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useMemo } from "react";
import { RouterProvider, createMemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import {
  SessionContext,
  type SessionContextValue,
} from "../auth/session-provider";
import type { MeResponse } from "../auth/types";
import { AppShell } from "../components/app-shell";
import "../i18n";
import { signedInOwner } from "./auth-signed-in";

afterEach(() => {
  cleanup();
});

function stubSession(me: MeResponse | null): SessionContextValue {
  return {
    state: "signed",
    me,
    bannerKind: null,
    banner: null,
    openingLogin: false,
    login: async () => undefined,
    logout: async () => undefined,
    retryMe: async () => undefined,
    clearBanner: () => undefined,
  };
}

function ShellHarness({
  me,
  initialPath = "/",
}: {
  me: MeResponse | null;
  initialPath?: string;
}) {
  const router = useMemo(
    () =>
      createMemoryRouter(
        [
          {
            path: "/",
            element: <AppShell />,
            children: [
              { index: true, element: <div>index</div> },
              { path: "entities", element: <div>entities</div> },
              { path: "kunden", element: <div>kunden</div> },
              { path: "tax", element: <div>tax</div> },
              { path: "pdf", element: <div>pdf</div> },
            ],
          },
        ],
        { initialEntries: [initialPath] },
      ),
    [initialPath],
  );

  return (
    <SessionContext.Provider value={stubSession(me)}>
      <RouterProvider router={router} />
    </SessionContext.Provider>
  );
}

function renderShell(
  me: MeResponse | null = null,
  initialPath = "/",
): ReturnType<typeof render> {
  return render(<ShellHarness me={me} initialPath={initialPath} />);
}

describe("AppShell", () => {
  it("renders exactly five nav links: Rechnung, Entities, Kunden, Tax, PDF", () => {
    renderShell();
    const nav = screen.getByRole("navigation");
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/entities",
      "/kunden",
      "/tax",
      "/pdf",
    ]);
    for (const name of ["Rechnung", "Entities", "Kunden", "Tax", "PDF"]) {
      expect(within(nav).getByRole("link", { name })).toBeTruthy();
    }
  });

  it("sidebar uses w-[260px] and header uses h-[72px]", () => {
    renderShell();
    expect(screen.getByRole("navigation").className).toContain("w-[260px]");
    expect(screen.getByRole("banner").className).toContain("h-[72px]");
  });

  it("marks the active route with sage nav-active-bar styles", () => {
    renderShell(null, "/entities");
    const entities = screen.getByRole("link", { name: "Entities" });
    expect(entities.className).toContain("nav-active-bar");
    const rechnung = screen.getByRole("link", { name: "Rechnung" });
    expect(rechnung.className).not.toContain("nav-active-bar");
  });

  it("shows R-02 persona when me is null", () => {
    renderShell(null);
    expect(screen.getByText("Alexander Wagner")).toBeTruthy();
    expect(screen.getByText("aw@clared.de")).toBeTruthy();
    expect(screen.getByText("Greenfield Studio GmbH")).toBeTruthy();
  });

  it("shows live /me name and email when session is present", () => {
    renderShell(signedInOwner);
    expect(screen.getByText("Ada Owner")).toBeTruthy();
    expect(screen.getByText("owner@clared.test")).toBeTruthy();
    expect(screen.queryByText("Alexander Wagner")).toBeNull();
  });

  it("shows Bald feedback when ⌘K chrome is clicked", () => {
    renderShell();
    fireEvent.click(screen.getByRole("button", { name: "Befehlspalette" }));
    expect(screen.getByText("Bald")).toBeTruthy();
  });

  it("shows Bald feedback on ⌘/Ctrl+K and never stays silent", () => {
    renderShell();
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByText("Bald")).toBeTruthy();
  });

  it("upgrade CTA shows local Bald feedback without navigating away", () => {
    renderShell();
    fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
    expect(screen.getByText("Bald")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Upgrade" }).closest("a")).toBeNull();
  });
});
