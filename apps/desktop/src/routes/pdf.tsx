import { useCallback, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ErrorState } from "../components/error-state";
import { ExportPanel } from "../components/export-panel";
import { MaterialIcon } from "../components/material-icon";
import { PdfPaper } from "../components/pdf-paper";
import { SAMPLE_INVOICE } from "../data/sample-invoice";
import { getTaxLiveState, subscribeTaxLive } from "../data/tax-live-store";

export type PdfDemoState = "loading" | "error" | "empty" | "populated";

export interface PdfScreenProps {
  demoState?: PdfDemoState;
}

type AuditStep = { title: string; timestamp: string; actor: string };

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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
    { title: "Document approved", timestamp: "21 Apr 2024, 10:16", actor: "Alexander Wagner" },
  ];
}

export function PdfScreen({ demoState = "populated" }: PdfScreenProps = {}) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(100);
  const [lang, setLang] = useState<"en" | "de">("de");
  const [fullscreen, setFullscreen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { taxDecision } = useSyncExternalStore(
    subscribeTaxLive,
    getTaxLiveState,
    getTaxLiveState,
  );

  const vatRate =
    taxDecision?.invoice_tax_rate ?? SAMPLE_INVOICE.taxDecision.invoice_tax_rate;
  const invoiceNumber = SAMPLE_INVOICE.rechnungsnummer;
  const steps = auditSteps(vatRate);

  const showBald = useCallback(() => {
    setFeedback(t("cmdk.bald"));
  }, [t]);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="flex min-h-full min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border px-8">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              aria-label={t("pdf.back")}
              className={`flex items-center gap-2 text-muted-foreground hover:text-foreground ${FOCUS_RING}`}
            >
              <MaterialIcon ligature="arrow_back" className="text-[20px]" />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-foreground">{t("pdf.title")}</h1>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <MaterialIcon ligature="arrow_back" className="text-[14px]" />
                {invoiceNumber}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-1.5 shadow-sm">
            <button
              type="button"
              aria-label={t("pdf.zoomOut")}
              className={`flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
              onClick={() => setZoom((value) => Math.max(50, value - 10))}
            >
              <MaterialIcon ligature="remove" className="text-[18px]" />
            </button>
            <span className="w-12 text-center text-xs tabular-nums text-foreground">
              {zoom}%
            </span>
            <button
              type="button"
              aria-label={t("pdf.zoomIn")}
              className={`flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
              onClick={() => setZoom((value) => Math.min(150, value + 10))}
            >
              <MaterialIcon ligature="add" className="text-[18px]" />
            </button>
            <div className="mx-1 h-5 w-px bg-border" />
            <button
              type="button"
              aria-label={t("pdf.fullscreen")}
              aria-pressed={fullscreen}
              className={`flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground ${FOCUS_RING}`}
              onClick={() => setFullscreen((value) => !value)}
            >
              <MaterialIcon ligature="open_in_full" className="text-[18px]" />
            </button>
          </div>
        </header>

        {feedback ? (
          <p role="status" className="px-8 pt-3 text-sm text-muted-foreground">
            {feedback}
          </p>
        ) : null}

        <div className="relative flex min-h-0 flex-1 items-start justify-center overflow-auto bg-muted/40 p-8 dark:bg-canvas-dark">
          {demoState === "loading" ? (
            <div
              role="progressbar"
              aria-label={t("pdf.loading")}
              className="flex flex-col items-center gap-3 self-center text-sm text-muted-foreground"
            >
              <MaterialIcon ligature="progress_activity" className="text-[32px]" />
              {t("pdf.loading")}
            </div>
          ) : null}
          {demoState === "error" ? (
            <div className="self-center">
              <ErrorState onRetry={() => undefined} />
            </div>
          ) : null}
          {demoState === "empty" ? (
            <p className="self-center text-sm text-muted-foreground">{t("pdf.empty")}</p>
          ) : null}
          {demoState === "populated" ? (
            <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
              <PdfPaper lang={lang} />
            </div>
          ) : null}
        </div>
      </div>

      {fullscreen ? null : (
        <aside className="flex w-[360px] shrink-0 flex-col overflow-auto border-l border-border bg-card p-6 dark:bg-surface-dark">
          <div className="mb-6 rounded-xl border border-border bg-background p-5 dark:bg-surface-elevated-dark">
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t("pdf.actions")}</h3>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                aria-label={t("pdf.download")}
                onClick={showBald}
                className={`flex h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted ${FOCUS_RING}`}
              >
                <MaterialIcon ligature="download" className="text-[18px]" />
                {t("pdf.download")}
              </button>
              <button
                type="button"
                aria-label={t("pdf.email")}
                onClick={showBald}
                className={`flex h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted ${FOCUS_RING}`}
              >
                <MaterialIcon ligature="mail" className="text-[18px]" />
                {t("pdf.email")}
              </button>
              <button
                type="button"
                aria-label={t("pdf.print")}
                onClick={showBald}
                className={`flex h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted ${FOCUS_RING}`}
              >
                <MaterialIcon ligature="print" className="text-[18px]" />
                {t("pdf.print")}
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t("pdf.docLang")}</h3>
            <div className="flex rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                className={`flex h-8 flex-1 items-center justify-center rounded text-xs ${FOCUS_RING} ${
                  lang === "en"
                    ? "border border-border bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setLang("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={`flex h-8 flex-1 items-center justify-center rounded text-xs ${FOCUS_RING} ${
                  lang === "de"
                    ? "border border-border bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setLang("de")}
              >
                DE
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <h3 className="text-sm font-semibold text-foreground">{t("pdf.audit")}</h3>
            <p className="mb-6 mt-1 text-xs text-muted-foreground">{t("pdf.auditHint")}</p>
            <ol className="relative flex flex-col pl-3">
              <span
                aria-hidden
                className="absolute top-3 bottom-8 left-[17px] w-px bg-border"
              />
              {steps.map((step) => (
                <li key={step.title} className="relative mb-6 flex items-start gap-4 last:mb-0">
                  <span className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary bg-background">
                    <MaterialIcon
                      ligature="check"
                      className="text-[12px] text-primary"
                      wght={600}
                    />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="mb-0.5 flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-foreground">{step.title}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {step.actor}
                      </span>
                    </div>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {step.timestamp}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={showBald}
              className={`mt-8 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-transparent text-xs text-foreground hover:bg-muted ${FOCUS_RING}`}
            >
              {t("pdf.auditFull")}
              <MaterialIcon ligature="open_in_new" className="text-[16px]" />
            </button>
          </div>
        </aside>
      )}
      </div>
      <ExportPanel />
    </div>
  );
}
