---
phase: 04-premium-ui-brand-redesign
verified: 2026-08-23T05:15:00Z
status: human_needed
score: 20/24 must-haves verified
behavior_unverified: 1
overrides_applied: 0
decision_coverage:
  honored: 19
  total: 19
  not_honored: []
re_verification:
  previous_status: gaps_found
  previous_score: 17/24
  gaps_closed:
    - "G-04-4 Empty CTA is Beispielrechnung anzeigen; empty-state-hero.png; showRail = !showHero"
    - "G-04-5 LoginGate img src /login-gate-hero.png; h1 Clared font-sans; bg-background"
    - "G-04-6 matchMedia change calls syncSystemAppearance → applyTheme('system') html+body paint"
  gaps_remaining: []
  regressions: []
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
    why_human: "minSplashDone timer and boot vs hold race are not covered by theme.test.ts. SPLASH_HOLD_MS is 0 in vitest MODE."
human_verification:
  - test: "Open in-scope screens in Light and Dark (Darstellung Hell then Dunkel) and compare to mockups/approved 02–09 as a restyle of the 5-item shell (D-11, D-13)."
    expected: "Rechnung, Entities/Kunden, Tax, PDF, Login, empty-state match Crafted density (whisper border-border/70, sage accent). No Übersicht/Banking/Senden. Screens 10–15 absent."
    why_human: "Pixel/craft match cannot be proven by class greps. Prior UAT still reported 1:1 miss vs aspirational mockup IA."
  - test: "Cold-launch with clared-theme cleared, OS Dark then OS Light; confirm splash then LoginGate/shell; no UA-white flash."
    expected: "First paint oatmeal or charcoal; Clared splash observable ~700ms; Hell/Dunkel/System persist; chip is identity + Abmelden only."
    why_human: "Native menu and FOUC are runtime. Code has IIFE+applyTheme+hold; live paint still human after G-04-2/3."
  - test: "OS reduced-motion on; press Anmelden / + Position; live OS theme change while Darstellung=System (04-UAT test 3)."
    expected: "No press scale. Theme class AND canvas hex follow OS together (syncSystemAppearance unit-tested; live OS flip is not)."
    why_human: "Motion feel and macOS appearance cannot be flipped in jsdom."
---

# Phase 04: Premium UI & Brand Redesign Verification Report

**Phase Goal:** Clared gets a complete premium fintech redesign ("Crafted Minimal") — a new brand system (color, type, motion), new graphics via Higgsfield, and every page redesigned mockup-first including animations, loading/splash, and empty/error states

**Scope:** In-scope mockups 01–09 (D-12). Mockups 10–15 out (D-13). PDF/Audit/Offline Phase 5.

**Verified:** 2026-08-23T05:15:00Z
**Status:** human_needed
**Re-verification:** Yes — after 04-05 gap closure (G-04-4/5/6). Previous file was `gaps_found` 17/24.

## Goal Achievement

04-05 wired empty CTA copy, LoginGate hero PNG + system sans wordmark, and OS `syncSystemAppearance` paint. Those three blockers are **closed in code** (vitest 21/21 on theme + auth-gate + autosave). Phase goal still needs human UAT: 1:1 craft vs approved 02–09, splash observability, live OS/reduced-motion. SUMMARY.md was not treated as evidence.

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Crafted Minimal design system exists as SSOT and is approved | ✓ VERIFIED | Dual `:root` / `.dark` in `apps/desktop/src/styles/globals.css` and `packages/ui/src/styles/globals.css`: oatmeal/charcoal, sage `#a8bfa3`, radius 8px, `--dur: 180ms`, `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`. `04-UI-SPEC.md` approved. |
| 2 | User-approved mockups exist for every in-scope page before code (UI-01) | ✓ VERIFIED | `mockups/approved/01-brandkit.png` … `09-empty-state.png`. Single `04-UI-SPEC.md`. 10–15 files exist; no routes. |
| 3 | In-scope surfaces rebuilt with empty / error / loading | ✓ VERIFIED | Token classes on shell + routes. Rechnung Skeleton/`ErrorState`/`InvoiceEmptyState`. Entities/Kunden loading-empty-error. Tax empty `—`. Login is the unsigned state. Boot Splash then ErrorState/LoginGate. |
| 4 | Higgsfield graphics generated and in `public/` | ✓ VERIFIED | Four PNGs in `apps/desktop/public/`. Empty invoices + entities + login-gate hero wired. `splash.png` present, unused (D-16 type-only). |
| 5 | Motion <300ms, custom ease-out, `prefers-reduced-motion`, splash | ✓ VERIFIED | `--dur` 180ms; press `scale(0.97)` clamped in reduce media. Splash inline keyframes omitted when reduce matches. Feel still human. |
| 6 | One component tree; Light/Dark from tokens (D-08) | ✓ VERIFIED | Single `App.tsx` tree. Token file mirrored desktop + `packages/ui`, not two theme bundles. |
| 7 | Launch follows OS when no stored pref (D-06) | ✓ VERIFIED | `currentPref()` defaults `system`. `theme.test.ts` covers applyTheme html+body paint. `index.html` IIFE same PREFS + matchMedia. `main.tsx` `applyTheme(currentPref())` before `createRoot`. Live OS change is truth 24. |
| 8 | Darstellung Hell / Dunkel / System; chip has no theme item (D-07) | ✓ VERIFIED | `theme-menu.ts` submenu + CheckMenuItems. `session-chip.tsx` Abmelden only. |
| 9 | Money uses `.tabular-nums`, not a second webfont family (D-03) | ✓ VERIFIED | Utility in globals. Applied on line-item / tax / pdf amounts. `--font-serif` is system Palatino/Iowan, not a packaged webfont. |
| 10 | BRAND-01 in REQUIREMENTS Desktop & UI + Phase 4 row (D-05) | ✓ VERIFIED | Line 13 checked; traceability `BRAND-01 \| Phase 4 \| Complete`. |
| 11 | ROADMAP Phase 4 names only Crafted Minimal (D-01) | ✓ VERIFIED | `grep Nordic Calm .planning/ROADMAP.md` empty. Goal + SC #1 Crafted Minimal. |
| 12 | No webfont family in the token file (D-03) | ✓ VERIFIED | `--font-sans` system stack. No `@font-face`. No Inter. |
| 13 | Primary / + Position uses Sage and press scale (D-17) | ✓ VERIFIED | `btn-primary` + `bg-primary` / solid CTAs with `active:scale-[0.97]` and `motion-reduce:active:scale-100`. |
| 14 | Empty-state illustration + Beispielrechnung CTA; rail/Vorschau hidden | ✓ VERIFIED | `invoice-empty-state.tsx` CTA `Beispielrechnung anzeigen`; hero `/empty-state-hero.png`. `rechnung.tsx` `showRail = !showHero`. Autosave RTL clicks that accessible name. |
| 15 | PDF stage follows theme; PdfPaper stays light (D-09) | ✓ VERIFIED | `pdf.tsx` `bg-background`. `pdf-paper.tsx` inline `#fff`/`#111`. |
| 16 | Login gate: Crafted hero + system wordmark Clared + bilingual (D-04, D-15) | ✓ VERIFIED | `login-gate.tsx` `<img src="/login-gate-hero.png">`, `h1` `font-sans` Clared, DE/EN copy, Anmelden → `session.login` / `open_login_window`. Canvas `bg-background`. auth-gate test asserts img src. |
| 17 | Invoice split canvas 1:1 to 02/03-rechnung | ? UNCERTAIN | Structure + tokens present. Pixel match is UAT. D-13 IA is 5-item shell, not mockup Übersicht/Banking. Prior UAT still `issue`. |
| 18 | Entities/Kunden 1:1 to 04/05-entities (D-12) | ? UNCERTAIN | list+panel, `empty-entities.png`, whisper `border-border/70`. Craft is human. |
| 19 | Login 1:1 to 08-login.png | ? UNCERTAIN | Card + hero now wired; remaining spacing/type is visual. |
| 20 | Splash inline + min hold until boot or 700ms (G-04-3) | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `splash.tsx` inline Clared + ring. `App.tsx` `state === "boot" \|\| !minSplashDone`, `SPLASH_HOLD_MS` 700 / 0 in test. No test exercises the timer. 04-05 prohibition: do not rewrite splash. |
| 21 | Invoice picker visible text is invoiceLabel; value is id (G-04-1) | ✓ VERIFIED | `Select value={draftId ?? ""}`; `SelectItem value={row.id}` children `invoiceLabel(row, false)`. |
| 22 | ComboboxInput chevron/clear is a single control (G-04-1) | ✓ VERIFIED | `ComboboxClear` is `ComboboxPrimitive.Clear`. `render={<InputGroupButton` absent. |
| 23 | 5-item shell, whisper separators, sage pills (D-11, D-13) | ✓ VERIFIED | `NAV_ITEMS` Rechnung · Entities · Kunden · Tax · PDF. `border-border/70`. `bg-primary/30` Entwurf pill. No extra routes. |
| 24 | OS color-scheme change while system re-paints D-02 hex | ✓ VERIFIED | `main.tsx` change listener calls `syncSystemAppearance()`. `theme.ts` no-ops unless `currentPref()==='system'` then `applyTheme('system')`. theme.test.ts: oatmeal drop-dark, Hell/Dunkel lock. Live macOS flip still human (04-UAT 3). |

**Score:** 20/24 truths verified (1 present, behavior-unverified)

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | PDF-01 multilingual invoice PDF | Phase 5 | REQUIREMENTS + ROADMAP Phase 5 |
| 2 | OFFL-01 offline sync | Phase 5 | same |
| 3 | AUDT-01 audit_logs | Phase 5 | same |
| 4 | PdfPaper SAMPLE_INVOICE → live invoice | Phase 5 | D-09 restyle only |
| 5 | Mockups 10–15 | Out of milestone (D-13) | Prohibition, not a later-phase gap |

### Required Artifacts

`gsd-tools query verify.artifacts` not used as source of truth (PLAN artifacts are path strings). Manual:

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `apps/desktop/index.html` | Boot IIFE D-02 paint | ✓ VERIFIED | `#clared-boot-paint` on html,body; PREFS; `#F7F7F5` / `#111110` |
| `apps/desktop/src/lib/theme.ts` | applyTheme + syncSystemAppearance | ✓ VERIFIED | Paint html+body; OS sync gated on pref system |
| `apps/desktop/src/lib/theme.test.ts` | Paint + OS-lock tests | ✓ VERIFIED | Included in 21 passing tests this run |
| `apps/desktop/src/lib/theme-menu.ts` | Darstellung | ✓ VERIFIED | Hell/Dunkel/System |
| `apps/desktop/src/components/splash.tsx` | Inline splash | ✓ VERIFIED | Clared + ring, reduce-motion |
| `apps/desktop/src/App.tsx` | Hold + 5-item nav | ✓ VERIFIED | SPLASH_HOLD_MS / NAV_ITEMS |
| `apps/desktop/src/main.tsx` | Pre-paint + OS listener | ✓ VERIFIED | applyTheme before root; change → syncSystemAppearance |
| `packages/ui/src/components/combobox.tsx` | Unnest Clear | ✓ VERIFIED | No InputGroupButton Clear |
| `apps/desktop/src/routes/rechnung.tsx` | Picker ids + hide rail | ✓ VERIFIED | invoiceLabel + row.id; showRail = !showHero |
| `apps/desktop/src/auth/login-gate.tsx` | Hero + gate | ✓ VERIFIED | img + font-sans + bilingual |
| `apps/desktop/src/components/invoice-empty-state.tsx` | Empty copy | ✓ VERIFIED | Beispielrechnung anzeigen |
| `apps/desktop/public/login-gate-hero.png` | Login art | ✓ VERIFIED | File on disk; wired in LoginGate |
| `.planning/REQUIREMENTS.md` | BRAND-01 + Phase 5 PDF/OFFL/AUDT | ✓ VERIFIED | Traceability rows |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | ---- | ------ | ------- |
| `index.html` IIFE | `theme.ts` paint | shared `#F7F7F5`/`#111110` + PREFS | ✓ WIRED | Boot aligned |
| `AuthenticatedApp` | `Splash` | boot OR !minSplashDone | ✓ WIRED | Hold present; duration untested |
| `rechnung` picker | `invoiceLabel` / `row.id` | Select | ✓ WIRED | G-04-1 |
| ComboboxClear | entities/kunden | shared primitive | ✓ WIRED | Callers inherit |
| `login-gate` | `login-gate-hero.png` | img src | ✓ WIRED | G-04-5 |
| `main.tsx` change | `applyTheme` | `syncSystemAppearance` | ✓ WIRED | G-04-6 |
| InvoiceEmptyState | `startNewDraft` | onStart | ✓ WIRED | CTA copy restored; handler unchanged |
| Surfaces | tokens | semantic classes | ✓ WIRED | `bg-background`, `border-border/70` |
| Reduced-motion | OS | CSS + splash matchMedia | ✓ WIRED | Independent of Darstellung |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| Theme class + inline paint | `.dark`, style.background | localStorage + matchMedia + applyTheme | Yes at boot and on OS sync when pref=system | ✓ FLOWING |
| OS live change | same | matchMedia → syncSystemAppearance | Unit-tested function; live OS is UAT | ✓ FLOWING |
| Splash | boot / minSplashDone | session `/me` + timer | Yes | ✓ FLOWING |
| Rechnung / Entities / Kunden | API lists | Phase 3 fetches | Yes | ✓ FLOWING |
| Tax | taxDecision | tax-live-store | Yes | ✓ FLOWING |
| Empty / login art | img src | public PNG | Both wired | ✓ FLOWING |
| PdfPaper | invoice | SAMPLE_INVOICE | Sample | ⚠️ STATIC — Phase 5 |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| applyTheme + syncSystemAppearance | `pnpm --filter desktop exec vitest run src/lib/theme.test.ts src/__tests__/auth-gate.test.tsx src/__tests__/phase03-autosave.test.tsx` | 3 files, 21 tests pass | ✓ PASS |
| Nordic name | `grep Nordic Calm ROADMAP.md` | no match | ✓ PASS |
| Combobox nested InputGroupButton | `render={<InputGroupButton` | no match | ✓ PASS |
| Login hero img | grep `login-gate-hero` in login-gate.tsx | match line 51 | ✓ PASS |
| Empty CTA | grep Beispielrechnung invoice-empty-state | match line 29 | ✓ PASS |
| OS change applyTheme | main.tsx listener `syncSystemAppearance` | present | ✓ PASS |
| Forced-dark boot | `classList.add("dark")` in main.tsx | no match | ✓ PASS |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLANs do not declare probes | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| UI-01 | 04-01 … 04-05 | Mockups / UI-SPEC before implementation | ✓ SATISFIED | Approved 01–09 + `04-UI-SPEC.md` exist before restyle. Visual 1:1 still human. Empty CTA now matches SPEC. |
| BRAND-01 | 04-01 … 04-05 | Crafted Minimal tokens + mockup SSOT + motion | ? NEEDS HUMAN | Tokens, theme engine, motion, login hero, empty art in code. 1:1 craft and splash observability need human. |
| PDF-01 | none | Backend PDF | deferred | Plans did not claim it. REQUIREMENTS Phase 5. |
| OFFL-01 | none | Offline | deferred | Phase 5. |
| AUDT-01 | none | Audit logs | deferred | Phase 5. |

Orphan vs Phase 4 **plans**: PDF-01 / OFFL-01 / AUDT-01 not in any `requirements:` array — correct. Not Phase 4 blockers.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `login-gate.tsx` / entities / tax-rail / pdf-paper | headings / money | `font-serif` / `.money-display` | ⚠️ Warning | D-03 rejected brandkit serif for shipping app; not a webfont package. Login wordmark is now `font-sans`. |
| `globals.css` | `.dark --background` | Boot paint `#111110` vs token canvas | ℹ️ Info | After CSS, dark canvas may shift vs G-04-2 hex |
| `splash.tsx` | — | `splash.png` unused | ℹ️ Info | D-16 type-only |
| `pdf-paper.tsx` | SAMPLE_INVOICE | hardcoded sample | ℹ️ Info | Phase 5 |

No `TBD` / `FIXME` / `XXX` in desktop `src` TS/TSX. Prior blockers (wrong CTA, orphaned hero, class-only OS listener, login hex `bg-[#f7f7f5]`) are gone.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `apps/desktop/src/lib/theme.test.ts` | BRAND-01 | includes applyTheme + syncSystemAppearance | 0 | no | Value (classList, localStorage, painted background, color-scheme, Hell/Dunkel lock) | PASS for paint + OS-pref lock; does **not** dispatch matchMedia from `main.tsx` or load `index.html` IIFE |
| `apps/desktop/src/__tests__/auth-gate.test.tsx` | BRAND-01 | active | 0 | no | DOM img src + Clared + Anmelden | PASS for G-04-5 |
| `apps/desktop/src/__tests__/phase03-autosave.test.tsx` | UI-01 | active | 0 | no | Role name Beispielrechnung anzeigen | PASS for G-04-4 |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** Splash hold uncovered → PBU. Live OS appearance still human (coverage D4 in 04-05-SUMMARY).

### Prohibitions

| Statement | Status | Evidence |
|-----------|--------|----------|
| must NOT ship two CSS bundles or duplicate Light/Dark trees (D-08) | held | One tree |
| must NOT add theme control to session chip (D-07) | held | identity + Abmelden |
| must NOT add nav items or routes (D-11) | held | five NAV_ITEMS |
| must NOT package a webfont (D-03) | held | no @font-face |
| must NOT let Darstellung win over OS reduced-motion (D-17) | held | motion media query |
| must NOT implement mockups 10–15 (D-13) | held | no routes |
| must NOT rebuild mockup product IA to chase 1:1 (D-11/D-13) | held | 5-item shell; craft is UAT |
| must NOT build custom titlebar (D-19) | held | `decorations: true` (prior evidence) |
| must NOT invert PdfPaper (D-09) | held | inline light |
| must NOT generate illustrations at runtime (D-25) | held | static public PNGs; 04-05 reused login PNG |
| must NOT rewrite splash / SPLASH_HOLD_MS | held | hold still 700/0 |
| must NOT hard-code hex in restyled components | held on login | login-gate uses `bg-background`; D-09 islands still allowed |

Judgment-tier; no unverified prohibition halt.

### Decision Coverage

`gsd-tools query check.decision-coverage-verify`: **19/19 honored**, blocking false.

Message: All trackable CONTEXT.md decisions are honored by shipped artifacts.

### Human Verification Required

Code blockers from 04-04 are closed. Do **not** treat 04-UAT as passed — tests 1–3 were still `issue` in `04-UAT.md` (last updated before 04-05). Re-run after this code.

Harvested PLAN human-checks: 04-04 cold launch FOUC/splash; 04-05 OS Light/Dark with Darstellung=System.

### 1. 1:1 mockup match (Light + Dark, 5-item shell)

**Test:** Sign in, walk Rechnung (empty + populated), Entities, Kunden, Tax, PDF, Login. Hell then Dunkel. Compare to `mockups/approved/02–09` as restyle of existing IA (D-13).
**Expected:** Crafted density, sage, oatmeal/charcoal. No mockup product IA (Übersicht/Banking/Senden).
**Why human:** Craft. Prior user report: UI does not look like mockups.

### 2. Cold launch FOUC + splash

**Test:** Clear `clared-theme`, relaunch OS Dark and OS Light.
**Expected:** No UA-white document. Clared + spinner ~700ms, then gate/shell.
**Why human:** Webview paint order; splash timer untested.

### 3. Reduced-motion + OS theme while System

**Test:** Reduce motion; press primary; flip OS appearance with Darstellung=System.
**Expected:** No scale; canvas hex and tokens follow OS together.

## Gaps Summary

**No blocking code gaps** after 04-05. G-04-4/5/6 verified in source + named tests.

Status is `human_needed` because visual 1:1 (truths 17–19), splash min-hold (truth 20 PBU), and harvested UAT items remain. Score 20/24 does not certify craft.

G-04-1 picker/Combobox unnest remains closed (regression check). Phase 5 PDF/OFFL/AUDT stay deferred.

---

_Verified: 2026-08-23T05:15:00Z_
_Verifier: Claude (gsd-verifier)_
