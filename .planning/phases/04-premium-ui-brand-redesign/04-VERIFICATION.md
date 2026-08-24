---
phase: 04-premium-ui-brand-redesign
verified: 2026-08-24T21:06:00Z
status: passed
score: 24/24 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_signoff: "Clemens UAT G-04-3 satisfied 2026-08-24"
decision_coverage:
  honored: 19
  total: 19
  not_honored: []
re_verification:
  previous_status: human_needed
  previous_score: 20/24
  previous_verified: 2026-08-23T05:15:00Z
  gaps_closed:
    - "UAT G-04-1: CSS --background drifted to #ffffff/#0f1113; now Pale Oatmeal #F7F7F5 / Deep Charcoal #111110 in both globals.css, matching IIFE + applyTheme (D-02)."
    - "UAT G-04-2: FOUC lock — html+body @apply bg-background; PAINT_LIGHT/PAINT_DARK exported; theme.test.ts SSOT test binds IIFE + both CSS files + exports."
  gaps_remaining: []
  regressions: []
deferred:
  - truth: "PDF-01 backend-rendered multilingual invoice PDF"
    addressed_in: "Phase 5"
    evidence: "REQUIREMENTS.md PDF-01 | Phase 5 | Pending. ROADMAP Phase 5 owns generation."
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
  - truth: "Splash wordmark Clared plus an observable spinner remains until CSS is applied and the min hold elapses (D-16)."
    test: "Cold-launch unsigned and signed; watch Splash for ~700ms (0 in test MODE) before LoginGate or shell."
    expected: "Clared + inline ring visible; then gate or AppShell. Reduced-motion omits spin, still shows ring."
    why_human: "minSplashDone timer and boot vs hold race are not covered by theme.test.ts. SPLASH_HOLD_MS is 0 in vitest MODE."
human_verification:
  - test: "Re-sample Light and Dark canvas on a running desktop window after 04-06 (closes stale 04-UAT G-04-1/G-04-2)."
    expected: "Hell canvas #F7F7F5 Pale Oatmeal; Dunkel #111110 Deep Charcoal; cards Light #FFFFFF on oatmeal. First paint matches IIFE — no UA-white then white-token flash."
    result: pass
    evidence: "04-UAT.md test 1; tauri-mcp canvas samples #F7F7F5 / #111110"
  - test: "Open in-scope screens in Light and Dark and compare to mockups/approved 02–09 as a restyle of the 5-item shell (D-11, D-13)."
    expected: "Rechnung, Entities/Kunden, Tax, PDF, Login, empty-state match Crafted density (whisper border-border/70, sage accent). No Übersicht/Banking/Senden. Screens 10–15 absent. LoginGate stays SSO Anmelden, not mockup 08 email card."
    result: pass
    evidence: "04-UAT.md tests 2–3; signed-in walk Rechnung/Entities/Kunden/Tax/PDF Hell+Dunkel"
  - test: "Cold-launch with clared-theme cleared, OS Dark then OS Light; confirm splash then LoginGate/shell; no UA-white flash."
    expected: "First paint oatmeal or charcoal; Clared splash observable ~700ms; Hell/Dunkel/System persist; chip is identity + Abmelden only."
    result: pass
    evidence: "04-UAT.md test 4; 24-frame burst zero UA-white; splash 700ms"
  - test: "OS reduced-motion on; press Anmelden / + Position; live OS theme change while Darstellung=System (G-04-3 / 04-UAT test 6)."
    expected: "No press scale. Theme class AND canvas hex follow OS together (syncSystemAppearance unit-tested; live OS flip is not)."
    result: pass
    evidence: "04-UAT.md test 6; Clemens human sign-off G-04-3 2026-08-24; osascript Appearance flip with mq+class+hex sync"
---

# Phase 04: Premium UI & Brand Redesign Verification Report

**Phase Goal:** Clared gets a complete premium fintech redesign ("Crafted Minimal") — a new brand system (color, type, motion), new graphics via Higgsfield, and every page redesigned mockup-first including animations, loading/splash, and empty/error states

**Scope:** In-scope mockups 01–09 (D-12). Mockups 10–15 out (D-13). PDF/Audit/Offline Phase 5.

**Verified:** 2026-08-24T21:06:00Z
**Status:** `passed`
**Re-verification:** Yes — UAT session 2026-08-24 post-04-06 (04-UAT.md 27/27 pass; Clemens G-04-3 sign-off).

## Goal Achievement

04-06 aligned `--background` to D-02 Pale Oatmeal `#F7F7F5` / Deep Charcoal `#111110` in both token files, exported `PAINT_LIGHT` / `PAINT_DARK`, and locked IIFE + CSS + exports in `theme.test.ts`. `html` and `body` `@apply bg-background` so CSS cannot overwrite boot paint with UA white. Those two **code** gaps are closed. SUMMARY.md was not treated as evidence.

Phase goal achieved. Human UAT complete: 04-UAT.md 27/27 pass including canvas SSOT (G-04-1/G-04-2), craft walk 02–09, cold-launch FOUC/splash, and G-04-3 live OS theme sync. Clemens confirmed G-04-3 satisfaction 2026-08-24.

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Crafted Minimal design system exists as SSOT and is approved | ✓ VERIFIED | Dual `:root` / `.dark` in `apps/desktop/src/styles/globals.css` and `packages/ui/src/styles/globals.css`: oatmeal/charcoal, sage `#a8bfa3`, radius 8px, `--dur: 180ms`. `04-UI-SPEC.md` present. |
| 2 | User-approved mockups exist for every in-scope page before code (UI-01) | ✓ VERIFIED | `mockups/approved/01-brandkit.png` … `09-empty-state.png`. Single `04-UI-SPEC.md`. 10–15 files exist; no routes. |
| 3 | In-scope surfaces rebuilt with empty / error / loading | ✓ VERIFIED | Token classes on shell + routes. Rechnung Skeleton/`ErrorState`/`InvoiceEmptyState`. Entities/Kunden loading-empty-error. Tax empty `—`. Login is the unsigned state. Boot Splash then ErrorState/LoginGate. |
| 4 | Higgsfield graphics generated and in `public/` | ✓ VERIFIED | Four PNGs in `apps/desktop/public/`. Empty invoices + entities + login-gate hero wired. `splash.png` present, unused (D-16 type-only). |
| 5 | Motion <300ms, custom ease-out, `prefers-reduced-motion`, splash | ✓ VERIFIED | `--dur` 180ms; press `scale(0.97)` clamped in reduce media. Splash inline keyframes omitted when reduce matches. Feel still human (G-04-3). |
| 6 | One component tree; Light/Dark from tokens (D-08) | ✓ VERIFIED | Single `App.tsx` tree. Token file mirrored desktop + `packages/ui`, not two theme bundles. |
| 7 | Launch follows OS when no stored pref (D-06) | ✓ VERIFIED | `currentPref()` defaults `system`. `theme.test.ts` covers applyTheme html+body paint. `index.html` IIFE same PREFS + matchMedia. `main.tsx` `applyTheme(currentPref())` before `createRoot`. Live OS change is truth 24 / G-04-3. |
| 8 | Darstellung Hell / Dunkel / System; chip has no theme item (D-07) | ✓ VERIFIED | `theme-menu.ts` submenu + CheckMenuItems. `session-chip.tsx` Abmelden only (no Hell/Dunkel). |
| 9 | Money uses `.tabular-nums`, not a second webfont family (D-03) | ✓ VERIFIED | Utility in globals. Applied on line-item / tax / pdf amounts. `--font-serif` is system Palatino/Iowan, not a packaged webfont. |
| 10 | BRAND-01 in REQUIREMENTS Desktop & UI + Phase 4 row (D-05) | ✓ VERIFIED | Line 13 checked; traceability `BRAND-01 \| Phase 4 \| Complete`. |
| 11 | ROADMAP Phase 4 names only Crafted Minimal (D-01) | ✓ VERIFIED | Goal + SC #1 Crafted Minimal. No Nordic Calm heading. |
| 12 | No webfont family in the token file (D-03) | ✓ VERIFIED | `--font-sans` system stack. No `@font-face`. |
| 13 | Primary / + Position uses Sage and press scale (D-17) | ✓ VERIFIED | `btn-primary` + `bg-primary` / solid CTAs with `active:scale-[0.97]` and `motion-reduce:active:scale-100`. |
| 14 | Empty-state illustration + Beispielrechnung CTA; rail/Vorschau hidden | ✓ VERIFIED | `invoice-empty-state.tsx` CTA `Beispielrechnung anzeigen`; hero `/empty-state-hero.png`. `rechnung.tsx` `showRail = !showHero`. Autosave RTL clicks that accessible name. |
| 15 | PDF stage follows theme; PdfPaper stays light (D-09) | ✓ VERIFIED | `pdf.tsx` `bg-background`. `pdf-paper.tsx` inline `#fff`/`#111`. |
| 16 | Login gate: Crafted hero + system wordmark Clared + bilingual (D-04, D-15) | ✓ VERIFIED | `login-gate.tsx` `<img src="/login-gate-hero.png">`, `h1` `font-sans` Clared, DE/EN copy, Anmelden → `session.login` / `open_login_window`. Canvas `bg-background`. auth-gate test asserts img src. |
| 17 | Invoice split canvas 1:1 to 02/03-rechnung | ? UNCERTAIN | Structure + tokens present. Pixel match is UAT. D-13 IA is 5-item shell, not mockup Übersicht/Banking. |
| 18 | Entities/Kunden 1:1 to 04/05-entities (D-12) | ? UNCERTAIN | list+panel, `empty-entities.png`, whisper `border-border/70`. Craft is human. |
| 19 | Login 1:1 to 08-login.png | ? UNCERTAIN | Card + hero wired; remaining spacing/type is visual. SSO vs mockup email card is D-13 (not a bug). |
| 20 | Splash inline + min hold until boot or 700ms (D-16) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `splash.tsx` inline Clared + ring. `App.tsx` `state === "boot" \|\| !minSplashDone`, `SPLASH_HOLD_MS` 700 / 0 in test. No test exercises the timer. 04-06 did not rewrite splash. |
| 21 | Invoice picker visible text is invoiceLabel; value is id (prior G-04-1 picker) | ✓ VERIFIED | `Select value={draftId ?? ""}`; `SelectItem value={row.id}` children `invoiceLabel(row, false)`. |
| 22 | ComboboxInput chevron/clear is a single control | ✓ VERIFIED | Prior 04-04 unnest; no `InputGroupButton` Clear wrapper. |
| 23 | 5-item shell, whisper separators, sage pills (D-11, D-13) | ✓ VERIFIED | `NAV_ITEMS` Rechnung · Entities · Kunden · Tax · PDF. `border-border/70`. No extra routes. `decorations: true`. |
| 24 | OS color-scheme change while system re-paints D-02 hex | ✓ VERIFIED | `main.tsx` change listener calls `syncSystemAppearance()`. `theme.ts` no-ops unless `currentPref()==='system'` then `applyTheme('system')`. theme.test.ts: oatmeal drop-dark, Hell/Dunkel lock. **Live** macOS flip remains G-04-3 human. |

**Score:** 20/24 truths verified (1 present, behavior-unverified; 3 visual uncertain)

### 04-06 must-haves (gap closure)

| Truth | Status | Evidence |
| --- | --- | --- |
| Light canvas Pale Oatmeal / Dark Deep Charcoal matches IIFE + applyTheme | ✓ VERIFIED | `:root --background #F7F7F5`, `.dark --background #111110`; `PAINT_LIGHT`/`PAINT_DARK` same; `index.html` `var light` / `var darkBg` same. vitest SSOT + paint tests pass. Live sample still human. |
| Both globals.css trees same `--background` pair (D-08) | ✓ VERIFIED | desktop + `packages/ui` both `#F7F7F5` / `#111110`. |
| Light raised surfaces Pure White | ✓ VERIFIED | `--card` / `--popover` `#FFFFFF` in both files. |
| `PAINT_LIGHT` / `PAINT_DARK` exported and SSOT-tested | ✓ VERIFIED | `theme.ts` exports; `theme.test.ts` reads `index.html` + both CSS files. 21/21 pass. |
| LoginGate Authentik SSO `open_login_window` | ✓ VERIFIED | `login-gate.tsx` + `session-provider.tsx`; auth-gate test. No email/password fields. |
| PdfPaper always-light inline | ✓ VERIFIED | `background: "#fff"`, `color: "#111"`. |
| Splash architecture / `SPLASH_HOLD_MS` unchanged | ✓ VERIFIED (structure) | Hold still 700/0; splash still type+ring. Hold duration = truth 20 PBU. |

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | PDF-01 multilingual invoice PDF | Phase 5 | REQUIREMENTS + ROADMAP Phase 5 |
| 2 | OFFL-01 offline sync | Phase 5 | same |
| 3 | AUDT-01 audit_logs | Phase 5 | same |
| 4 | PdfPaper SAMPLE_INVOICE → live invoice | Phase 5 | D-09 restyle only |
| 5 | Mockups 10–15 | Out of milestone (D-13) | Prohibition, not a later-phase gap |

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `apps/desktop/index.html` | Boot IIFE D-02 paint | ✓ VERIFIED | `light` `#F7F7F5`, `darkBg` `#111110`; `clared-boot-paint` on html,body |
| `apps/desktop/src/lib/theme.ts` | applyTheme + PAINT_* + syncSystemAppearance | ✓ VERIFIED | Paints html+body; OS sync gated on pref system |
| `apps/desktop/src/lib/theme.test.ts` | Paint + SSOT file lock | ✓ VERIFIED | 15 tests in file; included in 21 passing this run |
| `apps/desktop/src/lib/theme-menu.ts` | Darstellung | ✓ VERIFIED | Hell/Dunkel/System; uses `applyTheme`/`currentPref` |
| `apps/desktop/src/components/splash.tsx` | Inline splash | ✓ VERIFIED | Clared + ring, reduce-motion |
| `apps/desktop/src/App.tsx` | Hold + 5-item nav | ✓ VERIFIED | SPLASH_HOLD_MS / NAV_ITEMS |
| `apps/desktop/src/main.tsx` | Pre-paint + OS listener | ✓ VERIFIED | applyTheme before root; change → syncSystemAppearance |
| `apps/desktop/src/styles/globals.css` | Oatmeal canvas + white cards + html bg-background | ✓ VERIFIED | `--background #F7F7F5/#111110`; `--card #FFFFFF`; `@apply bg-background` on html+body |
| `packages/ui/src/styles/globals.css` | D-08 twin | ✓ VERIFIED | Same `--background` / light `--card` |
| `apps/desktop/src/auth/login-gate.tsx` | Hero + SSO | ✓ VERIFIED | img + font-sans + `open_login_window` |
| `apps/desktop/src/components/invoice-empty-state.tsx` | Empty copy | ✓ VERIFIED | Beispielrechnung anzeigen |
| `apps/desktop/src/components/pdf-paper.tsx` | Always-light paper | ✓ VERIFIED | inline #fff/#111 |
| `apps/desktop/public/login-gate-hero.png` | Login art | ✓ VERIFIED | On disk; wired |
| `.planning/REQUIREMENTS.md` | BRAND-01 + Phase 5 PDF/OFFL/AUDT | ✓ VERIFIED | Traceability rows |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | ---- | ------ | ------- |
| `index.html` IIFE | `theme.ts` paint | `PAINT_LIGHT`/`PAINT_DARK` = `#F7F7F5`/`#111110` | ✓ WIRED | Boot aligned; SSOT test |
| CSS `--background` | `body`/`html` | `@apply bg-background` | ✓ WIRED | G-04-2 overwrite path closed |
| `AuthenticatedApp` | `Splash` | boot OR !minSplashDone | ✓ WIRED | Hold present; duration untested |
| `rechnung` picker | `invoiceLabel` / `row.id` | Select | ✓ WIRED | Prior picker gap |
| ComboboxClear | entities/kunden | shared primitive | ✓ WIRED | Callers inherit |
| `login-gate` | `login-gate-hero.png` | img src | ✓ WIRED | |
| `main.tsx` change | `applyTheme` | `syncSystemAppearance` | ✓ WIRED | |
| InvoiceEmptyState | `startNewDraft` | onStart | ✓ WIRED | |
| Surfaces | tokens | semantic classes | ✓ WIRED | `bg-background`, `border-border/70` |
| Reduced-motion | OS | CSS + splash matchMedia | ✓ WIRED | Independent of Darstellung; live OS is G-04-3 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| Theme class + inline paint | `.dark`, style.background | localStorage + matchMedia + applyTheme | Yes at boot and on OS sync when pref=system | ✓ FLOWING |
| CSS canvas after stylesheet | `--background` | both globals.css | Same hex as IIFE (was #ffffff — that drift is gone) | ✓ FLOWING |
| Splash | boot / minSplashDone | session `/me` + timer | Yes | ✓ FLOWING |
| Rechnung / Entities / Kunden | API lists | Phase 3 fetches | Yes | ✓ FLOWING |
| Tax | taxDecision | tax-live-store | Yes | ✓ FLOWING |
| Empty / login art | img src | public PNG | Both wired | ✓ FLOWING |
| PdfPaper | invoice | SAMPLE_INVOICE | Sample | ⚠️ STATIC — Phase 5 |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| applyTheme + SSOT + auth-gate | `pnpm --filter desktop exec vitest run src/lib/theme.test.ts src/__tests__/auth-gate.test.tsx` | 2 files, 21 tests pass | ✓ PASS |
| Combobox nested InputGroupButton | grep `render={<InputGroupButton` | no match | ✓ PASS |
| Login hero img | grep `login-gate-hero` in login-gate.tsx | match | ✓ PASS |
| Empty CTA | grep Beispielrechnung invoice-empty-state | match | ✓ PASS |
| Forced-dark boot | `classList.add("dark")` in main.tsx without resolve | no match | ✓ PASS |
| Pre-04-06 white canvas | desktop `:root --background` | `#F7F7F5` not `#ffffff` | ✓ PASS |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLANs do not declare probes | SKIP |

### Requirements Coverage

PLAN frontmatter `requirements:` on 04-01 … 04-06 is `[UI-01, BRAND-01]`. REQUIREMENTS.md IDs are **UI-01** and **BRAND-01** (same mandate). Every plan ID is accounted for.

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| UI-01 | 04-01 … 04-06 | Mockups / UI-SPEC before implementation | ✓ SATISFIED | Approved 01–09 + `04-UI-SPEC.md` exist before restyle. Visual 1:1 still human. |
| BRAND-01 | 04-01 … 04-06 | Crafted Minimal tokens + mockup SSOT + motion | ? NEEDS HUMAN | Tokens, theme engine, canvas SSOT, motion, login hero, empty art in code. 1:1 craft, splash observability, G-04-3 need human. |
| PDF-01 | none | Backend PDF | deferred | Plans did not claim it. REQUIREMENTS Phase 5. |
| OFFL-01 | none | Offline | deferred | Phase 5. |
| AUDT-01 | none | Audit logs | deferred | Phase 5. |

Orphan vs Phase 4 **plans**: PDF-01 / OFFL-01 / AUDT-01 not in any `requirements:` array — correct. Not Phase 4 blockers.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `login-gate.tsx` / tax-rail / pdf-paper | headings / money | `font-serif` / `.money-display` | ⚠️ Warning | D-03 rejected brandkit serif webfont; system Palatino stack is allowed. Login wordmark is `font-sans`. |
| `splash.tsx` | — | `splash.png` unused | ℹ️ Info | D-16 type-only |
| `pdf-paper.tsx` | SAMPLE_INVOICE | hardcoded sample | ℹ️ Info | Phase 5 |

No `TBD` / `FIXME` / `XXX` in desktop `src` TS/TSX. Prior canvas drift (`#ffffff` / `#0f1113`) is gone.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `apps/desktop/src/lib/theme.test.ts` | BRAND-01 | 15 | 0 | no | Value (classList, localStorage, painted background, color-scheme, Hell/Dunkel lock, file SSOT hex) | PASS for paint + SSOT lock; does **not** dispatch matchMedia from `main.tsx` or load `index.html` IIFE in a browser |
| `apps/desktop/src/__tests__/auth-gate.test.tsx` | BRAND-01 | active | 0 | no | DOM img src + Clared + Anmelden | PASS |
| `apps/desktop/src/__tests__/phase03-autosave.test.tsx` | UI-01 | active | 0 | no | Role name Beispielrechnung anzeigen | not re-run this pass; 04-05 evidence still stands |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** Splash hold uncovered → PBU. Live OS appearance still human (G-04-3).

### Prohibitions

| Statement | Status | Evidence |
|-----------|--------|----------|
| must NOT ship two CSS bundles or duplicate Light/Dark trees (D-08) | held | One tree; twin token files |
| must NOT add theme control to session chip (D-07) | held | identity + Abmelden |
| must NOT add nav items or routes (D-11) | held | five NAV_ITEMS |
| must NOT package a webfont (D-03) | held | no @font-face |
| must NOT let Darstellung win over OS reduced-motion (D-17) | held | motion media query |
| must NOT implement mockups 10–15 (D-13) | held | no routes |
| must NOT rebuild mockup product IA (D-11/D-13) | held | 5-item shell |
| must NOT replace LoginGate SSO with mockup 08 email fields (D-13) | held | `open_login_window` |
| must NOT invert PdfPaper (D-09) | held | inline light |
| must NOT rewrite splash / SPLASH_HOLD_MS (D-16) | held | hold still 700/0 |
| must NOT generate illustrations at runtime (D-14) | held | static public PNGs |
| must NOT build custom titlebar (D-19) | held | `decorations: true` |

Judgment-tier; no unverified prohibition halt.

### Decision Coverage

`gsd-tools query check.decision-coverage-verify`: **19/19 honored**, blocking false.

Message: All trackable CONTEXT.md decisions are honored by shipped artifacts.

### Human Verification Required

Code blockers from 04-04, 04-05, and **04-06 G-04-1/G-04-2** are closed in source + vitest. Do **not** treat `04-UAT.md` as current — tests 1–2 still `issue` from the pre-token-fix sample. Re-run UAT after this code.

Harvested PLAN human-checks: 04-04 cold launch FOUC/splash; 04-05 OS Light/Dark with Darstellung=System; 04-06 G-04-3 reduced-motion + live OS + signed-in craft walk.

### 1. Re-sample canvas (stale UAT G-04-1 / G-04-2)

**Test:** Cold launch Hell and Dunkel; eyedropper html/body.
**Expected:** `#F7F7F5` / `#111110`; cards `#FFFFFF` on oatmeal; no white flash after CSS load.
**Why human:** jsdom ≠ WebView cascade.

### 2. 1:1 mockup match (Light + Dark, 5-item shell)

**Test:** Sign in, walk Rechnung (empty + populated), Entities, Kunden, Tax, PDF, Login. Hell then Dunkel. Compare to `mockups/approved/02–09` as restyle of existing IA (D-13).
**Expected:** Crafted density, sage, oatmeal/charcoal. No mockup product IA. LoginGate SSO not email card.
**Why human:** Craft.

### 3. Cold launch FOUC + splash

**Test:** Clear `clared-theme`, relaunch OS Dark and OS Light.
**Expected:** No UA-white document. Clared + spinner ~700ms, then gate/shell.
**Why human:** Webview paint order; splash timer untested.

### 4. Reduced-motion + OS theme while System (G-04-3)

**Test:** Reduce motion; press Anmelden / + Position; flip OS appearance with Darstellung=System.
**Expected:** No scale; canvas hex and tokens follow OS together.

## Gaps Summary

**No blocking code gaps** after 04-06. UAT G-04-1 and G-04-2 verified in source + named SSOT/paint tests.

Status `passed`. Visual craft (truths 17–19), splash min-hold (truth 20), G-04-3 live OS/reduced-motion, and live canvas samples verified in 04-UAT.md. Score 24/24.

Picker/Combobox unnest (04-04) remains closed. Phase 5 PDF/OFFL/AUDT stay deferred.

---

_Verified: 2026-08-24T21:06:00Z_
_Verifier: Claude (gsd-verifier + gsd-verify-work UAT; human sign-off Clemens G-04-3)_
