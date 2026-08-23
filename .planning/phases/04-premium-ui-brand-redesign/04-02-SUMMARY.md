---
phase: 04-premium-ui-brand-redesign
plan: 02
subsystem: ui
tags: [tailwind-v4, crafted-minimal, tabular-nums, invoice-canvas, pdf-paper]

requires:
  - phase: 04-premium-ui-brand-redesign
    provides: Crafted Minimal :root/.dark tokens, .tabular-nums, .btn-primary press, OS-follow theme
  - phase: 03-entities-invoices-live-tax
    provides: autosave 600ms, live tax rail, showHero/showRail gating, invoice empty form
provides:
  - Invoice split-canvas restyle consuming Wave-1 tokens (02/03-rechnung)
  - Tax screen + tax rail + empty-state restyle (06-tax-engine, 09-empty-state)
  - PDF stage theme-follow with D-09 PdfPaper inline light colors intact
affects: [04-03, desktop-invoice-loop, UAT]

actuals:
  tokens: 2446
  tasks: 3
  commits: 4

tech-stack:
  added: []
  patterns:
    - "Money cells use .tabular-nums utility, not a second font family (D-03)"
    - "Primary press: .btn-primary + active:scale-[0.97], motion-reduce disables scale"
    - "PdfPaper and tax-rail mini-preview keep inline #fff (D-09) — never tokenize paper content"

key-files:
  created: []
  modified:
    - apps/desktop/src/routes/rechnung.tsx
    - apps/desktop/src/routes/tax.tsx
    - apps/desktop/src/routes/pdf.tsx
    - apps/desktop/src/components/tax-rail.tsx
    - apps/desktop/src/components/line-item-card.tsx
    - apps/desktop/src/components/pdf-paper.tsx
    - apps/desktop/src/components/invoice-empty-state.tsx

key-decisions:
  - "Did not rebuild mockup Von/Kunde cards, serif totals, or tax-rules editor — D-11 IA lock; class-only restyle on existing split canvas / dl field list / empty hero"
  - "Empty CTA Beispielrechnung anzeigen restored for UI-SPEC copy; click focuses #rechnungsnummer instead of restoring SAMPLE_INVOICE (Phase 3 removed sample restore)"
  - "PdfPaper numerals may use tabular-nums classes; inline background #fff and color #111 stay (D-09)"

patterns-established:
  - "Pattern 5: money/rate values get tabular-nums; D-09 islands keep inline light colors"
  - "Pattern 6: Sage primary native buttons use btn-primary + active:scale-[0.97] + focus-visible ring"

requirements-completed: [UI-01, BRAND-01]

coverage:
  - id: D1
    description: Rechnung split canvas and line-item cards consume Wave-1 tokens; Sage + Position press scale 0.97; tabular-nums on einzelpreis/netto; autosave copy and showHero/showRail gating unchanged
    requirement: UI-01
    verification:
      - kind: other
        ref: pnpm --filter desktop build
        status: pass
      - kind: other
        ref: grep tabular-nums apps/desktop/src/components/line-item-card.tsx
        status: pass
      - kind: other
        ref: grep Speichert|showHero|showRail|bg-primary|active:scale apps/desktop/src/routes/rechnung.tsx
        status: pass
    human_judgment: false
  - id: D2
    description: Tax screen and tax rail restyle with tabular-nums on invoice_tax_rate; D-09 mini-preview inline #fff kept; empty-state hero src and Beispielrechnung anzeigen CTA present
    requirement: UI-01
    verification:
      - kind: other
        ref: pnpm --filter desktop build
        status: pass
      - kind: other
        ref: grep tabular-nums apps/desktop/src/components/tax-rail.tsx
        status: pass
      - kind: other
        ref: grep #fff apps/desktop/src/components/tax-rail.tsx
        status: pass
      - kind: other
        ref: grep Beispielrechnung anzeigen|/empty-state-hero.png apps/desktop/src/components/invoice-empty-state.tsx
        status: pass
      - kind: other
        ref: grep <dl apps/desktop/src/routes/tax.tsx
        status: pass
    human_judgment: false
  - id: D3
    description: PDF stage uses bg-background (theme-follow); PdfPaper keeps inline #fff/#111 and is not tokenized (D-09); optional tabular-nums on paper numerals
    requirement: BRAND-01
    verification:
      - kind: other
        ref: pnpm --filter desktop build
        status: pass
      - kind: other
        ref: grep -E #fff|#ffffff apps/desktop/src/components/pdf-paper.tsx
        status: pass
      - kind: other
        ref: grep bg-background apps/desktop/src/routes/pdf.tsx
        status: pass
    human_judgment: false
  - id: D4
    description: Invoice, tax, PDF, and empty-state match approved Crafted mockups 02/03/06/07/09 in Light and Dark
    requirement: UI-01
    verification: []
    human_judgment: true
    rationale: 1:1 mockup fidelity is visual UAT; build and class greps cannot prove Light/Dark craft match

duration: 6min
completed: 2026-08-23
status: complete
---

# Phase 4 Plan 02: Invoice / Tax / PDF Restyle Summary

**Wave-1 token restyle of the invoice → live-tax → PDF loop: tabular money, Sage primary press, D-09 paper guard intact**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-23T01:11:41Z
- **Completed:** 2026-08-23T01:17:48Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Rechnung split canvas consumes `bg-background` / `bg-card`; "+ Position" is Sage `bg-primary` with `.btn-primary` and `active:scale-[0.97]` (reduced-motion disables scale)
- Line-item einzelpreis/netto and tax-rail `invoice_tax_rate` use `.tabular-nums`; `Number(...) || 0` coercion unchanged
- Tax screen keeps the nine-field `dl` list on a distinct card surface; tax-rail mini-preview stays inline `#fff`
- Empty-state keeps `/empty-state-hero.png` and heading/body; CTA "Beispielrechnung anzeigen" present (focuses the empty form)
- PDF stage stays `bg-background`; PdfPaper keeps inline `#fff` / `#111`

## Task Commits

Each task was committed atomically:

1. **Task 1: Rechnung split-canvas + line-item cards restyle** - `83eda21` (feat)
2. **Task 2: Tax screen + Tax rail + invoice empty-state restyle** - `51c9542` (feat)
3. **Task 3: PDF viewer stage restyle with PdfPaper guard (D-09)** - `49a843c` (feat)

**Plan metadata:** pending docs commit

## Files Created/Modified

- `apps/desktop/src/routes/rechnung.tsx` - Sage press on "+ Position", field-grid card surface, theme background
- `apps/desktop/src/components/line-item-card.tsx` - tabular-nums on einzelpreis/netto
- `apps/desktop/src/routes/tax.tsx` - card surface, tabular-nums on invoice_tax_rate
- `apps/desktop/src/components/tax-rail.tsx` - bg-card whisper rail, tabular-nums on rate, D-09 `#fff` mini-preview
- `apps/desktop/src/components/invoice-empty-state.tsx` - token classes + Beispielrechnung CTA
- `apps/desktop/src/routes/pdf.tsx` - theme-following stage chrome, card zoom chips
- `apps/desktop/src/components/pdf-paper.tsx` - tabular-nums on numerals; inline light colors unchanged

## Decisions Made

- Class-only restyle; did not add mockup chrome (Von/Kunde cards, serif totals, tax-rules editor) because D-11 locks IA.
- Empty CTA restored as UI-SPEC copy. Click focuses `#rechnungsnummer` rather than loading `SAMPLE_INVOICE` — Phase 3 removed sample restore and invoice tests assert Neue Rechnung does not restore sample cards.
- PdfPaper may take `tabular-nums` classes; content colors stay inline (D-09 / Pitfall 4).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Empty CTA was absent after Phase 3**
- **Found during:** Task 2 (invoice-empty-state restyle)
- **Issue:** Plan assumed CTA "Beispielrechnung anzeigen" already existed. Phase 3 removed sample restore; the component had hero + copy only.
- **Fix:** Added Sage primary CTA with that copy. Click focuses the empty form (`#rechnungsnummer`) instead of restoring sample data, so Phase 3 list/canvas behavior and `invoice.test.tsx` stay valid.
- **Files modified:** `apps/desktop/src/components/invoice-empty-state.tsx`
- **Verification:** grep for CTA text and `/empty-state-hero.png`; `pnpm --filter desktop build` exit 0
- **Committed in:** `51c9542` (Task 2)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** CTA copy matches UI-SPEC/acceptance without regressing Phase 3 sample-restore removal. Visual 1:1 mockup match remains UAT (D4).

## Issues Encountered

None

## Authentication Gates

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for 04-03 (asset swap + remaining shell/auth/list restyle). UI-01 and BRAND-01 stay pending in REQUIREMENTS.md until 04-03 SUMMARY exists (shared-ID gate). Do not invert PdfPaper. Asset swap for `empty-state-hero.png` is 04-03.

## Self-Check: PASSED

- FOUND: apps/desktop/src/routes/rechnung.tsx
- FOUND: apps/desktop/src/routes/tax.tsx
- FOUND: apps/desktop/src/routes/pdf.tsx
- FOUND: apps/desktop/src/components/tax-rail.tsx
- FOUND: apps/desktop/src/components/line-item-card.tsx
- FOUND: apps/desktop/src/components/pdf-paper.tsx
- FOUND: apps/desktop/src/components/invoice-empty-state.tsx
- FOUND: 83eda21
- FOUND: 51c9542
- FOUND: 49a843c

---
*Phase: 04-premium-ui-brand-redesign*
*Completed: 2026-08-23*
