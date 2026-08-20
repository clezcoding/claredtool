import { Card, CardContent } from "@clared/ui";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div data-testid="error-state" className="flex max-w-xl flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-destructive">
            Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder
            kontaktieren Sie den Support.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="self-start rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            Erneut versuchen
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
