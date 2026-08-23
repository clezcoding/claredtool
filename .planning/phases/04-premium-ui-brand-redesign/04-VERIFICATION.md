---
phase: 04-premium-ui-brand-redesign
verified: 2026-08-23T01:38:00Z
status: human_needed
score: 16/19 must-haves verified
behavior_unverified: 0
overrides_applied: 0
decision_coverage:
  honored: 19
  total: 19
  not_honored: []
deferred:
  - truth: "PDF-01 backend-rendered multilingual invoice PDF"
    addressed_in: "Phase 5"
    evidence: "ROADMAP Phase 5 requirements PDF-01 and success criteria: generate, download, and view a multilingual invoice PDF. REQUIREMENTS.md traceability still lists PDF-01 → Phase 4 (stale row)."
  - truth: "OFFL-01 offline IndexedDB/SQLite sync"
    addressed_in: "Phase 5"
    evidence: "ROADMAP Phase 5 requirements OFFL-01 and success criteria: open recently used data offline and sync when the connection returns."
  - truth: "AUDT-01 persisted audit_logs for tax decisions"
    addressed_in: "Phase 5"
    evidence: "ROADMAP Phase 5 requirements AUDT-01 and success criteria: each tax evaluation leaves a persisted audit_logs row."
  - truth: "PdfPaper renders a live invoice instead of SAMPLE_INVOICE"
    addressed_in: "Phase 5"
    evidence: "Phase 4 D-09 restyles the stage only; real PDF generation is PDF-01 in Phase 5."
human_verification:
  - test: "Open in-scope screens in Light and Dark (Darstellung Hell then Dunkel) and compare to mockups/approved 02–09."
    expected: "Rechnung split canvas, Entities/Kunden list+panel, Tax dl, PDF stage, Login gate, and empty-state match Crafted Minimal 1:1 (spacing, density, sage accent, whisper separators). Out-of-scope 10–15 are absent."
    why_human: "Pixel/craft match cannot be proven by class greps. PLAN truths explicitly require 1:1 to approved mockups."
  - test: "Cold-launch with no clared-theme in localStorage; then toggle Darstellung Hell / Dunkel / System."
    expected: "First paint follows OS with no FOUC. Menu checks the active pref. Selecting a mode persists and swaps .dark live. Session chip stays identity + Abmelden only."
    why_human: "Native Tauri menu and FOUC are runtime/visual; unit tests cover applyTheme/currentPref, not the installed app menu."
  - test: "Enable OS prefers-reduced-motion and press + Position / Anmelden; launch while /me is warming."
    expected: "Press scale is disabled; transitions clamp. Splash shows wordmark Clared + spinner, then shell or LoginGate."
    why_human: "Motion feel and splash duration are visual/runtime."
---

# Phase 04: Premium UI & Brand Redesign Verification Report

**Phase Goal:** Clared gets a complete premium fintech redesign ("Crafted Minimal") — a new brand system (color, type, motion), new graphics via Higgsfield, and every page redesigned mockup-first including animations, loading/splash, and empty/error states

**Scope:** In-scope mockups 01–09 only (D-13). Mockups 10–15 and PDF/Audit/Offline are out of this phase.

**Verified:** 2026-08-23T01:38:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

Code delivers the Crafted Minimal token system, OS-follow theme engine, in-scope restyles, and first-party art. Goal is **not** closed until a human confirms Light+Dark 1:1 against approved mockups. SUMMARY.md claims were not treated as evidence.

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | A Crafted Minimal design system (color, type, spacing, depth, radius, motion) exists as SSOT and is approved | ✓ VERIFIED | `apps/desktop/src/styles/globals.css` and `packages/ui/src/styles/globals.css` split `:root` / `.dark` with Pure White `#ffffff`, Oatmeal `#f7f7f5`, Charcoal `#111110`, Stone `#8a8a8a`, Sage `#a8bfa3`, Amber `#c9a227`, radius 8px, `--dur: 180ms`, `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`. `04-UI-SPEC.md` `status: approved`. |
| 2 | User-approved image mockups exist for every in-scope page before it is coded | ✓ VERIFIED | `mockups/approved/01-brandkit.png` … `09-empty-state.png` present. Single `04-UI-SPEC.md` covers design system, copy, empty/loading/error. Out-of-scope 10–15 exist as files only — no routes. |
| 3 | All existing in-scope surfaces (shell, Rechnung, Entities, Kunden, Tax, PDF, Login/Session) are rebuilt in the new system, each with empty / error / loading states | ✓ VERIFIED | Token classes (`bg-background`, `bg-card`, `border-border`, `bg-accent`) on `App.tsx` and routes. Rechnung: Skeleton + `ErrorState` + `InvoiceEmptyState`. Entities/Kunden: loading→empty→error + `/empty-entities.png`. Tax: live `—` empty + `TAX_ERROR_COPY`. PDF: theme-following stage (no CRUD fetch; empty/error for real PDF is Phase 5). Login: gate itself. Boot: `Splash` then `ErrorState`/`LoginGate`. |
| 4 | New graphics (hero art, illustrations, empty-state art) are generated via Higgsfield CLI and wired in | ✓ VERIFIED | `apps/desktop/public/{login-gate-hero,empty-state-hero,empty-entities,splash}.png` are real 2688×1520 PNGs (4.7–6.7 MB). Wired: `login-gate.tsx` `/login-gate-hero.png`, `invoice-empty-state.tsx` `/empty-state-hero.png`, entities/kunden `/empty-entities.png`. `splash.png` is in `public/` per D-16 (typography splash does not reference it). Higgsfield leftover 3/10 credits is SUMMARY-reported, not re-queried. |
| 5 | Motion is implemented per interface-design rules (durations under 300ms, custom ease-out, `prefers-reduced-motion` respected), including a loading/splash experience | ✓ VERIFIED | `--dur: 180ms` + `--ease-out`; `.btn-primary:active { transform: scale(0.97) }`; `@media (prefers-reduced-motion: reduce)` clamps duration and disables press scale. `spinner.tsx` gates `animate-spin` on `prefers-reduced-motion`. `splash.tsx` wordmark + `Spinner`; `App.tsx` mounts it while `state === "boot"`. Feel still needs human check. |
| 6 | One component tree; Light and Dark from `:root` / `.dark`; no duplicate Light/Dark components or second CSS bundle (D-08) | ✓ VERIFIED | Single `App.tsx` tree. Two *copies* of the same token file (desktop + `packages/ui`) — existing mirror, not two theme bundles. No `RechnungLight`/`RechnungDark` split. |
| 7 | On launch, appearance follows the OS when no stored pref; resolve via `matchMedia('(prefers-color-scheme: dark)')` (D-06) | ✓ VERIFIED | `theme.test.ts` 8/8 green: `resolveDark("system")` follows mocked matchMedia; `currentPref()` defaults to `"system"` on empty/unknown. `main.tsx` calls `applyTheme(currentPref())` **before** `ReactDOM.createRoot`. Change listener re-toggles only when `currentPref() === "system"`. |
| 8 | Native Darstellung menu offers Hell / Dunkel / System; selecting one persists and re-resolves `.dark`; session chip gains no theme item (D-07) | ✓ VERIFIED | `theme-menu.ts`: Submenu `"Darstellung"`, CheckMenuItems `"Hell"`/`"Dunkel"`/`"System"`, `applyTheme(id)` + `setAsAppMenu()`. `main.tsx` `installThemeMenu()`. `session-chip.tsx`: identity + `Abmelden` only — no Darstellung/theme item. Live native menu is human. |
| 9 | Money numerals use `font-variant-numeric: tabular-nums` via a utility, not a second font family (D-03) | ✓ VERIFIED | `.tabular-nums` in both globals.css. Applied on `line-item-card.tsx` einzelpreis/netto, `tax-rail.tsx` / `tax.tsx` `invoice_tax_rate`, `pdf-paper.tsx` amounts, entities/kunden vatId. |
| 10 | BRAND-01 exists under Desktop & UI and in the traceability table mapped to Phase 4 (D-05) | ✓ VERIFIED | `.planning/REQUIREMENTS.md` line 13 Desktop & UI; traceability row `BRAND-01 \| Phase 4 \| Complete`. |
| 11 | ROADMAP Phase 4 heading AND Success Criteria name only Crafted Minimal — "Nordic Calm Fintech" is gone (D-01) | ✓ VERIFIED | `grep Nordic Calm .planning/ROADMAP.md` = 0. Phase 4 Goal + SC #1 say Crafted Minimal. |
| 12 | Typography is the system font stack only; no webfont family in the token file (D-03) | ✓ VERIFIED | `--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`. `grep Inter` on desktop globals.css = 0. No `@font-face`. |
| 13 | Primary / "+ Position" uses Sage `bg-primary` and `scale(0.97)` on press (D-17) | ✓ VERIFIED | `rechnung.tsx` "+ Position": `btn-primary` + `bg-primary` + `active:scale-[0.97]` + `motion-reduce:active:scale-100`. Same pattern on login CTA, entities/kunden submit, error retry. |
| 14 | Invoice empty-state renders illustration + documented empty copy; tax rail and Vorschau hide while empty | ✓ VERIFIED | `invoice-empty-state.tsx`: `/empty-state-hero.png`, heading "Noch keine Rechnung erstellt", CTA "Beispielrechnung anzeigen". `showRail = !showHero`; TaxRail and "PDF Vorschau" gated on `showRail`. Copy heading is singular vs UI-SPEC "Rechnungen" — see Anti-Patterns INFO. |
| 15 | PDF stage follows the app theme; PdfPaper content stays light (D-09) | ✓ VERIFIED | `pdf.tsx` stage `bg-background`. `pdf-paper.tsx` inline `background: "#fff"`, `color: "#111"`. `tax-rail.tsx` mini-preview `background: "#fff"`. No other component hex in `src/`. |
| 16 | Login gate restyle: Crafted hero, system-font wordmark "Clared", bilingual DE/EN (D-04, D-15) | ✓ VERIFIED | `login-gate.tsx`: `src="/login-gate-hero.png"`, `<h1>Clared</h1>` `font-sans`, "Willkommen zurück" + "Welcome back. Sign in to issue invoices." Sage CTA. Visual 1:1 to 08-login is truth 19. |
| 17 | Invoice split canvas restyled 1:1 to 02-rechnung-light / 03-rechnung-dark | ? UNCERTAIN | Token restyle and IA are present (truths 3, 13, 14). Pixel match to approved mockups is visual UAT. |
| 18 | Entities and Kunden restyled 1:1 to 04-entities-light / 05-entities-dark; Kunden reuses list+panel (D-12) | ? UNCERTAIN | Structure verified: list+panel, `border-border`, selected `bg-muted` + `aria-current`, Combobox, Card, empty/error/loading. Pixel match is visual UAT. |
| 19 | Login gate restyled 1:1 to 08-login.png | ? UNCERTAIN | Structure verified (truth 16). Pixel match is visual UAT. |

**Score:** 16/19 truths verified (0 present, behavior-unverified)

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | PDF-01 backend-rendered multilingual invoice PDF | Phase 5 | ROADMAP Phase 5 requirements + SC. REQUIREMENTS.md still maps PDF-01 → Phase 4 (stale). |
| 2 | OFFL-01 offline sync | Phase 5 | ROADMAP Phase 5 OFFL-01 |
| 3 | AUDT-01 tax audit_logs | Phase 5 | ROADMAP Phase 5 AUDT-01 |
| 4 | PdfPaper SAMPLE_INVOICE → live invoice | Phase 5 | D-09 restyle only; PDF-01 owns generation |
| 5 | Mockups 10–15 (onboarding/settings/profile/dashboard/catalog/export) | Out of milestone (D-13) | Explicit prohibition; not a later-phase gap |

### Required Artifacts

`gsd-tools query verify.artifacts` returned `total: 0` (PLAN `artifacts:` are string paths, not `{path, provides}` objects). Artifacts checked by file read/grep:

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `apps/desktop/src/lib/theme.ts` | Theme engine | ✓ VERIFIED | `THEME_KEY`, `ThemePref`, `resolveDark`, `applyTheme`, `currentPref` — 21 lines, not a stub |
| `apps/desktop/src/lib/theme.test.ts` | RED→GREEN theme tests | ✓ VERIFIED | 8 value-level tests; `vitest run src/lib/theme.test.ts` 8/8 pass |
| `apps/desktop/src/lib/theme-menu.ts` | Darstellung menu | ✓ VERIFIED | Hell/Dunkel/System + `setAsAppMenu`; Tauri-runtime guard |
| `apps/desktop/src/components/splash.tsx` | Launch splash | ✓ VERIFIED | "Clared" + `Spinner`; mounted from `App.tsx` boot |
| `apps/desktop/src/styles/globals.css` | Crafted tokens | ✓ VERIFIED | Separate `:root` / `.dark`; system font; motion; tabular-nums |
| `packages/ui/src/styles/globals.css` | Mirror tokens | ✓ VERIFIED | Same split and Sage/Amber values |
| `apps/desktop/src/routes/rechnung.tsx` | Invoice canvas restyle | ✓ VERIFIED | Tokens, `btn-primary`, autosave 600ms, `showHero`/`showRail` |
| `apps/desktop/src/routes/tax.tsx` | Tax screen restyle | ✓ VERIFIED | `dl` field list, tabular rate, error copy |
| `apps/desktop/src/routes/pdf.tsx` | PDF stage restyle | ✓ VERIFIED | `bg-background` |
| `apps/desktop/src/components/tax-rail.tsx` | Tax rail restyle | ✓ VERIFIED | tabular-nums; D-09 `#fff` mini-preview kept |
| `apps/desktop/src/components/line-item-card.tsx` | Money cells | ✓ VERIFIED | `tabular-nums` on einzelpreis/netto |
| `apps/desktop/src/components/pdf-paper.tsx` | D-09 guard | ✓ VERIFIED | Inline `#fff`/`#111`; optional tabular-nums |
| `apps/desktop/src/components/invoice-empty-state.tsx` | Empty invoices | ✓ VERIFIED | Hero + CTA "Beispielrechnung anzeigen" |
| `apps/desktop/src/routes/entities.tsx` | Entities restyle | ✓ VERIFIED | list+panel, whisper rows, three-way branch |
| `apps/desktop/src/routes/kunden.tsx` | Kunden restyle | ✓ VERIFIED | Mirrors entities structure (D-12) |
| `apps/desktop/src/auth/login-gate.tsx` | Login restyle | ✓ VERIFIED | Hero src, Clared, bilingual, Sage CTA |
| `apps/desktop/src/components/session-chip.tsx` | Identity + logout | ✓ VERIFIED | No theme item |
| `apps/desktop/src/components/session-banner.tsx` | Session banner | ✓ VERIFIED | `text-destructive` unauthorized |
| `apps/desktop/src/components/error-state.tsx` | UI-SPEC error | ✓ VERIFIED | Exact error copy + "Erneut versuchen" |
| `apps/desktop/public/login-gate-hero.png` | Crafted login hero | ✓ VERIFIED | PNG 2688×1520, 6.7 MB |
| `apps/desktop/public/empty-state-hero.png` | Empty invoices art | ✓ VERIFIED | PNG 2688×1520, 5.2 MB |
| `apps/desktop/public/empty-entities.png` | Empty entities art | ✓ VERIFIED | PNG 2688×1520, 4.8 MB |
| `apps/desktop/public/splash.png` | Splash atmosphere | ✓ VERIFIED | File exists (D-16 optional; `splash.tsx` does not `<img>` it) |
| `.planning/REQUIREMENTS.md` | BRAND-01 | ✓ VERIFIED | Desktop & UI + Phase 4 row |
| `.planning/ROADMAP.md` | Crafted Minimal | ✓ VERIFIED | Phase 4 SC #1 retitled |

### Key Link Verification

`gsd-tools query verify.key-links` also returned `total: 0` (string-form `key_links`). Manual wiring:

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `main.tsx` | `theme.ts` | `applyTheme(currentPref())` before `ReactDOM.createRoot` | ✓ WIRED | Lines 8 then 18 — pre-paint, no `classList.add("dark")` |
| `theme-menu.ts` | `documentElement.dark` | `applyTheme(id)` → `classList.toggle("dark")` | ✓ WIRED | Menu action calls `applyTheme`; Tailwind `:root`/`.dark` cascade |
| `main.tsx` | OS color scheme | `matchMedia(...).addEventListener("change")` | ✓ WIRED | Guard `if (currentPref() === "system")` |
| Reduced-motion | OS, not color pref | `@media (prefers-reduced-motion)` + spinner matchMedia | ✓ WIRED | Independent of Darstellung (D-17) |
| Surfaces | Token cascade | semantic classes | ✓ WIRED | `bg-background`, `text-muted-foreground`, `bg-accent`, `text-destructive` |
| Rechnung | Phase 3 behavior | `AUTOSAVE_DELAY_MS = 600`, `showHero`/`showRail` | ✓ WIRED | Autosave timer and gating retained |
| `login-gate.tsx` | `public/login-gate-hero.png` | `<img src="/login-gate-hero.png">` | ✓ WIRED | Same path, file replaced |
| `entities.tsx` | `kunden.tsx` | copied list+panel restyle | ✓ WIRED | Shared Combobox/Card/`aria-current` pattern |
| Illustrations | first-party only | static `public/` | ✓ WIRED | No remote `https://` image loads (D-25) |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| Theme class | `.dark` on `<html>` | `localStorage[clared-theme]` + `matchMedia` | Yes | ✓ FLOWING |
| Splash | boot gate | `useSession().state === "boot"` | Yes (`/me` warming) | ✓ FLOWING |
| Rechnung / Entities / Kunden | lists, drafts | existing Phase 3 API fetches | Yes | ✓ FLOWING |
| Tax screen / rail | `taxDecision` | `tax-live-store` subscription | Yes (live eval) | ✓ FLOWING |
| Login hero / empty art | `<img src>` | first-party `public/*.png` | Yes (static files) | ✓ FLOWING |
| PdfPaper | `invoice` | `SAMPLE_INVOICE` constant | Sample only | ⚠️ STATIC — deferred to Phase 5 PDF-01 |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Theme engine four behaviors | `pnpm --filter desktop exec vitest run src/lib/theme.test.ts` | 8/8 pass, 771ms | ✓ PASS |
| Token split present | `grep ':root {' / '.dark {'` both globals.css | both present, not combined selector | ✓ PASS |
| Forced-dark boot gone | `grep classList.add("dark") main.tsx` | no match | ✓ PASS |
| Webfont gone | `grep Inter apps/desktop/src/styles/globals.css` | no match | ✓ PASS |
| Public Crafted PNGs | `file apps/desktop/public/*.png` | four 2688×1520 RGB PNGs | ✓ PASS |
| Chip has no Darstellung | `grep Darstellung session-chip.tsx` | no match | ✓ PASS |
| D-09 paper light | `grep #fff pdf-paper.tsx` | inline `#fff` present | ✓ PASS |
| Full desktop suite | (orchestrator: 51/51 after 387d765) | not re-run here | ? SKIP — prior evidence; single named test run instead |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | No `scripts/*/tests/probe-*.sh`; PLANs do not declare probes | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| UI-01 | 04-01, 04-02, 04-03 | Every UI-bearing phase has interactive mockups / UI-SPEC before implementation | ✓ SATISFIED | `04-UI-SPEC.md` approved; `mockups/approved/01–09` exist; in-scope surfaces consume the spec tokens. Visual 1:1 still human. |
| BRAND-01 | 04-01, 04-02, 04-03 | Crafted Minimal is the visual system (tokens + approved-mockup SSOT + motion) | ✓ SATISFIED | Dual-theme tokens, system type, motion utilities, approved mockups, Higgsfield art wired. |
| PDF-01 | none (orphaned in REQUIREMENTS table as Phase 4) | Backend-rendered PDF | deferred | Mapped in REQUIREMENTS.md to Phase 4 Pending; ROADMAP Phase 5 owns it. |
| OFFL-01 | none | Offline sync | deferred | Same stale Phase 4 row; ROADMAP Phase 5. |
| AUDT-01 | none | Audit logs | deferred | Same stale Phase 4 row; ROADMAP Phase 5. |

No plan claimed PDF-01 / OFFL-01 / AUDT-01. They are **orphaned relative to Phase 4 plans** and **deferred to Phase 5** by ROADMAP — not Phase 4 blockers.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `apps/desktop/src/components/invoice-empty-state.tsx` | heading | Copy vs UI-SPEC: "Noch keine Rechnung erstellt" vs contract "Noch keine Rechnungen erstellt"; body is longer than UI-SPEC one-liner | ℹ️ Info | PLAN 04-02 said keep existing copy; CTA matches. Human UAT vs 09-empty-state.png. |
| `apps/desktop/src/components/splash.tsx` | — | `public/splash.png` unused (D-16 typography-only splash) | ℹ️ Info | Asset shipped; atmosphere optional. Not a stub. |
| `apps/desktop/src/routes/rechnung.tsx` | 451 | `ErrorState onRetry={() => undefined}` on `!canRead` | ℹ️ Info | Viewer-permission branch; retry cannot grant access. Load-error path has real `loadDrafts` retry. Pre-existing Phase 3 shape. |
| `apps/desktop/src/components/pdf-paper.tsx` | 4 | `SAMPLE_INVOICE` hardcoded | ℹ️ Info | D-09 restyle; live PDF is Phase 5. |

No `TBD` / `FIXME` / `XXX` in phase-touched TS/TSX. No skipped tests.

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `apps/desktop/src/lib/theme.test.ts` | BRAND-01 | 8 | 0 | no | Value (`toBe` on classList, localStorage, matchMedia) | PASS |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** 1 WARNING — `theme.test.ts` does not exercise the `matchMedia` **change** listener in `main.tsx`. Launch-time OS-follow is covered; live OS-theme-while-system is code-wired, not unit-tested. Routed to human verification (Darstellung/OS), not a blocker.

### Prohibitions

| Statement | Status | Evidence |
|-----------|--------|----------|
| must NOT ship two CSS bundles or duplicate Light/Dark component trees (D-08) | held | One tree; token mirror only |
| must NOT add a theme control to the session chip (D-07) | held | Chip = identity + Abmelden |
| must NOT add nav items or routes (D-11) | held | `NAV_ITEMS` still Rechnung · Entities · Kunden · Tax · PDF |
| must NOT package a webfont (D-03) | held | System stack only |
| must NOT let Darstellung override win over OS for reduced-motion (D-17) | held | Motion gated on `prefers-reduced-motion`, not theme pref |
| must NOT implement mockups 10–15 or resurrect rejected explorations (D-13) | held | No onboarding/settings/profile/dashboard/catalog/export routes |
| must NOT build a custom titlebar (D-19) | held | `tauri.conf.json` + `lib.rs` `decorations: true` |
| must NOT invert PdfPaper in dark theme (D-09) | held | Inline `#fff`/`#111` |
| must NOT hard-code hex in restyled components | held | Hex only in token files + D-09 islands |
| must NOT generate in-app illustrations at runtime (D-25) | held | Static `public/` PNGs |

Judgment-tier prohibitions — grep-backed, not a negative-test gate.

### Decision Coverage

All 19 trackable CONTEXT.md decisions (D-01–D-19) are honored by shipped artifacts. Gate is non-blocking.

### Human Verification Required

### 1. 1:1 mockup match (Light + Dark)

**Test:** Sign in, walk Rechnung (empty + populated), Entities, Kunden, Tax, PDF, Login gate. Switch Darstellung Hell then Dunkel. Compare to `mockups/approved/02–09`.
**Expected:** Crafted Minimal 1:1 — sage accent, oatmeal/charcoal surfaces, whisper separators, tabular money, no Nordic/glass/teal leftovers. Screens 10–15 not in the app.
**Why human:** Automated checks prove tokens and structure, not craft.

### 2. Darstellung menu + OS-follow + no FOUC

**Test:** Quit, clear `localStorage.clared-theme` (or fresh profile), relaunch, then Hell / Dunkel / System. Confirm chip has no theme item.
**Expected:** First paint matches OS; no flash of the wrong theme; checks track the pref; persist across relaunch.
**Why human:** Native macOS/Windows menu and paint timing.

### 3. Reduced-motion + splash

**Test:** Enable OS reduced motion; press primary buttons; cold-launch while `/me` is slow.
**Expected:** No press scale; short/no animation. Splash = "Clared" + spinner, then shell or login.
**Why human:** Motion feel and splash timing.

## Gaps Summary

**No blocking gaps.** Phase 4 code lands the brand system, theme engine, in-scope restyles, and wired Crafted art. Three must-haves stay UNCERTAIN because they are 1:1 visual contracts. Status is `human_needed`, not `passed`.

Stale REQUIREMENTS.md rows mapping PDF-01 / OFFL-01 / AUDT-01 to Phase 4 should be pointed at Phase 5 when convenient — documentation drift, not a Phase 4 code miss.

---

_Verified: 2026-08-23T01:38:00Z_
_Verifier: Claude (gsd-verifier)_
