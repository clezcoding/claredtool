---
phase: 04-premium-ui-brand-redesign
verified: 2026-08-23T03:45:00Z
status: gaps_found
score: 17/24 must-haves verified
behavior_unverified: 1
overrides_applied: 0
decision_coverage:
  honored: 19
  total: 19
  not_honored: []
re_verification:
  previous_status: human_needed
  previous_score: 16/19
  gaps_closed:
    - "G-04-1 invoice picker value is row.id; display uses invoiceLabel; ComboboxClear is not InputGroupButton"
    - "G-04-2 boot IIFE + applyTheme paint Pale Oatmeal #F7F7F5 / Deep Charcoal #111110 on html and body"
    - "G-04-3 Splash inline Clared + ring; AuthenticatedApp holds Splash for boot or SPLASH_HOLD_MS 700"
  gaps_remaining:
    - "1:1 craft vs mockups/approved 02–09 still needs human (D-11 look, D-13 5-item IA)"
    - "Splash min-hold observability at runtime (no unit test for minSplashDone)"
  regressions:
    - "login-gate.tsx no longer renders /login-gate-hero.png (file remains in public/)"
    - "invoice-empty-state CTA is Neue Rechnung, not UI-SPEC/04-04 Beispielrechnung anzeigen"
    - "main.tsx prefers-color-scheme change only toggles .dark; does not applyTheme paint after 04-04 inline backgrounds"
gaps:
  - truth: "Empty states render the documented empty copy and illustration. Return CTA is Beispielrechnung anzeigen. Tax rail and Vorschau hide while empty state is showing."
    status: failed
    reason: "Illustration and showRail=!showHero still hide Tax/PDF. CTA text is Neue Rechnung, contradicting 04-UI-SPEC empty coverage and 04-04 must_have."
    artifacts:
      - path: apps/desktop/src/components/invoice-empty-state.tsx
        issue: "Button label Neue Rechnung"
    missing:
      - "Set empty-state CTA to Beispielrechnung anzeigen, or change UI-SPEC + 04-04 must_have if Neue Rechnung is the accepted copy"
  - truth: "The login gate is restyled to 08-login.png with the new Crafted Login-Gate hero and the system-font wordmark Clared (D-04); bilingual DE/EN copy where the mockup shows it (D-15)."
    status: failed
    reason: "Wordmark + DE/EN copy exist. No <img src=/login-gate-hero.png>. 04-03 artifact is orphaned. Prior verification claimed the img was wired."
    artifacts:
      - path: apps/desktop/src/auth/login-gate.tsx
        issue: "Hero image omitted; h1 uses font-serif not font-sans"
      - path: apps/desktop/public/login-gate-hero.png
        issue: "PNG present (2688×1520) but unused"
    missing:
      - "Wire login-gate-hero.png into LoginGate per 04-03/D-14, or record an accepted override that 08-login is card-only"
  - truth: "matchMedia prefers-color-scheme change listener re-resolves appearance while pref === system, including D-02 html/body paint."
    status: failed
    reason: "Listener toggles documentElement.dark only. applyTheme writes inline background/color-scheme that beat Tailwind body bg. OS switch while system can leave oatmeal/charcoal stuck against the other theme tokens."
    artifacts:
      - path: apps/desktop/src/main.tsx
        issue: "change handler does not call applyTheme('system') / paintDocument"
    missing:
      - "On matchMedia change when currentPref()==='system', call applyTheme('system') so class and inline paint stay aligned"
deferred:
  - truth: "PDF-01 backend-rendered multilingual invoice PDF"
    addressed_in: "Phase 5"
    evidence: "REQUIREMENTS.md traceability PDF-01 | Phase 5 | Pending. ROADMAP Phase 5 owns generation."
  - truth: "OFFL-01 offline IndexedDB/SQLite sync"
    addressed_in: "Phase 5"
    evidence: "REQUIREMENTS.md OFFL-01 | Phase 5 | Pending."
  - truth: "AUDT-01 persisted audit_logs for tax decisions"
    addressed_in: "Phase 5"
    evidence: "REQUIREMENTS.md AUDT-01 | Phase 5 | Pending."
  - truth: "PdfPaper renders a live invoice instead of SAMPLE_INVOICE"
    addressed_in: "Phase 5"
    evidence: "Phase 4 D-09 restyles the stage only; real PDF generation is PDF-01."
behavior_unverified_items:
  - truth: "Splash wordmark Clared plus an observable spinner remains until CSS is applied and the min hold elapses (G-04-3, D-16)."
    test: "Cold-launch unsigned and signed; watch Splash for ~700ms (0 in test MODE) before LoginGate or shell."
    expected: "Clared + inline ring visible; then gate or AppShell. Reduced-motion omits spin, still shows ring."
    why_human: "minSplashDone timer and boot vs hold race are not covered by theme.test.ts."
human_verification:
  - test: "Open in-scope screens in Light and Dark (Darstellung Hell then Dunkel) and compare to mockups/approved 02–09 as a restyle of the 5-item shell (D-11, D-13)."
    expected: "Rechnung, Entities/Kunden, Tax, PDF, Login, empty-state match Crafted density (whisper border-border/70, sage accent). No Übersicht/Banking/Senden. Screens 10–15 absent."
    why_human: "Pixel/craft match cannot be proven by class greps."
  - test: "Cold-launch with clared-theme cleared, OS Dark then OS Light; confirm splash then LoginGate/shell; no UA-white flash."
    expected: "First paint oatmeal or charcoal; Clared splash observable; Hell/Dunkel/System persist; chip is identity + Abmelden only."
    why_human: "Native menu and FOUC are runtime. Code has IIFE+applyTheme; live paint still human after G-04-2/3."
  - test: "OS reduced-motion on; press Anmelden / + Position; live OS theme change while Darstellung=System."
    expected: "No press scale. Theme class AND canvas hex follow OS."
    why_human: "Motion feel; OS-change paint bug is code-failed but still wants a visual confirm after fix."
---

# Phase 04: Premium UI & Brand Redesign Verification Report

**Phase Goal:** Clared gets a complete premium fintech redesign ("Crafted Minimal") — a new brand system (color, type, motion), new graphics via Higgsfield, and every page redesigned mockup-first including animations, loading/splash, and empty/error states

**Scope:** In-scope mockups 01–09 (D-12). Mockups 10–15 out (D-13). PDF/Audit/Offline Phase 5.

**Verified:** 2026-08-23T03:45:00Z
**Status:** gaps_found
**Re-verification:** Yes — after 04-04 gap closure (G-04-1/2/3). Previous file was `human_needed` 16/19 with no `gaps:` YAML.

## Goal Achievement

04-04 shipped picker ids, oatmeal/charcoal boot paint, and inline splash hold. That does **not** close the phase: empty CTA and login hero regress vs PLAN/UI-SPEC, and the OS `change` listener was not updated when paint moved to inline styles. 1:1 mockup craft remains human. SUMMARY.md was not treated as evidence.

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Crafted Minimal design system exists as SSOT and is approved | ✓ VERIFIED | Dual `:root` / `.dark` in `apps/desktop/src/styles/globals.css` and `packages/ui/src/styles/globals.css`: `#ffffff` / `#f7f7f5` / `#111110` / `#8a8a8a` / sage `#a8bfa3` / amber `#c9a227`, radius 8px, `--dur: 180ms`, `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`. `04-UI-SPEC.md` approved. |
| 2 | User-approved mockups exist for every in-scope page before code (UI-01) | ✓ VERIFIED | `mockups/approved/01-brandkit.png` … `09-empty-state.png`. Single `04-UI-SPEC.md`. 10–15 files exist; no routes. |
| 3 | In-scope surfaces rebuilt with empty / error / loading | ✓ VERIFIED | Token classes on shell + routes. Rechnung Skeleton/`ErrorState`/`InvoiceEmptyState`. Entities/Kunden loading-empty-error. Tax empty `—`. Login is the unsigned state. Boot Splash then ErrorState/LoginGate. |
| 4 | Higgsfield graphics generated and in `public/` | ✓ VERIFIED | Four 2688×1520 PNGs. Empty invoices/entities wired. `splash.png` present, unused (D-16 type-only). Login PNG orphaned — scored under truth 16. |
| 5 | Motion <300ms, custom ease-out, `prefers-reduced-motion`, splash | ✓ VERIFIED | `--dur` 180ms; `.btn-primary:active scale(0.97)` clamped in reduce media. Splash inline keyframes omitted when reduce matches. Feel still human. |
| 6 | One component tree; Light/Dark from tokens (D-08) | ✓ VERIFIED | Single `App.tsx` tree. Token file mirrored desktop + `packages/ui`, not two theme bundles. |
| 7 | Launch follows OS when no stored pref (D-06) | ✓ VERIFIED | `currentPref()` defaults `system`. `theme.test.ts` 11/11 including applyTheme html+body paint. `index.html` IIFE same PREFS + matchMedia. `main.tsx` `applyTheme(currentPref())` before `createRoot`. Live OS *change* is truth 24. |
| 8 | Darstellung Hell / Dunkel / System; chip has no theme item (D-07) | ✓ VERIFIED | `theme-menu.ts` submenu + CheckMenuItems. `session-chip.tsx` Abmelden only. |
| 9 | Money uses `.tabular-nums`, not a second webfont family (D-03) | ✓ VERIFIED | Utility in globals. Applied on line-item / tax / pdf amounts. `--font-serif` is system Palatino/Iowan, not a packaged webfont — see Anti-Patterns. |
| 10 | BRAND-01 in REQUIREMENTS Desktop & UI + Phase 4 row (D-05) | ✓ VERIFIED | Line 13 checked; traceability `BRAND-01 \| Phase 4 \| Complete`. |
| 11 | ROADMAP Phase 4 names only Crafted Minimal (D-01) | ✓ VERIFIED | `grep Nordic Calm .planning/ROADMAP.md` empty. Goal + SC #1 Crafted Minimal. |
| 12 | No webfont family in the token file (D-03) | ✓ VERIFIED | `--font-sans` system stack. No `@font-face`. No Inter. |
| 13 | Primary / + Position uses Sage and press scale (D-17) | ✓ VERIFIED | `btn-primary` + `bg-primary` / solid CTAs with `active:scale-[0.97]` and `motion-reduce:active:scale-100`. |
| 14 | Empty-state illustration + Beispielrechnung CTA; rail/Vorschau hidden | ✗ FAILED | Hero `/empty-state-hero.png`. `showRail = !showHero`. CTA is **Neue Rechnung** not **Beispielrechnung anzeigen**. |
| 15 | PDF stage follows theme; PdfPaper stays light (D-09) | ✓ VERIFIED | `pdf.tsx` `bg-background`. `pdf-paper.tsx` inline `#fff`/`#111`. |
| 16 | Login gate: Crafted hero + system wordmark Clared + bilingual (D-04, D-15) | ✗ FAILED | Bilingual DE/EN + Clared heading present. **No hero `<img>`**. `h1` is `font-serif`. `public/login-gate-hero.png` unused. |
| 17 | Invoice split canvas 1:1 to 02/03-rechnung | ? UNCERTAIN | Structure + tokens present. Pixel match is UAT. D-13 IA is 5-item shell, not mockup Übersicht/Banking. |
| 18 | Entities/Kunden 1:1 to 04/05-entities (D-12) | ? UNCERTAIN | list+panel, `empty-entities.png`, whisper `border-border/70`. Craft is human. |
| 19 | Login 1:1 to 08-login.png | ? UNCERTAIN | Card layout present; hero gap is truth 16. Remaining spacing/type is visual. |
| 20 | Splash inline + min hold until boot or 700ms (G-04-3) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `splash.tsx` inline Clared + ring. `App.tsx` `state === "boot" \|\| !minSplashDone`, `SPLASH_HOLD_MS` 700 / 0 in test. No test exercises the timer. |
| 21 | Invoice picker visible text is invoiceLabel; value is id (G-04-1) | ✓ VERIFIED | `invoiceLabel`; `Select value={draftId}`; `SelectItem value={row.id}` children `invoiceLabel(row, false)`. |
| 22 | ComboboxInput chevron/clear is a single control (G-04-1) | ✓ VERIFIED | `ComboboxClear` is `ComboboxPrimitive.Clear` + XIcon. `render={<InputGroupButton` absent. ChipRemove still uses Button (chips path, not Input addon). |
| 23 | 5-item shell, whisper separators, sage pills (D-11, D-13) | ✓ VERIFIED | `NAV_ITEMS` Rechnung · Entities · Kunden · Tax · PDF. `border-border/70`. `bg-primary/30` Entwurf pill. No extra routes. |
| 24 | OS color-scheme change while system re-paints D-02 hex | ✗ FAILED | `main.tsx` lines 10–16: `classList.toggle("dark")` only. `applyTheme` not called. Inline `background` from boot can stick. |

**Score:** 17/24 truths verified (1 present, behavior-unverified)

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | PDF-01 multilingual invoice PDF | Phase 5 | REQUIREMENTS + ROADMAP Phase 5 |
| 2 | OFFL-01 offline sync | Phase 5 | same |
| 3 | AUDT-01 audit_logs | Phase 5 | same |
| 4 | PdfPaper SAMPLE_INVOICE → live invoice | Phase 5 | D-09 restyle only |
| 5 | Mockups 10–15 | Out of milestone (D-13) | Prohibition, not a later-phase gap |

### Required Artifacts

`gsd-tools query verify.artifacts` returned `total: 0` (PLAN artifacts are path strings). Manual:

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `apps/desktop/index.html` | Boot IIFE D-02 paint | ✓ VERIFIED | `#clared-boot-paint` on html,body; PREFS; catch → matchMedia |
| `apps/desktop/src/lib/theme.ts` | applyTheme paint | ✓ VERIFIED | `PAINT_LIGHT`/`PAINT_DARK` on html+body |
| `apps/desktop/src/lib/theme.test.ts` | Paint tests | ✓ VERIFIED | 11/11 pass |
| `apps/desktop/src/lib/theme-menu.ts` | Darstellung | ✓ VERIFIED | Hell/Dunkel/System |
| `apps/desktop/src/components/splash.tsx` | Inline splash | ✓ VERIFIED | Clared + ring, reduce-motion |
| `apps/desktop/src/App.tsx` | Hold + 5-item nav | ✓ VERIFIED | SPLASH_HOLD_MS / NAV_ITEMS |
| `apps/desktop/src/main.tsx` | Pre-paint + OS listener | ⚠️ PARTIAL | applyTheme before root OK; change listener incomplete |
| `packages/ui/src/components/combobox.tsx` | Unnest Clear | ✓ VERIFIED | No InputGroupButton Clear |
| `apps/desktop/src/routes/rechnung.tsx` | Picker ids | ✓ VERIFIED | invoiceLabel + row.id |
| `apps/desktop/src/auth/login-gate.tsx` | Hero + gate | ✗ STUB-ish | Gate works; hero unwired |
| `apps/desktop/src/components/invoice-empty-state.tsx` | Empty copy | ⚠️ PARTIAL | Art wired; CTA wrong vs SPEC |
| `apps/desktop/public/login-gate-hero.png` | Login art | ⚠️ ORPHANED | File exists, no import |
| `.planning/REQUIREMENTS.md` | BRAND-01 + Phase 5 PDF/OFFL/AUDT | ✓ VERIFIED | Traceability rows Phase 5 |

### Key Link Verification

`verify.key-links` also `total: 0`. Manual:

| From | To | Via | Status | Details |
| ---- | --- | ---- | ------ | ------- |
| `index.html` IIFE | `theme.ts` paint | shared `#F7F7F5`/`#111110` + PREFS | ✓ WIRED | Semantics aligned at boot |
| `AuthenticatedApp` | `Splash` | boot OR !minSplashDone | ✓ WIRED | Hold present; duration untested |
| `rechnung` picker | `invoiceLabel` / `row.id` | Select | ✓ WIRED | G-04-1 |
| ComboboxClear | entities/kunden | shared primitive | ✓ WIRED | Callers inherit |
| `login-gate` | `login-gate-hero.png` | img src | ✗ NOT_WIRED | No img |
| `main.tsx` change | `applyTheme` | matchMedia | ✗ NOT_WIRED | class only |
| Surfaces | tokens | semantic classes | ✓ WIRED | `bg-background`, `border-border/70` |
| Reduced-motion | OS | CSS + splash matchMedia | ✓ WIRED | Independent of Darstellung |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| Theme class + inline paint | `.dark`, style.background | localStorage + matchMedia + applyTheme | Yes at boot | ✓ FLOWING |
| OS live change | same | matchMedia listener | Class yes, paint no | ✗ DISCONNECTED |
| Splash | boot / minSplashDone | session `/me` + timer | Yes | ✓ FLOWING |
| Rechnung / Entities / Kunden | API lists | Phase 3 fetches | Yes | ✓ FLOWING |
| Tax | taxDecision | tax-live-store | Yes | ✓ FLOWING |
| Empty / login art | img src | public PNG | Empty yes; login no | ⚠️ HOLLOW login |
| PdfPaper | invoice | SAMPLE_INVOICE | Sample | ⚠️ STATIC — Phase 5 |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| applyTheme html+body paint | `pnpm --filter desktop exec vitest run src/lib/theme.test.ts` | 11/11 pass | ✓ PASS |
| Boot hex + splash + picker + combobox + Phase 5 rows | python asserts from 04-04 PLAN | `python gates ok` | ✓ PASS |
| Forced-dark boot | `classList.add("dark")` in main.tsx | no match | ✓ PASS |
| Nordic name | `grep Nordic Calm ROADMAP.md` | no match | ✓ PASS |
| Combobox nested InputGroupButton | `render={<InputGroupButton` | no match | ✓ PASS |
| Login hero img | grep login-gate-hero in login-gate.tsx | no match | ✗ FAIL |
| Empty CTA | grep Beispielrechnung invoice-empty-state | no match (Neue Rechnung) | ✗ FAIL |
| OS change applyTheme | grep applyTheme in main.tsx change handler | not in listener | ✗ FAIL |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLANs do not declare probes | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| UI-01 | 04-01, 04-02, 04-03, 04-04 | Mockups / UI-SPEC before implementation | ✓ SATISFIED | Approved 01–09 + `04-UI-SPEC.md` exist before restyle. Visual 1:1 still human. Empty CTA diverges from SPEC (code gap, not missing spec). |
| BRAND-01 | 04-01 … 04-04 | Crafted Minimal tokens + mockup SSOT + motion | ? NEEDS HUMAN | Tokens, theme engine, motion utilities in code. 1:1 craft and splash observability need human. Login hero unwired weakens brand SSOT. |
| PDF-01 | none | Backend PDF | deferred | Plans did not claim it. REQUIREMENTS Phase 5. |
| OFFL-01 | none | Offline | deferred | Phase 5. |
| AUDT-01 | none | Audit logs | deferred | Phase 5. |

Orphan vs Phase 4 **plans**: PDF-01 / OFFL-01 / AUDT-01 not in any `requirements:` array — correct after 04-04 remapped the table. Not Phase 4 blockers.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `invoice-empty-state.tsx` | CTA | Copy vs UI-SPEC empty row | 🛑 Blocker | Must-have CTA missed |
| `login-gate.tsx` | — | Hero PNG unused; `bg-[#f7f7f5]` hex | 🛑 Blocker | 04-03 wiring gone; hex vs token prohibition |
| `login-gate.tsx` / entities / tax-rail / pdf-paper | headings / money | `font-serif` / `.money-display` | ⚠️ Warning | D-03 rejected brandkit serif for shipping app; not a webfont package |
| `main.tsx` | 10–16 | OS change without paint | 🛑 Blocker | Inline bg can desync from `.dark` |
| `globals.css` | `.dark --background: #0f1113` | Boot paint `#111110` vs token | ℹ️ Info | After CSS, dark canvas may shift vs G-04-2 hex |
| `splash.tsx` | — | `splash.png` unused | ℹ️ Info | D-16 type-only |
| `pdf-paper.tsx` | SAMPLE_INVOICE | hardcoded sample | ℹ️ Info | Phase 5 |

No `TBD` / `FIXME` / `XXX` in desktop `src` TS/TSX.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `apps/desktop/src/lib/theme.test.ts` | BRAND-01 | 11 | 0 | no | Value (classList, localStorage, painted background, color-scheme) | PASS for applyTheme; does **not** load `index.html` IIFE or `main.tsx` change listener |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** WARNING — live OS-change paint uncovered (now a FAILED truth, not only a test-quality note). Splash hold uncovered → PBU.

### Prohibitions

| Statement | Status | Evidence |
|-----------|--------|----------|
| must NOT ship two CSS bundles or duplicate Light/Dark trees (D-08) | held | One tree |
| must NOT add theme control to session chip (D-07) | held | identity + Abmelden |
| must NOT add nav items or routes (D-11) | held | five NAV_ITEMS |
| must NOT package a webfont (D-03) | held | no @font-face |
| must NOT let Darstellung win over OS reduced-motion (D-17) | held | motion media query |
| must NOT implement mockups 10–15 (D-13) | held | no routes |
| must NOT build custom titlebar (D-19) | held | `decorations: true` |
| must NOT invert PdfPaper (D-09) | held | inline light |
| must NOT generate illustrations at runtime (D-25) | held | static public PNGs |
| must NOT hard-code hex in restyled components | **breached** | login-gate `bg-[#f7f7f5]`; D-09 islands still allowed |

Judgment-tier; hex on login is a warning stacked on the hero gap.

### Decision Coverage

`gsd-tools query check.decision-coverage-verify`: **19/19 honored**, blocking false.

Heuristic miss: D-14 "wire login-gate hero into public **and** the gate" — file in public, component dropped the img. Treat as execution drift, not a second blocker beyond truth 16.

### Human Verification Required

Still required after gap *code* for G-04-2/3. Do not treat UAT as passed.

### 1. 1:1 mockup match (Light + Dark, 5-item shell)

**Test:** Sign in, walk Rechnung (empty + populated), Entities, Kunden, Tax, PDF, Login. Hell then Dunkel. Compare to `mockups/approved/02–09` as restyle of existing IA (D-13).
**Expected:** Crafted density, sage, oatmeal/charcoal. No mockup product IA (Übersicht/Banking/Senden).
**Why human:** Craft.

### 2. Cold launch FOUC + splash

**Test:** Clear `clared-theme`, relaunch OS Dark and OS Light.
**Expected:** No UA-white document. Clared + spinner, then gate/shell.
**Why human:** Webview paint order.

### 3. Reduced-motion + OS theme while System

**Test:** Reduce motion; press primary; flip OS appearance with Darstellung=System.
**Expected:** No scale; canvas hex follows OS (after truth 24 is fixed).

## Gaps Summary

**Three blocking gaps** after 04-04:

1. Empty CTA copy vs UI-SPEC / 04-04 must_have.
2. Login hero PNG orphaned; gate restyle incomplete vs 04-03.
3. `matchMedia` change does not call `applyTheme`, so G-04-2 inline paint can fight `.dark`.

G-04-1 picker/Combobox unnest is **closed in code**. G-04-2/3 **partially closed** (boot IIFE + splash hold exist; FOUC/splash still human; OS-change paint regresses the new paint model).

Visual 1:1 stays UNCERTAIN, not FAILED: D-13 forbids implementing mockup IA. After blockers, human re-runs 04-UAT 1–3.

---

_Verified: 2026-08-23T03:45:00Z_
_Verifier: Claude (gsd-verifier)_
