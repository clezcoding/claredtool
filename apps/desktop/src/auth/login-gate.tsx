import { Button } from "@clared/ui";
import { invoke } from "@tauri-apps/api/core";
import { useContext } from "react";
import { SessionBanner } from "../components/session-banner";
import { SessionContext } from "./session-provider";

const CTA_CLASS =
  "btn-primary min-h-11 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function LoginGate() {
  const session = useContext(SessionContext);

  async function handleLogin() {
    if (session) {
      await session.login();
      return;
    }
    await invoke("open_login_window");
  }

  return (
    <div className="flex h-screen overflow-auto bg-background text-foreground">
      <div className="m-auto flex w-full max-w-xl flex-col gap-4 px-4 py-16">
        {session?.bannerKind ? (
          <SessionBanner
            kind={session.bannerKind}
            onLogin={() => void session.login()}
            opening={session.openingLogin}
          />
        ) : null}
        <img
          src="/login-gate-hero.png"
          alt=""
          className="w-full max-w-xl rounded-md"
        />
        <h1 className="font-sans text-[28px] font-semibold leading-[1.2] tracking-tight text-foreground">
          Clared
        </h1>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-foreground">
            Willkommen zurück
          </p>
          <p className="whitespace-normal break-words text-sm text-muted-foreground">
            Bitte melden Sie sich bei Ihrem Konto an.
          </p>
          <p className="whitespace-normal break-words text-sm text-muted-foreground">
            Welcome back. Sign in to issue invoices.
          </p>
        </div>
        <Button
          type="button"
          autoFocus
          className={CTA_CLASS}
          onClick={() => void handleLogin()}
        >
          Anmelden
        </Button>
      </div>
    </div>
  );
}
