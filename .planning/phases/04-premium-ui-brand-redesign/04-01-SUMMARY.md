---
phase: 04-premium-ui-brand-redesign
plan: 01
subsystem: ui
tags: [tailwind-v4, tauri-menu, theme, crafted-minimal, vitest]

requires:
  - phase: 01-tauri-desktop-mockup-first-ui
    provides: desktop shell, hash router, NAV_ITEMS, forced-dark boot
  - phase: 02-self-hosted-backend-authentik-sso
    provides: session chip (identity + logout only), /me boot gate
provides:
  - Crafted Minimal Light/Dark CSS tokens in both globals.css copies
  - OS-follow theme engine (resolveDark / applyTheme / currentPref)
  - Darstellung native app menu (Hell / Dunkel / System)
  - Launch splash (Clared wordmark + Spinner)
  - BRAND-01 tracked in REQUIREMENTS.md
affects: [04-02, 04-03, desktop-shell, packages-ui-tokens]

actuals:
  tokens: 4408
  tasks: 4
  commits: 5

tech-stack:
  added: []
  patterns:
    - "Tailwind v4 :root vs .dark token split, one component tree"
    - "applyTheme(currentPref()) before ReactDOM render (no FOUC)"
    - "matchMedia change listener only while pref === system"
    - "Tauri 2 JS Menu.default() + Darstellung CheckMenuItems"

key-files:
  created:
    - apps/desktop/src/lib/theme.ts
    - apps/desktop/src/lib/theme.test.ts
    - apps/desktop/src/lib/theme-menu.ts
    - apps/desktop/src/components/splash.tsx
  modified:
    - apps/desktop/src/styles/globals.css
    - packages/ui/src/styles/globals.css
    - apps/desktop/src/main.tsx
    - apps/desktop/src/App.tsx
    - apps/desktop/src-tauri/capabilities/default.json
    - apps/desktop/src/data/tax-live-store.ts
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md

key-decisions:
  - "Amber --destructive #C9A227 sampled as sparse emphasis from 03-rechnung-dark Reverse-Charge (A1)"
  - "Dark raised card #1C1C1A and hairline #2A2A28 sampled from dark mockups (A2)"
  - "Kept @custom-variant dark (&:is(.dark *)) verbatim; Menu.default() then append Darstellung"
  - "Added core:menu:default so the JS menu can replace the app menu (A4)"

patterns-established:
  - "Pattern 1: dual-theme CSS tokens in :root / .dark, aliases stay in @theme inline"
  - "Pattern 2: theme.ts persist + classList.toggle before paint"
  - "Pattern 3: native Darstellung CheckMenuItems, never on the session chip"
  - "Pattern 4: --dur 180ms + cubic-bezier(0.22,1,0.36,1); reduced-motion independent of color pref"

requirements-completed: [UI-01, BRAND-01]

coverage:
  - id: D1
    description: Theme engine resolveDark / applyTheme / currentPref with guarded localStorage fallback
    requirement: BRAND-01
    verification:
      - kind: unit
        ref: apps/desktop/src/lib/theme.test.ts#theme
        status: pass
      - kind: other
        ref: pnpm --filter desktop test theme
        status: pass
    human_judgment: false
  - id: D2
    description: Crafted Minimal Light :root and Dark .dark token split in both globals.css copies; system font; tabular-nums; motion tokens
    requirement: BRAND-01
    verification:
      - kind: other
        ref: grep :root { and .dark { in apps/desktop and packages/ui globals.css
        status: pass
      - kind: other
        ref: pnpm --filter desktop build
        status: pass
    human_judgment: false
  - id: D3
    description: Boot follows OS via applyTheme(currentPref()) before ReactDOM render; no forced-dark classList.add
    requirement: BRAND-01
    verification:
      - kind: other
        ref: grep applyTheme(currentPref()) apps/desktop/src/main.tsx
        status: pass
    human_judgment: false
  - id: D4
    description: Darstellung native menu with Hell / Dunkel / System CheckMenuItems and setAsAppMenu
    requirement: BRAND-01
    verification:
      - kind: other
        ref: grep Darstellung/setAsAppMenu apps/desktop/src/lib/theme-menu.ts
        status: pass
      - kind: other
        ref: pnpm --filter desktop build
        status: pass
    human_judgment: false
  - id: D5
    description: Launch splash renders Clared wordmark plus Spinner while /me is warming
    requirement: BRAND-01
    verification:
      - kind: other
        ref: grep Clared and Spinner apps/desktop/src/components/splash.tsx
        status: pass
    human_judgment: false
  - id: D6
    description: BRAND-01 listed under Desktop & UI and mapped to Phase 4 in REQUIREMENTS.md
    requirement: BRAND-01
    verification:
      - kind: other
        ref: grep BRAND-01 .planning/REQUIREMENTS.md
        status: pass
    human_judgment: false
  - id: D7
    description: ROADMAP Phase 4 Success Criteria names Crafted Minimal; Nordic Calm Fintech gone from that section
    requirement: BRAND-01
    verification:
      - kind: other
        ref: awk-scoped grep -c Nordic Calm Fintech | grep -qx 0
        status: pass
    human_judgment: false
  - id: D8
    description: Live Darstellung switch, no FOUC, reduced-motion, and 1:1 shell vs approved mockups
    requirement: BRAND-01
    verification: []
    human_judgment: true
    rationale: Manual UAT of native menu, launch flash, and visual match cannot be proven by unit tests or build greps

duration: 9min
completed: 2026-08-23
status: complete
---

# Phase 4 Plan 01: Crafted Minimal Theme Engine Summary

**OS-follow theme engine plus dual-theme Crafted Minimal tokens, Darstellung menu, and Clared splash — one component tree for Light and Dark**

## Performance

- **Duration:** 9 min
- **Started:** 2026-08-23T00:58:41Z
- **Completed:** 2026-08-23T01:07:13Z
- **Tasks:** 4
- **Files modified:** 12

## Accomplishments

- ThemePref `light | dark | system` resolves via matchMedia, persists under `clared-theme`, and toggles `.dark` before React paints
- globals.css (desktop + `@clared/ui`) split into Light `:root` and Dark `.dark` Crafted Minimal tokens; Inter webfont removed
- Native Darstellung menu (Hell / Dunkel / System) on the default app menu; session chip unchanged
- Launch splash shows the Clared wordmark plus Spinner while `/me` warms
- BRAND-01 tracked; ROADMAP Phase 4 Success Criteria retitled to Crafted Minimal

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: failing theme tests** - `5751361` (test)
2. **Task 1 GREEN: theme engine + token split** - `c2266ea` (feat)
3. **Task 2: Darstellung menu + splash + shell** - `e05791d` (feat)
4. **Task 3: BRAND-01 requirement** - `c8dec6c` (docs)
5. **Task 4: ROADMAP Crafted Minimal retitle** - `8e9eb5f` (docs)

**Plan metadata:** (this commit)

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified

- `apps/desktop/src/lib/theme.ts` - THEME_KEY, ThemePref, resolveDark, applyTheme, currentPref
- `apps/desktop/src/lib/theme.test.ts` - eight Vitest + jsdom behaviors; localStorage stub for Node 25
- `apps/desktop/src/lib/theme-menu.ts` - Darstellung CheckMenuItems on Menu.default()
- `apps/desktop/src/components/splash.tsx` - Clared wordmark + Spinner
- `apps/desktop/src/styles/globals.css` - Light/Dark token split, system font, tabular-nums, motion
- `packages/ui/src/styles/globals.css` - mirror of the desktop token split
- `apps/desktop/src/main.tsx` - applyTheme before render; OS change listener; installThemeMenu
- `apps/desktop/src/App.tsx` - oatmeal sidebar, Sage active nav, splash on boot
- `apps/desktop/src-tauri/capabilities/default.json` - `core:menu:default`
- `apps/desktop/src/data/tax-live-store.ts` - sibling import so desktop tsc passes
- `.planning/REQUIREMENTS.md` - BRAND-01 + Phase 4 traceability
- `.planning/ROADMAP.md` - Crafted Minimal in Phase 4 Success Criteria #1

## Decisions Made

- Amber `--destructive` is `#C9A227` (sparse Reverse-Charge emphasis from 03-rechnung-dark, A1)
- Dark raised surface `#1C1C1A`, hairline `#2A2A28` (A2)
- Kept existing `@custom-variant dark (&:is(.dark *))` verbatim per RESEARCH; Context7 class strategy documented but not swapped
- Platform defaults via `Menu.default()` then append Darstellung so macOS app menu is not emptied
- Added `core:menu:default` up front (A4) rather than waiting for a runtime ACL miss

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Node 25 localStorage is undefined in jsdom**
- **Found during:** Task 1 GREEN (tests imported but `localStorage.clear` threw)
- **Issue:** Node experimental Web Storage leaves `localStorage` undefined unless `--localstorage-file` is set
- **Fix:** Map-backed Storage stub in `theme.test.ts` `beforeEach`
- **Files modified:** `apps/desktop/src/lib/theme.test.ts`
- **Verification:** `pnpm --filter desktop test theme` — 8 passed
- **Committed in:** `c2266ea` (Task 1 GREEN)

**2. [Rule 3 - Blocking] Pre-existing tax-live-store import broke `tsc`**
- **Found during:** Task 1 GREEN verify (`pnpm --filter desktop build`)
- **Issue:** `src/data/tax-live-store.ts` imported `./data/sample-invoice` (nested path) instead of sibling `./sample-invoice`
- **Fix:** Correct the type-only import
- **Files modified:** `apps/desktop/src/data/tax-live-store.ts`
- **Verification:** `pnpm --filter desktop build` exit 0
- **Committed in:** `c2266ea` (Task 1 GREEN)

**3. [Rule 2 - Missing Critical] `core:menu:default` on the main window**
- **Found during:** Task 2 (A4 / Pitfall 3)
- **Issue:** JS `setAsAppMenu` needs the menu capability; `core:default` alone is not guaranteed at this crate
- **Fix:** Add `core:menu:default` to `src-tauri/capabilities/default.json`
- **Files modified:** `apps/desktop/src-tauri/capabilities/default.json`
- **Verification:** desktop build exit 0
- **Committed in:** `e05791d` (Task 2)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 missing critical)
**Impact on plan:** Unblocks GREEN verify and native menu; no scope creep.

## Issues Encountered

- Wave 0 vitest jsdom already existed in `apps/desktop/vitest.config.ts` — no `vite.config.ts` test block added
- Node 25 vs jsdom localStorage (see deviation 1)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for 04-02 and 04-03 (Wave 2 per-route restyle against live Crafted Minimal tokens). Manual UAT of Darstellung / FOUC / reduced-motion is the phase gate, not a Wave-2 blocker.

---
*Phase: 04-premium-ui-brand-redesign*
*Completed: 2026-08-23*

## Self-Check: PASSED

- FOUND: apps/desktop/src/lib/theme.ts
- FOUND: apps/desktop/src/lib/theme.test.ts
- FOUND: apps/desktop/src/lib/theme-menu.ts
- FOUND: apps/desktop/src/components/splash.tsx
- FOUND: 5751361, c2266ea, e05791d, c8dec6c, 8e9eb5f in git log
