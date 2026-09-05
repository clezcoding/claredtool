/**
 * Crafted Minimal restyle of pdfcn Invoice Minimal (Takumi registry block).
 * Layout: header Entity.name (text only) · bill-to · line table · totals · legal block.
 * No logo (D-13), no Zahlungsblock (D-14), no draft watermark (D-17).
 *
 * Footer is fixed inside the page (not Takumi margin band) so Oatmeal is full-bleed —
 * render() margin:0. PageNumber/TotalPages still work in fixed boxes.
 */
import type { ReactElement } from "react";
import { PageNumber, TotalPages } from "takumi-pdf/primitives";
import { Document, Page, Text, View, StyleSheet } from "./lib/pdf-primitives";

/** Crafted tokens from apps/desktop/src/styles/globals.css */
export const CRAFTED = {
  oatmeal: "#F7F7F5",
  charcoal: "#111110",
  sage: "#A8BFA3",
  muted: "#6B6B66",
  white: "#FFFFFF",
} as const;

export type InvoiceLine = {
  bezeichnung: string;
  menge: number;
  einzelpreis: number;
  netto: number;
};

export type InvoiceModel = {
  entity: {
    name: string;
    address: string;
    vatId?: string | null;
    country: string;
    legalForm: string;
  };
  customer: {
    name: string;
    address: string;
    vatId?: string | null;
    country: string;
  };
  invoice: {
    number: string;
    date: string;
    dueDate: string;
  };
  items: InvoiceLine[];
};

export type InvoiceMinimalProps = {
  model: InvoiceModel;
  /** Formatted money strings already localized */
  money: {
    subtotal: string;
    taxLabel: string | null;
    taxAmount: string | null;
    total: string;
    lineRates: string[];
    lineTotals: string[];
  };
  legalReference: string | null;
  labels: {
    invoice: string;
    billTo: string;
    details: string;
    dueDate: string;
    description: string;
    qty: string;
    rate: string;
    lineTotal: string;
    subtotal: string;
    balanceDue: string;
  };
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: CRAFTED.oatmeal,
    boxSizing: "border-box",
    // No minHeight: full A4 + Takumi footer margin overflowed onto empty page 2.
    width: "100%",
    padding: 36,
    paddingBottom: 56,
    position: "relative",
    fontFamily: "Inter",
  },
  footer: {
    position: "fixed",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    color: CRAFTED.muted,
    fontFamily: "Inter",
    fontSize: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  entityName: {
    color: CRAFTED.charcoal,
    // Inter (latin + latin-ext) — Instrument Serif is latin-only; DE/AT names need umlauts.
    fontFamily: "Inter",
    fontSize: 22,
    fontWeight: "400",
    marginBottom: 4,
  },
  entityMeta: {
    color: CRAFTED.muted,
    fontSize: 9,
    marginBottom: 2,
  },
  stamp: {
    alignSelf: "flex-start",
    borderColor: CRAFTED.sage,
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stampLabel: {
    color: CRAFTED.sage,
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 0.8,
    textAlign: "right",
    textTransform: "uppercase",
  },
  stampNumber: {
    color: CRAFTED.charcoal,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },
  stampDate: {
    color: CRAFTED.muted,
    fontSize: 8,
    textAlign: "right",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  infoLabel: {
    color: CRAFTED.sage,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  body: {
    color: CRAFTED.charcoal,
    fontSize: 10,
    marginBottom: 2,
  },
  muted: {
    color: CRAFTED.muted,
    fontSize: 9,
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomColor: CRAFTED.charcoal,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#E5E5E0",
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  colDesc: { flex: 1, paddingRight: 8 },
  colQty: { width: 48, textAlign: "center" },
  colRate: { width: 88, textAlign: "right" },
  colTotal: { width: 88, textAlign: "right" },
  th: {
    color: CRAFTED.muted,
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  td: {
    color: CRAFTED.charcoal,
    fontSize: 10,
  },
  totalsWrap: {
    flexDirection: "row",
    marginTop: 20,
  },
  totalsBox: {
    width: 240,
    marginLeft: "auto",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalKey: {
    color: CRAFTED.muted,
    fontSize: 10,
  },
  totalVal: {
    color: CRAFTED.charcoal,
    fontSize: 10,
  },
  balanceKey: {
    color: CRAFTED.charcoal,
    fontSize: 12,
    fontWeight: "700",
  },
  balanceVal: {
    color: CRAFTED.sage,
    fontSize: 13,
    fontWeight: "700",
  },
  legal: {
    marginTop: 8,
    color: CRAFTED.muted,
    // ~10% larger than prior 8px (user feedback on bottom legal/footer text)
    fontSize: 9,
    lineHeight: 1.4,
  },
});

export function InvoiceMinimal(props: InvoiceMinimalProps): ReactElement {
  const { model, money, legalReference, labels } = props;
  const footerLeft = `${model.entity.name} · ${model.entity.legalForm} · ${model.entity.country}`;

  return (
    <Document
      title={`Invoice ${model.invoice.number}`}
      style={{ backgroundColor: CRAFTED.oatmeal }}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.entityName}>{model.entity.name}</Text>
            <Text style={styles.entityMeta}>{model.entity.address}</Text>
            <Text style={styles.entityMeta}>
              {[model.entity.legalForm, model.entity.country]
                .filter(Boolean)
                .join(" · ")}
              {model.entity.vatId ? ` · ${model.entity.vatId}` : ""}
            </Text>
          </View>
          <View style={styles.stamp}>
            <Text style={styles.stampLabel}>{labels.invoice}</Text>
            <Text style={styles.stampNumber}>{model.invoice.number}</Text>
            <Text style={styles.stampDate}>{model.invoice.date}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={{ width: "50%", paddingRight: 20 }}>
            <Text style={styles.infoLabel}>{labels.billTo}</Text>
            <Text style={styles.body}>{model.customer.name}</Text>
            <Text style={styles.muted}>{model.customer.address}</Text>
            <Text style={styles.muted}>
              {model.customer.country}
              {model.customer.vatId ? ` · ${model.customer.vatId}` : ""}
            </Text>
          </View>
          <View style={{ width: "50%" }}>
            <Text style={styles.infoLabel}>{labels.details}</Text>
            <Text style={styles.muted}>
              {labels.dueDate}: {model.invoice.dueDate}
            </Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={{ ...styles.th, ...styles.colDesc }}>
            {labels.description}
          </Text>
          <Text style={{ ...styles.th, ...styles.colQty }}>{labels.qty}</Text>
          <Text style={{ ...styles.th, ...styles.colRate }}>{labels.rate}</Text>
          <Text style={{ ...styles.th, ...styles.colTotal }}>
            {labels.lineTotal}
          </Text>
        </View>
        {model.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={{ ...styles.td, ...styles.colDesc }}>
              {item.bezeichnung}
            </Text>
            <Text style={{ ...styles.td, ...styles.colQty }}>
              {String(item.menge)}
            </Text>
            <Text style={{ ...styles.td, ...styles.colRate }}>
              {money.lineRates[index] ?? ""}
            </Text>
            <Text style={{ ...styles.td, ...styles.colTotal }}>
              {money.lineTotals[index] ?? ""}
            </Text>
          </View>
        ))}

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalKey}>{labels.subtotal}</Text>
              <Text style={styles.totalVal}>{money.subtotal}</Text>
            </View>
            {money.taxLabel && money.taxAmount ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalKey}>{money.taxLabel}</Text>
                <Text style={styles.totalVal}>{money.taxAmount}</Text>
              </View>
            ) : null}
            <View style={styles.totalRow}>
              <Text style={styles.balanceKey}>{labels.balanceDue}</Text>
              <Text style={styles.balanceVal}>{money.total}</Text>
            </View>
          </View>
        </View>

        {legalReference
          ? legalReference.split("\n").map((line, i) => (
              <Text
                key={i}
                style={{
                  ...styles.legal,
                  ...(i === 0 ? { marginTop: 20 } : null),
                }}
              >
                {line}
              </Text>
            ))
          : null}

        <View style={styles.footer} fixed>
          <Text style={{ fontSize: 10, color: CRAFTED.muted }}>{footerLeft}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", fontSize: 10, color: CRAFTED.muted }}>
            <PageNumber />
            <Text style={{ fontSize: 10, color: CRAFTED.muted }}> / </Text>
            <TotalPages />
          </View>
        </View>
      </Page>
    </Document>
  );
}
