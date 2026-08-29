import { useCallback, useEffect, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useOutletContext } from "react-router";
import { useSession } from "../auth/session-provider";
import { subscribeUpdateToasts } from "../lib/updater";
import { MaterialIcon } from "./material-icon";
import { SessionBanner } from "./session-banner";
import { SessionChip } from "./session-chip";

export interface AppShellProps {}

export type AppShellOutletContext = {
  setFeedback: (message: string | null) => void;
};

export function useAppShellFeedback(): AppShellOutletContext {
  const context = useOutletContext<AppShellOutletContext | null>();
  return context ?? { setFeedback: () => {} };
}

const NAV_ITEMS = [
  { to: "/", labelKey: "nav.rechnung", ligature: "receipt_long" },
  { to: "/entities", labelKey: "nav.entities", ligature: "domain" },
  { to: "/kunden", labelKey: "nav.kunden", ligature: "group" },
  { to: "/tax", labelKey: "nav.tax", ligature: "account_balance" },
  { to: "/pdf", labelKey: "nav.pdf", ligature: "picture_as_pdf" },
] as const;

const ACTIVE_NAV_CLASS =
  "relative flex h-12 items-center gap-3 rounded-lg bg-brand-soft px-3 font-semibold text-foreground after:absolute after:inset-y-1.5 after:left-0 after:w-[3px] after:rounded-full after:bg-[var(--nav-active-bar)] after:content-[''] dark:bg-brand-soft";
const INACTIVE_NAV_CLASS =
  "relative flex h-12 items-center gap-3 rounded-lg px-3 text-muted-foreground transition-colors hover:bg-surface-container-low hover:text-foreground dark:hover:bg-surface-elevated-dark";

type DebugPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest("[contenteditable='true']"));
}

export function AppShell(_props: AppShellProps = {}) {
  const { t } = useTranslation();
  const { me, bannerKind, login, logout, openingLogin } = useSession();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  const [DebugPanel, setDebugPanel] = useState<ComponentType<DebugPanelProps> | null>(
    null,
  );

  const showBald = useCallback(() => {
    setFeedback(t("cmdk.bald"));
  }, [t]);

  useEffect(() => {
    if (!import.meta.env.DEV || import.meta.env.MODE === "test") return;
    void import("./debug-panel").then((mod) => {
      setDebugPanel(() => mod.DebugPanel);
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableShortcutTarget(event.target)) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        showBald();
        return;
      }

      if (
        import.meta.env.DEV &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "d"
      ) {
        event.preventDefault();
        setDebugPanelOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showBald]);

  useEffect(() => {
    return subscribeUpdateToasts((key) => {
      setFeedback(t(key));
    });
  }, [t]);

  const personaName = me?.name.trim() || t("persona.name");
  const personaEmail = me?.email || t("persona.email");
  const personaCompany = me ? null : t("persona.company");

  return (
    <div className="flex h-screen bg-background text-foreground">
      {DebugPanel ? (
        <DebugPanel open={debugPanelOpen} onOpenChange={setDebugPanelOpen} />
      ) : null}
      <nav className="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-background px-4 py-8 dark:bg-surface-dark">
        <div className="mb-8 flex items-center gap-3 px-2 text-foreground">
          <span
            aria-hidden
            className="flex size-8 shrink-0 rotate-45 items-center justify-center rounded bg-foreground text-background"
          >
            <span className="-rotate-45 font-serif text-[22px] leading-none italic">
              C
            </span>
          </span>
          <span>
            <span className="block font-serif text-[28px] leading-none italic">
              Clared
            </span>
            <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("shell.tagline")}
            </span>
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto pr-2">
          {NAV_ITEMS.map(({ to, labelKey, ligature }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                isActive ? ACTIVE_NAV_CLASS : INACTIVE_NAV_CLASS
              }
            >
              {({ isActive }) => (
                <>
                  <MaterialIcon
                    ligature={ligature}
                    className="text-[20px]"
                    fill={isActive ? 1 : 0}
                  />
                  <span className="text-sm font-medium">{t(labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
          <div className="rounded-lg border border-border bg-surface-container-low px-3 py-3 dark:bg-surface-elevated-dark">
            <p className="text-sm font-medium text-foreground">
              {t("shell.upgradeTitle")}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {t("shell.upgradeBody")}
            </p>
            <button
              type="button"
              className="mt-3 text-sm font-medium text-foreground underline-offset-4 hover:underline"
              onClick={showBald}
            >
              {t("shell.upgradeCta")}
            </button>
          </div>

          {me ? <SessionChip me={me} onLogout={() => void logout()} /> : null}
          <div className="flex items-center gap-3 px-3 py-2">
            {me ? null : (
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/40 text-xs font-semibold text-foreground"
              >
                AW
              </span>
            )}
            <span className="min-w-0 flex-1">
              {me ? null : (
                <span className="block truncate text-sm font-medium text-foreground">
                  {personaName}
                </span>
              )}
              <span className="block truncate text-[12px] text-muted-foreground">
                {personaEmail}
              </span>
              {personaCompany ? (
                <span className="block truncate text-[12px] text-muted-foreground">
                  {personaCompany}
                </span>
              ) : null}
            </span>
          </div>
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-end border-b border-border bg-background px-8 dark:bg-surface-dark">
          <button
            type="button"
            aria-label={t("cmdk.label")}
            className="flex h-10 items-center gap-3 rounded-lg border border-border bg-surface-container-low px-3 text-sm text-muted-foreground dark:bg-surface-elevated-dark"
            onClick={showBald}
          >
            <MaterialIcon ligature="search" className="text-[20px]" />
            <span>{t("cmdk.hint")}</span>
            <kbd className="ml-2 rounded border border-border px-1.5 py-0.5 text-[11px] font-medium">
              {t("cmdk.shortcut")}
            </kbd>
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-auto bg-background">
          {bannerKind ? (
            <SessionBanner
              kind={bannerKind}
              onLogin={() => void login()}
              opening={openingLogin}
            />
          ) : null}
          {feedback ? (
            <p role="status" className="px-8 pt-3 text-sm text-muted-foreground">
              {feedback}
            </p>
          ) : null}
          <Outlet context={{ setFeedback } satisfies AppShellOutletContext} />
        </main>
      </div>
    </div>
  );
}
