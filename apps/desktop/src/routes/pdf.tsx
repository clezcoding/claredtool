import { PdfPaper } from "../components/pdf-paper";

export function PdfScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background py-8">
      <h1 className="mb-4 text-sm font-medium text-muted-foreground">PDF</h1>
      <PdfPaper />
      <div className="mt-4 flex gap-2 text-muted-foreground" aria-hidden>
        <span className="rounded-md border border-border bg-card px-2 py-1 text-xs">
          −
        </span>
        <span className="rounded-md border border-border bg-card px-2 py-1 text-xs tabular-nums">
          100%
        </span>
        <span className="rounded-md border border-border bg-card px-2 py-1 text-xs">
          +
        </span>
      </div>
    </div>
  );
}
