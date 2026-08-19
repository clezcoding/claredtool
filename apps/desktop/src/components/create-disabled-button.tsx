import { Button } from "@clared/ui";

export function CreateDisabledButton() {
  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" disabled>
        Anlegen
      </Button>
      <p className="text-xs text-muted-foreground">Wird in Phase 3 aktiviert</p>
    </div>
  );
}
