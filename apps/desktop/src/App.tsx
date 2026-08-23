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
      <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-border/70 bg-background px-3 py-4">
        <p className="px-3 pb-3 text-[15px] font-semibold tracking-tight">Clared</p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors [transition-duration:var(--dur)] [transition-timing-function:var(--ease-out)] ${
                isActive
                  ? "bg-primary/35 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon size={16} strokeWidth={1.6} />
            {label}
          </NavLink>
        ))}
        {me ? (
          <div className="mt-auto pt-3">
            <SessionChip me={me} onLogout={() => void logout()} />
          </div>
        ) : null}
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
