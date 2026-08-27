import { MaterialIcon } from "./material-icon";

export interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel: string;
  onCta: () => void;
}

export function EmptyState({ title, description, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-[28rem] flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-10 flex w-full max-w-[480px] items-center justify-center overflow-hidden rounded-2xl aspect-[4/3]">
        <img
          src="/empty-state-hero.png"
          alt=""
          className="h-full w-full object-contain"
        />
      </div>
      <h1 className="mb-4 text-[28px] font-semibold leading-[34px] text-foreground">
        {title}
      </h1>
      <p className="mb-10 max-w-sm whitespace-normal break-words text-sm text-muted-foreground">
        {description}
      </p>
      <button
        type="button"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-medium text-background shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={onCta}
      >
        <MaterialIcon ligature="add" className="text-[20px]" />
        {ctaLabel}
      </button>
    </div>
  );
}
