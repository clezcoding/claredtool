import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "./material-icon";

export interface ExportPanelProps {}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const RECENT = [
  {
    range: "01.04.2025 – 30.04.2025",
    file: "Clared_EXPORT_2025-04_001.csv",
    created: "02.05.2025, 08:41",
  },
  {
    range: "01.03.2025 – 31.03.2025",
    file: "Clared_EXPORT_2025-03_001.csv",
    created: "01.04.2025, 09:15",
  },
  {
    range: "01.02.2025 – 28.02.2025",
    file: "Clared_EXPORT_2025-02_001.csv",
    created: "03.03.2025, 07:52",
  },
  {
    range: "01.01.2025 – 31.01.2025",
    file: "Clared_EXPORT_2025-01_001.csv",
    created: "03.02.2025, 08:20",
  },
] as const;

export function ExportPanel(_props: ExportPanelProps = {}) {
  const { t } = useTranslation();
  const [from, setFrom] = useState("01.05.2025");
  const [to, setTo] = useState("31.05.2025");
  const [feedback, setFeedback] = useState<string | null>(null);

  const showBald = useCallback(() => {
    setFeedback(t("cmdk.bald"));
  }, [t]);

  return (
    <section
      data-testid="export-panel"
      className="border-t border-border bg-background px-8 py-8"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[20px] font-semibold text-foreground">{t("export.title")}</h2>
        <p className="mb-6 mt-1 text-sm text-on-secondary-container">{t("export.subtitle")}</p>

        {feedback ? (
          <p role="status" className="mb-4 text-sm text-muted-foreground">
            {feedback}
          </p>
        ) : null}

        <div className="mb-6 rounded-[12px] border border-secondary-container bg-card p-6 shadow-sm">
          <div className="mb-8 flex items-start">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg border border-secondary-container bg-card shadow-sm">
              <div className="flex h-8 w-8 flex-col items-center justify-center rounded bg-datev">
                <span className="text-[8px] font-bold tracking-wider text-card">DATEV</span>
              </div>
            </div>
            <div>
              <h3 className="mb-1 text-base font-semibold text-foreground">
                {t("export.datevTitle")}
              </h3>
              <p className="text-sm text-on-secondary-container">{t("export.datevBody")}</p>
            </div>
          </div>
          <div className="mb-4 flex items-end gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-medium text-on-secondary-container">
                {t("export.from")}
              </label>
              <div className="flex h-[44px] items-center rounded-[8px] border border-secondary-container bg-card px-3">
                <MaterialIcon ligature="calendar_month" className="mr-2 text-[20px] text-on-secondary-container" />
                <input
                  className={`w-full border-0 bg-transparent p-0 text-sm font-medium text-foreground outline-none ${FOCUS_RING}`}
                  type="text"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  aria-label={t("export.from")}
                />
              </div>
            </div>
            <div className="pb-3 text-on-secondary-container">–</div>
            <div className="flex-1">
              <label className="mb-2 block text-xs font-medium text-on-secondary-container">
                {t("export.to")}
              </label>
              <div className="flex h-[44px] items-center rounded-[8px] border border-secondary-container bg-card px-3">
                <MaterialIcon ligature="calendar_month" className="mr-2 text-[20px] text-on-secondary-container" />
                <input
                  className={`w-full border-0 bg-transparent p-0 text-sm font-medium text-foreground outline-none ${FOCUS_RING}`}
                  type="text"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  aria-label={t("export.to")}
                />
              </div>
            </div>
            <div className="flex-[1.5]">
              <button
                type="button"
                onClick={showBald}
                className={`flex h-[44px] w-full items-center justify-center rounded-[8px] bg-primary-container px-5 text-sm font-medium text-card hover:opacity-90 ${FOCUS_RING}`}
              >
                <MaterialIcon ligature="upload" className="mr-2 text-[20px]" />
                {t("export.generate")}
              </button>
            </div>
          </div>
          <p className="flex items-center text-xs text-on-secondary-container">
            <MaterialIcon ligature="info" className="mr-1.5 text-[16px]" />
            {t("export.hint")}
          </p>
        </div>

        <div className="mb-6 rounded-[12px] border border-secondary-container bg-card p-6 shadow-sm">
          <h3 className="mb-6 text-base font-semibold text-foreground">{t("export.recent")}</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-1/4 border-b border-secondary-container pb-3 text-left text-xs font-medium text-on-secondary-container">
                  {t("export.period")}
                </th>
                <th className="w-2/5 border-b border-secondary-container pb-3 text-left text-xs font-medium text-on-secondary-container">
                  {t("export.file")}
                </th>
                <th className="w-1/5 border-b border-secondary-container pb-3 text-left text-xs font-medium text-on-secondary-container">
                  {t("export.created")}
                </th>
                <th className="w-24 border-b border-secondary-container pb-3 text-left text-xs font-medium text-on-secondary-container">
                  {t("export.status")}
                </th>
                <th className="w-12 border-b border-secondary-container pb-3" />
              </tr>
            </thead>
            <tbody>
              {RECENT.map((row) => (
                <tr key={row.file} className="hover:bg-background">
                  <td className="border-b border-secondary-container py-4 text-sm font-medium text-foreground">
                    {row.range}
                  </td>
                  <td className="border-b border-secondary-container py-4 text-sm text-on-secondary-container">
                    {row.file}
                  </td>
                  <td className="border-b border-secondary-container py-4 text-sm tabular-nums text-on-secondary-container">
                    {row.created}
                  </td>
                  <td className="border-b border-secondary-container py-4">
                    <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-primary-container">
                      {t("export.success")}
                    </span>
                  </td>
                  <td className="border-b border-secondary-container py-4 text-right">
                    <button
                      type="button"
                      aria-label={t("export.downloadRow")}
                      onClick={showBald}
                      className={`rounded-md border border-secondary-container p-1.5 text-on-secondary-container hover:bg-card ${FOCUS_RING}`}
                    >
                      <MaterialIcon ligature="download" className="text-[16px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-center border-t border-secondary-container pt-4">
            <button
              type="button"
              onClick={showBald}
              className={`flex items-center text-sm font-medium text-on-secondary-container hover:text-foreground ${FOCUS_RING}`}
            >
              {t("export.showAll")}
              <MaterialIcon ligature="expand_more" className="ml-1 text-[16px]" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-[12px] border border-secondary-container bg-card p-6">
          <div className="flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-soft text-primary-container">
              <MaterialIcon ligature="group" className="text-[24px]" />
            </div>
            <div>
              <h3 className="mb-1 text-base font-semibold text-foreground">
                {t("export.advisorTitle")}
              </h3>
              <p className="text-sm text-on-secondary-container">{t("export.advisorBody")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={showBald}
            className={`flex h-9 items-center rounded-md border border-secondary-container bg-card px-4 text-sm font-medium text-foreground hover:bg-background ${FOCUS_RING}`}
          >
            {t("export.advisorCta")}
            <MaterialIcon ligature="chevron_right" className="ml-2 text-[16px]" />
          </button>
        </div>
      </div>
    </section>
  );
}
