import {
  ArrowLeft,
  Check,
  Download,
  ExternalLink,
  Mail,
  Maximize2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { PdfPaper } from "../components/pdf-paper";
import { SAMPLE_INVOICE } from "../data/sample-invoice";
import { getTaxLiveState } from "../data/tax-live-store";

type AuditStep = { title: string; timestamp: string; actor: string };

function vatPct(rate: number): number {
  return rate <= 1 ? Math.round(rate * 100) : Math.round(rate);
}

function auditSteps(vatRate: number): AuditStep[] {
  return [
    { title: "Document received", timestamp: "21 Apr 2024, 10:15", actor: "System" },
    { title: "Tax data extracted", timestamp: "21 Apr 2024, 10:15", actor: "AI Engine" },
    { title: "Tax rules applied", timestamp: "21 Apr 2024, 10:15", actor: "Tax Engine" },
    {
      title: `VAT ${vatPct(vatRate)}% applied`,
      timestamp: "21 Apr 2024, 10:15",
      actor: "Tax Engine",
    },
    { title: "Review completed", timestamp: "21 Apr 2024, 10:16", actor: "Compliance" },
    { title: "Document approved", timestamp: "21 Apr 2024, 10:16", actor: "James Doe" },
  ];
}

export function PdfScreen() {
  const [zoom, setZoom] = useState(100);
  const [lang, setLang] = useState<"en" | "de">("en");
  const live = getTaxLiveState();
  const tax = live.taxDecision ?? SAMPLE_INVOICE.taxDecision;
  const invoiceNumber = SAMPLE_INVOICE.rechnungsnummer;
  const steps = auditSteps(tax.invoice_tax_rate);

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 px-8 pt-8 pb-4">
          <h1 className="text-xl font-semibold text-foreground">PDF Viewer / Export</h1>
          <Link
            to="/"
            className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            {invoiceNumber}
          </Link>
        </header>
        <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-auto bg-muted/40 py-6 dark:bg-[#111110]">
          <div className="absolute right-6 top-4 flex items-center gap-2 text-muted-foreground">
            <button
              type="button"
              className="rounded-full border border-border bg-card px-2 py-1 text-xs dark:bg-[#1A1A1A] dark:text-foreground"
              onClick={() => setZoom((value) => Math.max(50, value - 10))}
            >
              −
            </button>
            <span className="rounded-md border border-border bg-card px-2 py-1 text-xs tabular-nums dark:bg-[#1A1A1A] dark:text-foreground">
              {zoom}%
            </span>
            <button
              type="button"
              className="rounded-full border border-border bg-card px-2 py-1 text-xs dark:bg-[#1A1A1A] dark:text-foreground"
              onClick={() => setZoom((value) => Math.min(150, value + 10))}
            >
              +
            </button>
            <button
              type="button"
              disabled
              aria-label="Fullscreen"
              className="rounded-full border border-border bg-card p-1.5 text-muted-foreground dark:bg-[#1A1A1A] dark:text-foreground"
            >
              <Maximize2 size={14} />
            </button>
          </div>
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
            <PdfPaper />
          </div>
        </div>
      </div>
      <aside className="flex w-80 shrink-0 flex-col gap-5 overflow-auto border-l border-border bg-card p-6 dark:bg-[#1A1A1A]">
        <button
          type="button"
          disabled
          className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-background text-sm text-muted-foreground dark:bg-[#111110] dark:text-foreground"
        >
          <Download size={16} />
          Download PDF
        </button>
        <button
          type="button"
          disabled
          className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-background text-sm text-muted-foreground dark:bg-[#111110] dark:text-foreground"
        >
          <Mail size={16} />
          Send via Email
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Language
          </p>
          <div className="mt-2 inline-flex rounded-full border border-border p-0.5">
            <button
              type="button"
              className={`rounded-full px-4 py-1 text-xs font-medium ${
                lang === "en"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-1 text-xs font-medium ${
                lang === "de"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setLang("de")}
            >
              DE
            </button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <p className="text-sm font-semibold">Audit Trail</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tax decision history for this document.
          </p>
          <ol className="mt-4 flex flex-col">
            {steps.map((step, index) => (
              <li key={step.title} className="relative flex gap-3 pb-5 last:pb-0">
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-6 left-[11px] h-[calc(100%-12px)] w-px bg-border"
                  />
                ) : null}
                <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[#111110] ring-2 ring-primary/40 dark:ring-primary/60">
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.timestamp}</p>
                </div>
                <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">
                  {step.actor}
                </span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            disabled
            className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-background text-sm text-muted-foreground dark:bg-[#111110] dark:text-foreground"
          >
            <ExternalLink size={16} />
            View Full Audit Trail
          </button>
        </div>
      </aside>
    </div>
  );
}
