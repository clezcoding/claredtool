import { Button, Card, CardContent } from "@clared/ui";
import { Spinner } from "./spinner";

const CTA_CLASS =
  "min-h-11 self-start font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
      <Card>
        <CardContent className="flex flex-col gap-2">
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
