import { Button, Card, CardContent } from "@clared/ui";
import { Spinner } from "./spinner";

const CTA_CLASS =
  "btn-primary min-h-11 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-[scale] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function SessionBanner({
  kind,
  onLogin,
  opening,
}: {
  kind: "unauthorized" | "cancel";
  onLogin?: () => void;
  opening?: boolean;
}) {
  const unauthorized = kind === "unauthorized";

  return (
    <div role={unauthorized ? "alert" : "status"} className="sticky top-0 z-10 p-4">
      <Card className="border-border">
        <CardContent className="flex flex-col gap-3 pt-6">
          <p
            className={`whitespace-normal break-words text-sm ${unauthorized ? "text-destructive" : "text-muted-foreground"}`}
          >
            {unauthorized
              ? "Sitzung abgelaufen. Bitte erneut anmelden."
              : "Anmeldung abgebrochen"}
          </p>
          <Button
            type="button"
            className={CTA_CLASS}
            onClick={() => onLogin?.()}
          >
            {opening ? <Spinner /> : null}
            Anmelden
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
