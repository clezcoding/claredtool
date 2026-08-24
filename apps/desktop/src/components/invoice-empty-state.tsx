const EMPTY_BODY =
  "Erstellen Sie Ihre erste Rechnung und sehen Sie sofort die Steuerberechnung. Der komplette Ablauf – vom Entwurf bis zum fertigen PDF – dauert unter 2 Minuten.";

export function InvoiceEmptyState({ onStart }: { onStart?: () => void }) {
  return (
    <div className="flex h-full min-h-[28rem] flex-col items-center justify-center gap-5 px-8 py-16 text-center">
      <img
        src="/empty-state-hero.png"
        alt=""
        className="w-full max-w-md rounded-md"
      />
      <h1 className="text-xl font-semibold text-foreground">
        Noch keine Rechnung erstellt
      </h1>
      <p className="max-w-md whitespace-normal break-words text-sm text-muted-foreground">
        {EMPTY_BODY}
      </p>
      <button
        type="button"
        className="btn-primary min-h-11 rounded-md bg-foreground px-5 py-2 text-sm font-semibold text-background transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => {
          if (onStart) {
            onStart();
            return;
          }
          document.getElementById("entity-picker")?.focus();
        }}
      >
        Beispielrechnung anzeigen
      </button>
    </div>
  );
}
