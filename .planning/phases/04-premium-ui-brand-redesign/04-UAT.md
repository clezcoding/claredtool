---
status: complete
phase: 04-premium-ui-brand-redesign
source: [04-VERIFICATION.md]
started: 2026-08-23T01:40:00Z
updated: 2026-08-23T02:36:00Z
---

## Current Test

[testing complete]

## Tests

### 1. 1:1 mockup match (Light + Dark)
expected: Rechnung split canvas, Entities/Kunden list+panel, Tax dl, PDF stage, Login gate, and empty-state match Crafted Minimal 1:1 (spacing, density, sage accent, whisper separators). Out-of-scope 10–15 are absent.
result: issue
reported: "Die UI sieht absolut NICHT so aus wie auf unseren Mockups?? nicht mal die gleichen farben glaub ich? Nested Combobox <button> in <button> hydration error in tauri terminal. Agent walk: tokens are Crafted (live #ffffff/#f7f7f5/#111110/sage; mockup 03 dark is cooler ~rgb(15,17,19)). IA mismatch is the real 1:1 miss — approved mockups are a full product (Übersicht/Banking/Senden/serif totals), live app is the 5-item shell (Rechnung/Entities/Kunden/Tax/PDF). Invoice Combobox shows raw JSON id. Coolify deploy would not change desktop CSS."
severity: major

### 2. Darstellung menu + OS-follow + no FOUC
expected: First paint follows OS with no FOUC. Menu checks the active pref. Selecting Hell / Dunkel / System persists and swaps .dark live. Session chip stays identity + Abmelden only.
result: issue
reported: "Cold launch with clared-theme deleted, OS Dark. Hell/Dunkel/System swap live and persist (sqlite UTF-16 'system'). Chip while signed-in was identity + Abmelden only, no theme item. FOUC: splash frames 02 blank dark, 03 full white unstyled document, 04 dark LoginGate. index.html theme script runs before CSS paint."
severity: major

### 3. Reduced-motion + splash
expected: With OS reduced-motion on, press scale is disabled and transitions clamp. Splash shows wordmark Clared + spinner, then shell or LoginGate.
result: issue
reported: "reduceMotion enabled for the capture. Splash wordmark+spinner never visible: blank dark → white FOUC → LoginGate. Press-scale under reduced motion not visually proven (boot too fast; Anmelden not measured at 0.97). CSS/Spinner code has motion-reduce guards."
severity: major

## Summary

total: 3
passed: 0
issues: 3
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-04-1
  truth: "Rechnung split canvas, Entities/Kunden list+panel, Tax dl, PDF stage, Login gate, and empty-state match Crafted Minimal 1:1 (spacing, density, sage accent, whisper separators). Out-of-scope 10–15 are absent."
  status: failed
  reason: "User reported: Die UI sieht absolut NICHT so aus wie auf unseren Mockups?? nicht mal die gleichen farben glaub ich? Nested Combobox <button> in <button> hydration error in tauri terminal. Agent walk: tokens are Crafted (live #ffffff/#f7f7f5/#111110/sage; mockup 03 dark is cooler ~rgb(15,17,19)). IA mismatch is the real 1:1 miss — approved mockups are a full product (Übersicht/Banking/Senden/serif totals), live app is the 5-item shell (Rechnung/Entities/Kunden/Tax/PDF). Invoice Combobox shows raw JSON id. Coolify deploy would not change desktop CSS."
  severity: major
  test: 1
  artifacts: []
  missing: []

- gap_id: G-04-2
  truth: "First paint follows OS with no FOUC. Menu checks the active pref. Selecting Hell / Dunkel / System persists and swaps .dark live. Session chip stays identity + Abmelden only."
  status: failed
  reason: "User reported: Cold launch with clared-theme deleted, OS Dark. Hell/Dunkel/System swap live and persist (sqlite UTF-16 'system'). Chip while signed-in was identity + Abmelden only, no theme item. FOUC: splash frames 02 blank dark, 03 full white unstyled document, 04 dark LoginGate. index.html theme script runs before CSS paint."
  severity: major
  test: 2
  artifacts: []
  missing: []

- gap_id: G-04-3
  truth: "With OS reduced-motion on, press scale is disabled and transitions clamp. Splash shows wordmark Clared + spinner, then shell or LoginGate."
  status: failed
  reason: "User reported: reduceMotion enabled for the capture. Splash wordmark+spinner never visible: blank dark → white FOUC → LoginGate. Press-scale under reduced motion not visually proven (boot too fast; Anmelden not measured at 0.97). CSS/Spinner code has motion-reduce guards."
  severity: major
  test: 3
  artifacts: []
  missing: []
