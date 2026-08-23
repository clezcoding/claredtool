---
status: testing
phase: 04-premium-ui-brand-redesign
source: [04-VERIFICATION.md]
started: 2026-08-23T01:40:00Z
updated: 2026-08-23T05:15:00Z
---

## Current Test

number: 1
name: 1:1 mockup match (Light + Dark), 5-item shell restyle (D-13)
expected: |
  Rechnung, Entities/Kunden, Tax, PDF, Login, empty-state match Crafted density (whisper border-border/70, sage accent). No Übersicht/Banking/Senden. Screens 10–15 absent.
awaiting: user response

## Tests

### 1. 1:1 mockup match (Light + Dark), 5-item shell restyle (D-13)
expected: Open in-scope screens in Light and Dark (Darstellung Hell then Dunkel) and compare to mockups/approved 02–09 as a restyle of the 5-item shell (D-11, D-13). Rechnung, Entities/Kunden, Tax, PDF, Login, empty-state match Crafted density (whisper border-border/70, sage accent). No Übersicht/Banking/Senden. Screens 10–15 absent.
result: pending
prior_result: issue
prior_reported: "Die UI sieht absolut NICHT so aus wie auf unseren Mockups?? nicht mal die gleichen farben glaub ich? Nested Combobox <button> in <button> hydration error in tauri terminal. Agent walk: tokens are Crafted (live #ffffff/#f7f7f5/#111110/sage; mockup 03 dark is cooler ~rgb(15,17,19)). IA mismatch is the real 1:1 miss — approved mockups are a full product (Übersicht/Banking/Senden/serif totals), live app is the 5-item shell (Rechnung/Entities/Kunden/Tax/PDF). Invoice Combobox shows raw JSON id. Coolify deploy would not change desktop CSS."

### 2. Cold launch FOUC + splash + Darstellung
expected: Cold-launch with clared-theme cleared, OS Dark then OS Light; confirm splash then LoginGate/shell; no UA-white flash. First paint oatmeal or charcoal; Clared splash observable ~700ms; Hell/Dunkel/System persist; chip is identity + Abmelden only.
result: pending
prior_result: issue
prior_reported: "Cold launch with clared-theme deleted, OS Dark. Hell/Dunkel/System swap live and persist (sqlite UTF-16 'system'). Chip while signed-in was identity + Abmelden only, no theme item. FOUC: splash frames 02 blank dark, 03 full white unstyled document, 04 dark LoginGate. index.html theme script runs before CSS paint."

### 3. Reduced-motion + live OS theme while System
expected: OS reduced-motion on; press Anmelden / + Position; live OS theme change while Darstellung=System. No press scale. Theme class AND canvas hex follow OS together (syncSystemAppearance unit-tested; live OS flip is not).
result: pending
prior_result: issue
prior_reported: "reduceMotion enabled for the capture. Splash wordmark+spinner never visible: blank dark → white FOUC → LoginGate. Press-scale under reduced motion not visually proven (boot too fast; Anmelden not measured at 0.97). CSS/Spinner code has motion-reduce guards."

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

retest_after: 04-05 gap closure (G-04-4/5/6 closed in code). Automated score 20/24. Prior round diagnosed G-04-1/2/3 — Combobox unnest and FOUC paint shipped in 04-04; empty CTA/login hero/OS applyTheme in 04-05. Human must re-walk.

## Gaps

- gap_id: G-04-1
  truth: "Rechnung split canvas, Entities/Kunden list+panel, Tax dl, PDF stage, Login gate, and empty-state match Crafted Minimal 1:1 (spacing, density, sage accent, whisper separators). Out-of-scope 10–15 are absent."
  status: retest
  reason: "Prior UAT issue retained for the re-walk. D-13 = restyle of 5-item shell, not mockup product IA. Combobox JSON/unnest closed in 04-04 code."
  severity: major
  test: 1
  root_cause: "Approved mockups 02–09 depict a full product IA that Phase 4 never built — D-13 restyles the existing 5-route shell."
  artifacts:
    - path: .planning/phases/04-premium-ui-brand-redesign/mockups/approved/03-rechnung-dark.png
      issue: "Aspirational IA vs live 5-item nav"
  missing:
    - "Human confirm 1:1 craft on existing routes after 04-04/04-05 restyle"
  debug_session: ""

- gap_id: G-04-2
  truth: "First paint follows OS with no FOUC. Menu checks the active pref. Selecting Hell / Dunkel / System persists and swaps .dark live. Session chip stays identity + Abmelden only."
  status: retest
  reason: "04-04 inline html/body paint + 04-05 OS applyTheme. Live FOUC still human."
  severity: major
  test: 2
  root_cause: "Native boot paint not covered by vitest."
  artifacts:
    - path: apps/desktop/index.html
      issue: "IIFE boot paint — re-verify no UA-white flash"
  missing:
    - "Cold launch with clared-theme cleared"
  debug_session: ""

- gap_id: G-04-3
  truth: "With OS reduced-motion on, press scale is disabled and transitions clamp. Splash shows wordmark Clared + spinner, then shell or LoginGate."
  status: retest
  reason: "Splash hold wired; SPLASH_HOLD_MS is 0 in vitest MODE. PBU."
  severity: major
  test: 3
  root_cause: "minSplashDone timer and macOS appearance cannot be flipped in jsdom."
  artifacts:
    - path: apps/desktop/src/components/splash.tsx
      issue: "Observable splash + reduced-motion press still human"
  missing:
    - "Cold-launch unsigned and signed; watch Splash ~700ms"
  debug_session: ""
