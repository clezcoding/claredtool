import { Button } from "@clared/ui";

type CreateDisabledButtonProps = {
  enabled: boolean;
  hint: string;
  onClick?: () => void;
};

export function CreateDisabledButton({
  enabled,
  hint,
  onClick,
}: CreateDisabledButtonProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        disabled={!enabled}
        onClick={enabled ? onClick : undefined}
        className="min-h-11 font-semibold"
      >
        Anlegen
      </Button>
      {!enabled ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
