---
status: complete
phase: 01-tauri-desktop-mockup-first-ui
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md, 01-05-SUMMARY.md]
started: 2026-08-20T13:58:00Z
updated: 2026-08-20T14:07:00Z
tester: orca-computer-use
---

## Current Test

[testing complete]

## Tests

### 1. Native Clared-Fenster (macOS)
expected: Native Tauri-Fenster, Titel Clared, OS-Titlebar, dunkles Theme, Nav Rechnung · Entities · Kunden · Tax · PDF, Landing auf SAMPLE_INVOICE (RE-2026-001).
result: pass
source: orca-automated
coverage_id: 01-01-D3
verified: "Orca computer-use 2026-08-20: window title Clared, pid 38701, 1280×800, OS close/min/fullscreen buttons; dark HashRouter shell; nav Rechnung Entities Kunden Tax PDF; index Rechnung RE-2026-001 with two line items and Live Steuerberechnung."

### 2. Helles PDF-Papier auf dunkler Bühne
expected: /pdf zeigt ein zentriertes helles HTML-Papier (Rahmen+Schatten) auf dunkler Bühne; Theme bleibt dunkel; RE-2026-001, Parteien und Summen lesbar, nicht invertiert.
result: pass
source: orca-automated
coverage_id: 01-02-D4
verified: "Orca click Vorschau: PDF nav active; white RECHNUNG paper on dark stage; Nordlicht GmbH / Acme Manufacturing LLC; Netto 2080.00 Brutto 2080.00; § 13b UStG; numbers not inverted."

### 3. Empty-State-Hero-Illustration
expected: Nach „Neue Rechnung“ Higgsfield-Illustration in empty-state-hero.png, Heading „Noch keine Rechnung erstellt“, CTA „Beispielrechnung anzeigen“. Kein 1×1-Platzhalter.
result: pass
source: orca-automated
coverage_id: 01-04-D1
verified: "Orca click Neue Rechnung: heading + UI-SPEC body + Beispielrechnung anzeigen. After 3MB PNG load, hero shows stylized glowing invoice graphic on dark navy (public/empty-state-hero.png 2688×1520, Vite 200). Beispielrechnung restores sample cards."

### 4. Demo-Lade- und Fehlerflächen
expected: „Demo: Laden“ zeigt Skeleton auf Form/Listen plus Spinner „Wird geladen“. „Demo: Fehler“ zeigt „Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.“ mit Retry; Retry stellt Karten wieder her.
result: pass
source: orca-automated
coverage_id: 01-05-D3
verified: "Orca Demo: Laden — four skeleton blocks, Wird geladen spinner, no line-item cards, tax rail hidden. Demo: Fehler — exact UI-SPEC copy + Erneut versuchen. Retry restores RE-2026-001 cards and Live Steuerberechnung."

### 5. Tauri 2 Monorepo + Design-System
expected: Tauri 2 pnpm monorepo (apps/desktop + packages/ui) with shadcn/Radix Tailwind v4 dark-first design system and Vitest harness
result: pass
source: automated
coverage_id: D1

### 6. Dark HashRouter AppShell
expected: Dark HashRouter AppShell with Rechnung · Entities · Kunden · Tax · PDF nav; index route renders SAMPLE_INVOICE through @clared/ui Card
result: pass
source: automated
coverage_id: D2

### 7. Invoice left panel
expected: Invoice left panel: compact 4-field line-item cards, + Position, hover-delete, Neue Rechnung empty-state toggle
result: pass
source: automated
coverage_id: D1

### 8. Staged Live Steuerberechnung rail
expected: Staged Live Steuerberechnung rail with canonical TaxDecision fields and Vorschau Link to /pdf
result: pass
source: automated
coverage_id: D2

### 9. PDF SAMPLE_INVOICE paper content
expected: /pdf renders SAMPLE_INVOICE as one centered light HTML paper (seller, buyer, totals, invoice number)
result: pass
source: automated
coverage_id: D3

### 10. Entities screen
expected: Entities: one EU-GmbH row from SAMPLE_INVOICE.seller; click opens read-only detail; Anlegen visible and disabled with Phase-3 hint
result: pass
source: automated
coverage_id: D1
orca: "Orca 2026-08-20: heading Entities; Anlegen disabled; Wird in Phase 3 aktiviert; Nordlicht GmbH click shows Name/Adresse/USt-IdNr. DE812345678."

### 11. Kunden screen
expected: Kunden: one US customer row from SAMPLE_INVOICE.buyer; click opens read-only detail; shared disabled Anlegen
result: pass
source: automated
coverage_id: D2
orca: "Orca 2026-08-20: heading Kunden; Anlegen disabled; Acme Manufacturing LLC click shows Name/Adresse/Land US."

### 12. Tax screen canonical fields
expected: /tax renders staged SAMPLE_INVOICE.taxDecision with canonical field names (legal_reference, applied_rule_id, no RESEARCH aliases)
result: pass
source: automated
coverage_id: D3
orca: "Orca 2026-08-20: nine canonical fields including legal_reference § 13b UStG, applied_rule_id eu-b2b-reverse-charge, applied_rule_version 1.0.0; no RESEARCH aliases."

### 13. GitHub Actions Windows/macOS Tauri build
expected: GitHub Actions desktop-build.yml builds Tauri on windows-latest and macos-latest and uploads the Windows MSI/NSIS bundle
result: pass
source: automated
coverage_id: D2

### 14. Skeleton/Spinner/ErrorState primitives
expected: Skeleton, Spinner, ErrorState components as reusable primitives
result: pass
source: automated
coverage_id: D1

### 15. Demo-state machine
expected: Demo-state machine in Rechnung with loading/error/ready branches
result: pass
source: automated
coverage_id: D2

## Summary

total: 15
passed: 15
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
