import { Card, CardContent } from "@clared/ui";
import { useTranslation } from "react-i18next";

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div data-testid="error-state" className="flex max-w-xl flex-col gap-4">
      <Card className="border-border">
        <CardContent className="flex flex-col gap-4 pt-6">
          <p className="text-sm font-medium text-destructive">{t("error.retry.title")}</p>
          <p className="whitespace-normal break-words text-sm text-destructive">
            {t("error.retry.body")}
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="btn-primary min-h-11 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("error.retry.action")}
            </button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
