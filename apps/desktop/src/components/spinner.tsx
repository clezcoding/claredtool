export function Spinner() {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  return (
    <div
      role="status"
      data-testid="spinner"
      className={`inline-block h-4 w-4 rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]${reduceMotion ? "" : " animate-spin"}`}
    >
      <span className="sr-only">Wird geladen</span>
    </div>
  );
}
