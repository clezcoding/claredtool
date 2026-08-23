import { Spinner } from "./spinner";

/** D-16: wordmark + spinner only. `public/splash.png` ships unused until UAT asks to wire it. */
export function Splash() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <p className="font-sans text-2xl font-semibold tracking-tight">Clared</p>
      <Spinner />
    </div>
  );
}
