import { Spinner } from "./spinner";

export function Splash() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <p className="font-sans text-2xl font-semibold tracking-tight">Clared</p>
      <Spinner />
    </div>
  );
}
