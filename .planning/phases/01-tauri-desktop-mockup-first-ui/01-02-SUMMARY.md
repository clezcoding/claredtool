---
phase: 01-tauri-desktop-mockup-first-ui
plan: 02
subsystem: ui
tags: [react, hash-router, vitest, invoice-canvas, staged-tax, html-pdf-paper]

requires:
  - phase: 01-tauri-desktop-mockup-first-ui
    provides: HashRouter AppShell, SAMPLE_INVOICE, @clared/ui Card, dark boot
provides:
  - Rechnung split layout (form + line-item cards left, staged tax rail right)
  - LineItemCard with four always-visible fields and hover-delete
  - Neue Rechnung empty-state toggle with /empty-state-hero.png
  - Staged Live Steuerberechnung rail + Vorschau Link to /pdf
  - /pdf light HTML/CSS paper from SAMPLE_INVOICE
affects: [01-03-entities-kunden-tax, 01-04-higgsfield-windows-ci]

actuals:
  tokens: 4574
  tasks: 3
  commits: 5

tech-stack:
  added: []
  patterns:
    - Split invoice canvas: left overflow panel, right staged tax rail
    - Line items as independent compact cards (no merge/sort)
    - TaxDecision canonical field names as read-only rail labels
    - PDF is HTML/CSS paper with inline light colors on dark stage
    - Local React state only for + Position, delete, Neue Rechnung

key-files:
  created:
    - apps/desktop/src/components/line-item-card.tsx
    - apps/desktop/src/components/invoice-empty-state.tsx
    - apps/desktop/src/components/tax-rail.tsx
    - apps/desktop/src/components/pdf-paper.tsx
    - apps/desktop/src/routes/pdf.tsx
    - apps/desktop/src/__tests__/invoice.test.tsx
  modified:
    - apps/desktop/src/routes/rechnung.tsx
    - apps/desktop/src/App.tsx

key-decisions:
  - "Empty-state return CTA is Beispielrechnung anzeigen (not in Copywriting Contract)"
  - "Tax rail and Vorschau hide while empty state is showing (UI-SPEC empty E6)"
  - "PdfPaper uses inline #fff/#111 so dark theme tokens cannot invert paper content"

patterns-established:
  - "Pattern 5: Rechnung is form-left / tax-rail-right; cards from useState(SAMPLE_INVOICE.lineItems)"
  - "Pattern 6: Vorschau is react-router Link to /pdf, never a modal"
  - "Pattern 7: PdfPaper is HTML/CSS from SAMPLE_INVOICE; no PDF.js"

requirements-completed: [UI-01]

coverage:
  - id: D1
    description: "Invoice left panel: compact 4-field line-item cards, + Position, hover-delete, Neue Rechnung empty-state toggle"
    requirement: UI-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/invoice.test.tsx#one line-item card per sample line + Neue Rechnung empty toggle"
        status: pass
    human_judgment: false
  - id: D2
    description: "Staged Live Steuerberechnung rail with canonical TaxDecision fields and Vorschau Link to /pdf"
    requirement: UI-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/invoice.test.tsx#staged Live Steuerberechnung fields and Vorschau navigates to /pdf"
        status: pass
    human_judgment: false
  - id: D3
    description: " /pdf renders SAMPLE_INVOICE as one centered light HTML paper (seller, buyer, totals, invoice number)"
    requirement: UI-01
    verification:
      - kind: unit
        ref: "apps/desktop/src/__tests__/invoice.test.tsx#SAMPLE_INVOICE number, parties, and totals on the /pdf paper"
        status: pass
    human_judgment: false
  - id: D4
    description: "Light paper on dark stage with frame+shadow; app theme stays dark; numbers match the invoice screen"
    requirement: UI-01
    verification: []
    human_judgment: true
    rationale: "Paper-vs-stage contrast and no-invert constraint are visual; folds into phase verify / 01-01 macOS checkpoint"

duration: 8min
completed: 2026-08-19
status: complete
---

# Phase 1 Plan 02: Invoice Canvas Summary

**Split Rechnung canvas with compact line-item cards, staged Live Steuerberechnung rail, Higgsfield-hero empty toggle, and light HTML/CSS /pdf paper from SAMPLE_INVOICE**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-19T13:31:44Z
- **Completed:** 2026-08-19T13:39:24Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Left panel: labeled Rechnungsnummer · Datum · Fällig inputs, one compact card per SAMPLE_INVOICE line (Bezeichnung · Menge · Einzelpreis · Netto), `+ Position` appends a blank local card, hover X deletes
- `Neue Rechnung` toggles the empty state (heading „Noch keine Rechnung erstellt“ + 2-minute body + `/empty-state-hero.png`); `Beispielrechnung anzeigen` restores the sample
- Right rail: hardcoded TaxDecision fields (`invoice_tax_rate`, `reverse_charge_flag`, `legal_reference`, `applied_rule_id`) and a `Vorschau` HashRouter link to `/pdf`
- `/pdf` is one centered light HTML paper on the dark stage with the same seller, buyer, line items, totals, and legal_reference as the invoice screen

## Task Commits

Each task was committed atomically:

1. **Task 1: Invoice form left panel** - `362b904` (test RED), `40e9dbc` (feat GREEN)
2. **Task 2: Staged live-tax rail + PDF peek** - `3a48940` (test RED), `cbc81be` (feat GREEN)
3. **Task 3: /pdf light paper on dark stage** - `fe37aac` (feat)

**Plan metadata:** docs close-out commit with STATE.md, ROADMAP.md, REQUIREMENTS.md

## TDD Gate Compliance

- Task 1 RED: `362b904` `test(01-02): add failing test for invoice line-item cards and empty-state toggle`
- Task 1 GREEN: `40e9dbc` `feat(01-02): implement line-item cards, + Position, and Neue Rechnung empty state`
- Task 2 RED: `3a48940` `test(01-02): add failing test for staged tax rail and Vorschau peek`
- Task 2 GREEN: `cbc81be` `feat(01-02): add staged Live Steuerberechnung rail and Vorschau peek`
- Task 3: not `tdd="true"` — single feat commit
- REFACTOR: none

## Files Created/Modified

- `apps/desktop/src/routes/rechnung.tsx` - split-layout host; local state for header, line items, empty toggle
- `apps/desktop/src/components/line-item-card.tsx` - four-field card, `Position löschen`, no per-line tax
- `apps/desktop/src/components/invoice-empty-state.tsx` - hero PNG + Copywriting empty heading/body
- `apps/desktop/src/components/tax-rail.tsx` - staged TaxDecision rail + `Vorschau` Link
- `apps/desktop/src/routes/pdf.tsx` - dark stage + decorative zoom chrome
- `apps/desktop/src/components/pdf-paper.tsx` - A4-ish white paper from SAMPLE_INVOICE
- `apps/desktop/src/App.tsx` - `/pdf` uses `PdfScreen` instead of placeholder
- `apps/desktop/src/__tests__/invoice.test.tsx` - cards, empty toggle, tax rail, paper

## Decisions Made

- Empty-state return copy is `Beispielrechnung anzeigen` (contract had no return-action string)
- Hide tax rail and Vorschau while empty (UI-SPEC: empty invoice hides the paper peek)
- PdfPaper paints `#fff` / `#111` inline so `text-foreground` cannot invert the paper
- Line items stay independent in SAMPLE_INVOICE array order — no merge/collision logic

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Keep exact invoice-number text for the 01-01 routes test**
- **Found during:** Task 1 GREEN (`routes.test.tsx` `getByText("RE-2026-001")`)
- **Issue:** Heading `Rechnung RE-2026-001` is not an exact text match; 01-01 relied on a CardTitle with only the number
- **Fix:** Wrap `{rechnungsnummer}` in a `<span>` inside the heading
- **Files modified:** `apps/desktop/src/routes/rechnung.tsx`
- **Verification:** `routes.test.tsx` and `invoice.test.tsx` exit 0
- **Committed in:** `40e9dbc` (Task 1 GREEN)

**2. [Rule 3 - Blocking] Vitest file filter under `pnpm --filter ./apps/desktop exec`**
- **Found during:** Task 1 RED verify
- **Issue:** Plan command passed `apps/desktop/src/__tests__/invoice.test.tsx`; filter cwd is already `apps/desktop`, so vitest found no files
- **Fix:** Run `src/__tests__/invoice.test.tsx` relative to the package (no code change)
- **Files modified:** none
- **Verification:** vitest discovers and runs the file
- **Committed in:** n/a (command-path only)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Routes regression avoided; verify command path adjusted. No scope creep. 01-03 / 01-04 untouched.

## Issues Encountered

- None beyond the two auto-fixes above

## Known Stubs

None introduced by 01-02. Carried placeholders (not this plan's deliverable):

| File | Stub | Resolves in |
|------|------|-------------|
| `apps/desktop/src/App.tsx` | `PlaceholderScreen` for Entities / Kunden / Tax | 01-03 |
| `apps/desktop/public/empty-state-hero.png` | 1×1 PNG referenced by empty state | 01-04 |

UI-SPEC loading/error demo surfaces (skeleton + „Ein Fehler ist aufgetreten…“) were not in 01-02 tasks; still demo-only, no network.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for **01-03-PLAN.md** (Entities / Kunden / Tax screens)
- Ready for **01-04-PLAN.md** (real empty-state hero + Windows CI)
- Do not start 01-03 or 01-04 from this executor
- Visual D-27 paper-on-dark check remains phase-level human verify (coverage D4)

## Self-Check: PASSED

- FOUND: `apps/desktop/src/routes/rechnung.tsx`
- FOUND: `apps/desktop/src/components/line-item-card.tsx`
- FOUND: `apps/desktop/src/components/invoice-empty-state.tsx`
- FOUND: `apps/desktop/src/components/tax-rail.tsx`
- FOUND: `apps/desktop/src/routes/pdf.tsx`
- FOUND: `apps/desktop/src/components/pdf-paper.tsx`
- FOUND: `apps/desktop/src/__tests__/invoice.test.tsx`
- FOUND: `362b904` `40e9dbc` `3a48940` `cbc81be` `fe37aac`

---
*Phase: 01-tauri-desktop-mockup-first-ui*
*Completed: 2026-08-19*
