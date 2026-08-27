import { useTranslation } from "react-i18next";
import { EmptyState } from "./empty-state";

export interface InvoiceEmptyStateProps {
  onStart?: () => void;
}

export function InvoiceEmptyState({ onStart }: InvoiceEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      title={t("empty.rechnung.title")}
      description={t("empty.rechnung.body")}
      ctaLabel={t("empty.rechnung.cta")}
      onCta={() => {
        onStart?.();
      }}
    />
  );
}
