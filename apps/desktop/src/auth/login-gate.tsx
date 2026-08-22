import { Button } from "@clared/ui";
import { invoke } from "@tauri-apps/api/core";
import { useContext } from "react";
import { SessionBanner } from "../components/session-banner";
import { SessionContext } from "./session-provider";

const CTA_CLASS =
  "min-h-11 self-start font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
        <h1 className="text-[28px] font-semibold leading-[1.2]">Clared</h1>
        <p className="whitespace-normal break-words text-sm text-muted-foreground">
          Anmelden, um Rechnungen zu stellen.
        </p>
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
