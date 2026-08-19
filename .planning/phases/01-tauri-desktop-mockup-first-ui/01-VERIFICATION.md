---
phase: 01-tauri-desktop-mockup-first-ui
verified: 2026-08-19T14:24:00Z
status: gaps_found
score: 14/16 must-haves verified
behavior_unverified: 1
overrides_applied: 0
gaps:
  - truth: "Loading/error are demo surfaces only (skeleton/spinner; error copy „Ein Fehler ist aufgetreten…“) — refines D-11, no real network"
    status: failed
    reason: "PLAN 01-02 must_have and UI-SPEC UI-Considerations require demo loading (skeleton/spinner) and the Copywriting error row. Zero matches in apps/desktop/src for skeleton, spinner, or „Ein Fehler ist aufgetreten“. 01-02/01-03 SUMMARYs admit this was never tasked."
    artifacts:
      - path: "apps/desktop/src"
        issue: "No demo loading or error surface; CONTEXT D-11 said skip, UI-SPEC/PLAN later required it"
    missing:
      - "Demo skeleton/spinner state on form/lists/media (no network)"
      - "Error copy „Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.“ with a retry path"
behavior_unverified_items:
  - truth: "User can launch Clared as a Tauri window on macOS and on Windows (not Electron)"
    test: "Push to GitHub so desktop-build.yml runs; confirm windows-latest tauri build is green and the uploaded MSI/NSIS launches a Clared window"
    expected: "Windows bundle builds; native window titled Clared (not Electron). macOS launch already human-approved 2026-08-19."
    why_human: "No git remote, so CI has never run. Host is macOS-only. Workflow YAML is not a Windows launch."
---

# Phase 1: Tauri Desktop & Mockup-First UI Verification Report

**Phase Goal:** User launches a beautiful Tauri desktop app on macOS or Windows; interactive mockups of the invoice → live-tax → PDF loop exist before feature implementation
**Verified:** 2026-08-19T14:24:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

Core loop (Rechnung → staged tax rail → HTML PDF, plus Entities/Kunden/Tax) is present, wired, and covered by 18 passing Vitest tests. macOS Tauri launch was human-approved. One PLAN must-have is missing in code (loading/error demo). Windows launch is CI-only and unexercised (no git remote).

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | User can launch Clared as a Tauri window on macOS and on Windows (not Electron) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | macOS: `tauri.conf.json` title Clared, decorations true, Cargo.toml `tauri` 2, no Electron in `apps/`; human approved 2026-08-19. Windows: `.github/workflows/desktop-build.yml` has `windows-latest` + `tauri build` + MSI/NSIS upload; no git remote, `gh run list` cannot run. Workflow file ≠ launch. |
| 2 | Interactive mockups / UI-SPEC for the invoice → live-tax → PDF loop exist before app implementation | ✓ VERIFIED | `01-UI-SPEC.md` status approved 2026-08-19. Clickable loop in `rechnung.tsx` / `tax-rail.tsx` / `pdf.tsx`. |
| 3 | User can navigate the mockuped desktop shell (Rechnung, Entities, Kunden, Tax, PDF) | ✓ VERIFIED | `App.tsx` NAV_ITEMS + `createHashRouter` children. `routes.test.tsx` + `screens.test.tsx` pass (nav order, five destinations, no blank page). |
| 4 | React/TypeScript with shadcn/ui from `packages/ui`, Tailwind CSS v4, dark theme at boot | ✓ VERIFIED | `main.tsx` `classList.add("dark")`. `@clared/ui` workspace:*; Card/Button used. Tailwind v4 `@import "tailwindcss"` + `@tailwindcss/vite`. No `tailwind.config.js`. `components.json` style `radix-nova`. No `@radix-ui` package — Card/Button are plain elements (INFO). |
| 5 | Repo layout is `apps/desktop` + `packages/ui` only | ✓ VERIFIED | `pnpm-workspace.yaml` `apps/*` + `packages/*`. No `apps/backend`, no `packages/tax-engine`. |
| 6 | Launch lands on the filled sample-invoice Rechnung index | ✓ VERIFIED | Index route `RechnungScreen`. Test: `lands on the sample invoice number` → `RE-2026-001`. |
| 7 | `sample-invoice.ts` is EU-GmbH seller + US B2B customer with canonical TaxDecision fields | ✓ VERIFIED | Nordlicht GmbH / Acme Manufacturing LLC. Fields: `invoice_tax_rate`, `reverse_charge_flag`, `legal_reference`, `applied_rule_id`. No `rate` / `reverse_charge` / `legal_text` aliases. |
| 8 | Invoice workspace: split form/rail, 4-field cards, + Position, hover-delete, Neue Rechnung empty toggle | ✓ VERIFIED | `rechnung.tsx` + `line-item-card.tsx` + `invoice-empty-state.tsx`. `invoice.test.tsx` cards, + Position, empty toggle — pass. |
| 9 | Staged „Live Steuerberechnung“ rail + „Vorschau“ navigates to `/pdf` | ✓ VERIFIED | `tax-rail.tsx` reads `SAMPLE_INVOICE.taxDecision`; `Link to="/pdf"`. Test: rail fields + Vorschau `href="#/pdf"` — pass. |
| 10 | `/pdf` is one light HTML/CSS paper on a dark stage from `SAMPLE_INVOICE` | ✓ VERIFIED | `pdf-paper.tsx` inline `#fff`/`#111`, A4-ish. Test: invoice number, parties, totals. No pdfjs import. |
| 11 | Tax and PDF are staged only — no engine, no real PDF file | ✓ VERIFIED | No `evaluate(`, no PDF.js. Data is `SAMPLE_INVOICE` constants. |
| 12 | Entities/Kunden: one SAMPLE_INVOICE row, read-only detail, visible-disabled „Anlegen“ | ✓ VERIFIED | `screens.test.tsx` — one row, detail on click, disabled Anlegen + „Wird in Phase 3 aktiviert“. |
| 13 | `/tax` shows staged canonical TaxDecision | ✓ VERIFIED | `tax.tsx` nine canonical fields. Test asserts `applied_rule_id` / `legal_reference`, no RESEARCH aliases. |
| 14 | Empty-state hero is a real illustration at `apps/desktop/public/empty-state-hero.png` | ✓ VERIFIED | PNG 2688×1520, 3.1MB (not 1×1 placeholder). Referenced by `invoice-empty-state.tsx` as `/empty-state-hero.png`. Higgsfield CLI provenance is SUMMARY-claimed, not independently attested (human visual still useful). |
| 15 | GitHub Actions `windows-latest` job builds the Tauri app | ✓ VERIFIED | `desktop-build.yml`: matrix windows-latest + macos-latest, pnpm 11, Node 26, `dtolnay/rust-toolchain@stable`, `pnpm --filter ./apps/desktop tauri build`, Windows MSI/NSIS artifact `if-no-files-found: error`. |
| 16 | Loading/error are demo surfaces (skeleton/spinner; „Ein Fehler ist aufgetreten…“) | ✗ FAILED | No skeleton/spinner/error copy in `apps/desktop/src`. UI-SPEC marks these covered; 01-02 must_have lists them; no task implemented them. CONTEXT D-11 originally deferred them. |

**Score:** 14/16 truths verified (1 present, behavior-unverified)

**This looks intentional for #16.** CONTEXT D-11: „No per-screen loading/error/offline states in this phase.“ Executor recorded the skip in 01-02/01-03 Known Stubs. To accept the D-11 original, add:

```yaml
overrides:
  - must_have: "Loading/error are demo surfaces only (skeleton/spinner; error copy Ein Fehler ist aufgetreten)"
    reason: "CONTEXT D-11 deferred per-screen loading/error; UI-SPEC probe added demo states but 01-02 tasks never included them. Phase 1 has no network."
    accepted_by: "{name}"
    accepted_at: "{ISO timestamp}"
```

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `pnpm-workspace.yaml` | apps/* + packages/* | ✓ VERIFIED | Globs present |
| `apps/desktop/src-tauri/tauri.conf.json` | Tauri v2, decorations true, title Clared | ✓ VERIFIED | `app.windows[0]`; no v1 `tauri.windows`; `devUrl` http://localhost:5174 |
| `apps/desktop/src/App.tsx` | createHashRouter + AppShell + Outlet | ✓ VERIFIED | Five child routes, not placeholders |
| `apps/desktop/src/main.tsx` | dark-first | ✓ VERIFIED | `classList.add("dark")` before render |
| `apps/desktop/src/data/sample-invoice.ts` | canonical StagedTaxDecision | ✓ VERIFIED | Substantive SAMPLE_INVOICE |
| `packages/ui` | @clared/ui barrel | ✓ VERIFIED | `exports "." → ./src/index.ts`; Card + Button |
| `apps/desktop/vitest.config.ts` + `__tests__/*.tsx` | route/invoice/screens tests | ✓ VERIFIED | 18 tests pass |
| `apps/desktop/src/routes/rechnung.tsx` | split layout host | ✓ VERIFIED | Wired to cards, empty state, TaxRail |
| `apps/desktop/src/components/line-item-card.tsx` | 4 fields + hover-delete | ✓ VERIFIED | No per-line tax rate |
| `apps/desktop/src/components/tax-rail.tsx` | rail + Vorschau | ✓ VERIFIED | Link, not modal |
| `apps/desktop/src/components/invoice-empty-state.tsx` | hero + copy | ✓ VERIFIED | Heading + 2-minute body |
| `apps/desktop/src/routes/pdf.tsx` + `pdf-paper.tsx` | light paper | ✓ VERIFIED | Same SAMPLE_INVOICE numbers |
| `apps/desktop/src/routes/entities.tsx` | one EU-GmbH row | ✓ VERIFIED | SAMPLE_INVOICE.seller |
| `apps/desktop/src/routes/kunden.tsx` | one US row | ✓ VERIFIED | SAMPLE_INVOICE.buyer |
| `apps/desktop/src/routes/tax.tsx` | staged TaxDecision | ✓ VERIFIED | Nine canonical fields |
| `apps/desktop/src/components/create-disabled-button.tsx` | Anlegen mock | ✓ VERIFIED | disabled + Phase-3 hint |
| `apps/desktop/public/empty-state-hero.png` | real PNG | ✓ VERIFIED | 2688×1520 |
| `.github/workflows/desktop-build.yml` | windows-latest tauri build | ✓ VERIFIED | File complete; job never executed |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `packages/ui` | `apps/desktop` | `@clared/ui` workspace:*, source export | WIRED | `rechnung.tsx` / `entities.tsx` import Card; `create-disabled-button.tsx` imports Button |
| `App.tsx` | routes | `createHashRouter` from `react-router` | WIRED | No `react-router-dom`. Index + entities/kunden/tax/pdf |
| `tauri.conf.json` `devUrl` | Vite `server.port` | both 5174 | WIRED | Plan said 5173; SUMMARY: 5173 taken by BILLIT. Ports match each other. |
| `rechnung.tsx` / `pdf.tsx` | `SAMPLE_INVOICE` | same module | WIRED | Peek and paper share numbers |
| `tax-rail.tsx` | `/pdf` | `Link to="/pdf"` | WIRED | Test asserts `#/pdf` |
| `invoice-empty-state.tsx` | `/empty-state-hero.png` | img src | WIRED | Path resolves; 01-04 replaced placeholder |
| `entities.tsx` / `kunden.tsx` | `SAMPLE_INVOICE` seller/buyer | same parties | WIRED | |
| `tax.tsx` | `SAMPLE_INVOICE.taxDecision` | same staged decision as rail | WIRED | |
| CI workflow | windows-latest runner | GitHub Actions | PARTIAL | YAML wired; no remote so job has never run |

### Data-Flow Trace (Level 4)

Phase 1 data source is intentional staged `SAMPLE_INVOICE` (D-13). Static is correct, not a hollow stub.

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `rechnung.tsx` | `lineItems` / header fields | `useState(SAMPLE_INVOICE…)` | Sample invoice (staged) | FLOWING (staged) |
| `tax-rail.tsx` | `tax` | `SAMPLE_INVOICE.taxDecision` | Hardcoded TaxDecision | FLOWING (staged) |
| `pdf-paper.tsx` | `invoice` | `SAMPLE_INVOICE` | Same numbers as Rechnung | FLOWING (staged) |
| `entities.tsx` | `seller` | `SAMPLE_INVOICE.seller` | Nordlicht GmbH | FLOWING (staged) |
| `kunden.tsx` | `buyer` | `SAMPLE_INVOICE.buyer` | Acme Manufacturing LLC | FLOWING (staged) |
| `tax.tsx` | `tax` | `SAMPLE_INVOICE.taxDecision` | Canonical fields | FLOWING (staged) |

No fetch, no persist, no localStorage — matches Phase 1 prohibitions.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Five routes + invoice/tax/pdf/entities/kunden | `pnpm --filter ./apps/desktop exec vitest run --reporter=verbose` | 3 files, 18 tests, exit 0 | ✓ PASS |
| PNG is not 1×1 placeholder | `file apps/desktop/public/empty-state-hero.png` | PNG 2688×1520 | ✓ PASS |
| No Electron runtime | grep `electron` under `apps/` | no matches | ✓ PASS |
| Windows CI actually ran | `gh run list --workflow=desktop-build.yml` | no git remotes | ? SKIP (human) |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLAN/SUMMARY do not declare probes | SKIPPED |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| UI-01 | 01-01, 01-02, 01-03, 01-04 | Interactive mockups / UI-SPEC before implementation | ? NEEDS HUMAN / partial | UI-SPEC approved; clickable loop exists; loading/error demo from UI-SPEC missing |
| DESK-01 | 01-01, 01-04 | Tauri desktop on macOS and Windows | ? NEEDS HUMAN | macOS human-approved; Windows evidence is unrun CI workflow |

No orphaned Phase 1 IDs. REQUIREMENTS.md maps only UI-01 and DESK-01 here; both appear in PLAN `requirements:` fields.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `apps/desktop/src/routes/pdf.tsx` | 8–12 | Decorative zoom `±` / `100%` are `aria-hidden` no-ops | ℹ️ Info | Plan allowed decorative-only zoom |
| `packages/ui/src/components/{card,button}.tsx` | — | No `@radix-ui` dependency | ℹ️ Info | shadcn Card/Button do not require Radix primitives |
| `01-UI-SPEC.md` Registry Safety | 155 | `TBD during execute` | ℹ️ Info | Planning doc leftover; not in phase-modified app source. No TBD/FIXME/XXX in `apps/desktop/src` or `packages/ui/src`. |

### Prohibitions

| Statement | Status | Evidence |
| --------- | ------ | -------- |
| MUST NOT bundle or fall back to Electron | held | Cargo.toml `tauri` 2; no electron in `apps/` |
| MUST NOT persist (no localStorage / store) | held | No localStorage/sessionStorage; React `useState` only |
| MUST NOT present staged tax/PDF as computed output | held (judgment) | Hardcoded SAMPLE_INVOICE; heading copy is UI-SPEC „Live Steuerberechnung“ |
| MUST NOT invert PDF paper / light app theme | held | Paper `#fff`/`#111` inline; root keeps `dark` |
| MUST NOT use PDF.js | held | No pdfjs imports |
| MUST NOT omit Anlegen / fake create form | held | Visible disabled button + hint |
| MUST NOT use Higgsfield for invoice paper | held | `pdf-paper.tsx` is HTML/CSS |
| MUST NOT use stock / GenerateImage for empty-state | held (judgment) | File is a 2688×1520 illustration; CLI provenance not independently attested |

### Human Verification Required

Recorded under `behavior_unverified_items` (status is `gaps_found`, so these do not change the overall status).

#### 1. Windows Tauri launch (DESK-01)

**Test:** Add a git remote, push, wait for `desktop-build` windows-latest; download MSI/NSIS; launch Clared.
**Expected:** Green `tauri build`; native window titled Clared, not Electron.
**Why human:** No Windows host; no remote; CI has never run.

#### 2. Visual: paper-on-dark + empty-state art

**Test:** `pnpm tauri dev` (macOS already approved). Toggle Neue Rechnung; open Vorschau → /pdf.
**Expected:** Higgsfield hero fits the empty state; light paper on dark stage, content not inverted.
**Why human:** Contrast and illustration quality are visual.

macOS native chrome / dark / nav / Rechnung landing: already approved 2026-08-19 (01-01 Task 3).

### Gaps Summary

One code gap blocks `passed`:

1. **Loading/error demo surfaces** — UI-SPEC and 01-02 must_haves require skeleton/spinner plus „Ein Fehler ist aufgetreten…“. Code has neither. CONTEXT D-11 deferred these; SUMMARYs documented the skip. Either implement the demo states or accept an override.

Windows launch is not a code gap: the CI workflow exists. It is behavior-unverified until a windows-latest run (and preferably an artifact launch) happens.

Not deferred to later phases: Phase 2–4 cover backend, real entities/tax, and real PDF — not this Phase 1 demo loading/error surface.

---

_Verified: 2026-08-19T14:24:00Z_
_Verifier: Claude (gsd-verifier)_
