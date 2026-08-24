import {
  Building2,
  Calculator,
  FileImage,
  FileText,
  Users,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  RouterProvider,
  createHashRouter,
} from "react-router";
import { useEffect, useMemo, useState } from "react";
import { LoginGate } from "./auth/login-gate";
import { SessionProvider, useSession } from "./auth/session-provider";
import { ErrorState } from "./components/error-state";
import { SessionBanner } from "./components/session-banner";
import { SessionChip } from "./components/session-chip";
import { Splash } from "./components/splash";
import { EntitiesScreen } from "./routes/entities";
import { KundenScreen } from "./routes/kunden";
import { PdfScreen } from "./routes/pdf";
import { RechnungScreen } from "./routes/rechnung";
import { TaxScreen } from "./routes/tax";

const NAV_ITEMS = [
  { to: "/", label: "Rechnung", icon: FileText },
  { to: "/entities", label: "Entities", icon: Building2 },
  { to: "/kunden", label: "Kunden", icon: Users },
  { to: "/tax", label: "Tax", icon: Calculator },
  { to: "/pdf", label: "PDF", icon: FileImage },
] as const;

const SPLASH_HOLD_MS = import.meta.env.MODE === "test" ? 0 : 700;

export function AppShell() {
  const { me, bannerKind, login, logout, openingLogin } = useSession();

  return (
    <div className="flex h-screen bg-background text-foreground">
      <nav className="flex w-60 shrink-0 flex-col gap-1 border-r border-border bg-white px-4 py-5 dark:bg-[#0F0F0F]">
        <div className="mb-3 flex items-center gap-2 px-2">
          <svg
            aria-hidden
            width={16}
            height={16}
            viewBox="0 0 16 16"
            className="shrink-0 text-primary"
          >
            <path d="M8 0 16 8 8 16 0 8Z" fill="currentColor" />
          </svg>
          <p className="wordmark">Clared</p>
        </div>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm transition-colors [transition-duration:var(--dur)] [transition-timing-function:var(--ease-out)] ${
                isActive
                  ? "bg-primary/20 font-medium text-foreground after:absolute after:inset-y-1.5 after:left-0 after:w-[3px] after:rounded-full after:bg-primary after:content-[''] dark:bg-primary/15"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon size={18} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
        <div className="mt-auto pt-4">
          <p className="px-3.5 pb-2 text-[11px] text-muted-foreground/50">⌘K</p>
          {me ? (
            <SessionChip me={me} onLogout={() => void logout()} />
          ) : null}
        </div>
      </nav>
      <main className="min-w-0 flex-1 overflow-auto bg-background">
        {bannerKind ? (
          <SessionBanner
            kind={bannerKind}
            onLogin={() => void login()}
            opening={openingLogin}
          />
        ) : null}
        <Outlet />
      </main>
    </div>
  );
}

function AuthenticatedApp() {
  const { state, retryMe } = useSession();
  const [minSplashDone, setMinSplashDone] = useState(SPLASH_HOLD_MS === 0);
  const router = useMemo(
    () =>
      createHashRouter([
        {
          path: "/",
          element: <AppShell />,
          children: [
            { index: true, element: <RechnungScreen /> },
            { path: "entities", element: <EntitiesScreen /> },
            { path: "kunden", element: <KundenScreen /> },
            { path: "tax", element: <TaxScreen /> },
            { path: "pdf", element: <PdfScreen /> },
          ],
        },
      ]),
    [],
  );

  useEffect(() => {
    if (SPLASH_HOLD_MS === 0) return;
    const timer = window.setTimeout(() => setMinSplashDone(true), SPLASH_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (state === "boot" || !minSplashDone) {
    return <Splash />;
  }

  if (state === "boot-error") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <ErrorState onRetry={() => void retryMe()} />
      </div>
    );
  }

  if (state === "unsigned") {
    return <LoginGate />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <SessionProvider>
      <AuthenticatedApp />
    </SessionProvider>
  );
}
