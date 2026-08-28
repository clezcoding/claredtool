import { RouterProvider, createHashRouter } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { LoginGate } from "./auth/login-gate";
import { SessionProvider, useSession } from "./auth/session-provider";
import { AppShell } from "./components/app-shell";
import { ErrorState } from "./components/error-state";
import { Splash } from "./components/splash";
import { EntitiesScreen } from "./routes/entities";
import { KundenScreen } from "./routes/kunden";
import { PdfScreen } from "./routes/pdf";
import { RechnungScreen } from "./routes/rechnung";
import { TaxScreen } from "./routes/tax";

const SPLASH_HOLD_MS = import.meta.env.MODE === "test" ? 0 : 700;

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
