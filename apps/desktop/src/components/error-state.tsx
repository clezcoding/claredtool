import { Card, CardContent } from "@clared/ui";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div data-testid="error-state" className="flex max-w-xl flex-col gap-4">
      <Card className="border-border">
        <CardContent className="flex flex-col gap-4 pt-6">
          <p className="whitespace-normal break-words text-sm text-destructive">
            Ein Fehler ist aufgetreten. Überprüfen Sie Ihre Internetverbindung
            und laden Sie die Seite neu.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="btn-primary min-h-11 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Erneut versuchen
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
