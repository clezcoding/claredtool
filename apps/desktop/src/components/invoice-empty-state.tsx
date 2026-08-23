const EMPTY_BODY =
  "Erstellen Sie Ihre erste Rechnung und sehen Sie sofort die Steuerberechnung. Der komplette Ablauf – vom Entwurf bis zum fertigen PDF – dauert unter 2 Minuten.";

export function InvoiceEmptyState() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <img
        src="/empty-state-hero.png"
        alt=""
        className="w-full max-w-xl rounded-md"
      />
      <h1 className="text-xl font-semibold text-foreground">
        Noch keine Rechnung erstellt
      </h1>
      <p className="whitespace-normal break-words text-sm text-muted-foreground">
        {EMPTY_BODY}
      </p>
      <button
        type="button"
        className="btn-primary min-h-11 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => {
          document.getElementById("rechnungsnummer")?.focus();
        }}
      >
        Beispielrechnung anzeigen
      </button>
    </div>
  );
}
