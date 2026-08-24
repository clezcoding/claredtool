import { Button } from "@clared/ui";
import { invoke } from "@tauri-apps/api/core";
import { useContext, useState } from "react";
import { SessionBanner } from "../components/session-banner";
import { SessionContext } from "./session-provider";

const CTA_CLASS =
  "btn-primary min-h-11 w-full rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function LoginGate() {
  const session = useContext(SessionContext);
  const [locale, setLocale] = useState<"de" | "en">("de");

  async function handleLogin() {
    if (session) {
      await session.login();
      return;
    }
    await invoke("open_login_window");
  }

  return (
    <div className="relative flex h-screen overflow-auto bg-background text-foreground">
      <div className="absolute right-6 top-5 flex rounded-full bg-muted p-0.5 text-xs font-medium">
        <button
          type="button"
          className={`rounded-full px-3 py-1 ${locale === "en" ? "bg-primary text-foreground" : "text-muted-foreground"}`}
          onClick={() => setLocale("en")}
        >
          EN
        </button>
        <button
          type="button"
          className={`rounded-full px-3 py-1 ${locale === "de" ? "bg-primary text-foreground" : "text-muted-foreground"}`}
          onClick={() => setLocale("de")}
        >
          DE
        </button>
      </div>
      <div className="m-auto flex w-full max-w-sm flex-col px-4 py-16">
        {session?.bannerKind ? (
          <div className="mb-4">
            <SessionBanner
              kind={session.bannerKind}
              onLogin={() => void session.login()}
              opening={session.openingLogin}
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-8 shadow-sm">
          <img src="/login-gate-hero.png" alt="" className="w-full rounded-md" />
          <h1 className="font-sans text-center text-[28px] font-semibold leading-[1.2] tracking-tight text-foreground">
            Clared
          </h1>
          <div className="flex flex-col gap-1 text-center">
            <p className="text-base font-semibold text-foreground">
              {locale === "de" ? "Willkommen zurück" : "Welcome back"}
            </p>
            <p className="whitespace-normal break-words text-sm text-muted-foreground">
              {locale === "de"
                ? "Bitte melden Sie sich bei Ihrem Konto an."
                : "Sign in to issue invoices."}
            </p>
            {locale === "de" ? (
              <p className="whitespace-normal break-words text-sm text-muted-foreground">
                Welcome back. Sign in to issue invoices.
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            autoFocus
            className={CTA_CLASS}
            onClick={() => void handleLogin()}
          >
            {locale === "de" ? "Anmelden" : "Sign In"}
          </Button>
        </div>
      </div>
    </div>
  );
}
