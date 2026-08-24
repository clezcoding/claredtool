/** D-16: wordmark + spinner. Inline paint so splash shows before CSS. */
export function Splash() {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  return (
    <div
      role="status"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--background, #F7F7F5)",
        color: "var(--foreground, #111110)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}
    >
      <style>
        {`@keyframes clared-splash-spin { to { transform: rotate(360deg); } }`}
      </style>
      <p
        style={{
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        Clared
      </p>
      <div
        aria-hidden
        style={{
          width: 16,
          height: 16,
          boxSizing: "border-box",
          borderRadius: "50%",
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: "currentColor",
          borderRightColor: "transparent",
          animation: reduceMotion ? "none" : "clared-splash-spin 0.7s linear infinite",
        }}
      />
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        Wird geladen
      </span>
    </div>
  );
}
