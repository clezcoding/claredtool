---
status: testing
phase: 04-premium-ui-brand-redesign
source: [04-VERIFICATION.md]
started: 2026-08-23T01:40:00Z
updated: 2026-08-23T01:40:00Z
---

## Current Test

number: 1
name: 1:1 mockup match (Light + Dark)
expected: |
  Sign in, walk Rechnung (empty + populated), Entities, Kunden, Tax, PDF, Login gate. Switch Darstellung Hell then Dunkel. Compare to mockups/approved/02–09. Crafted Minimal 1:1 — sage accent, oatmeal/charcoal surfaces, whisper separators, tabular money, no Nordic/glass/teal leftovers. Screens 10–15 not in the app.
awaiting: user response

## Tests

### 1. 1:1 mockup match (Light + Dark)
expected: Rechnung split canvas, Entities/Kunden list+panel, Tax dl, PDF stage, Login gate, and empty-state match Crafted Minimal 1:1 (spacing, density, sage accent, whisper separators). Out-of-scope 10–15 are absent.
result: [pending]

### 2. Darstellung menu + OS-follow + no FOUC
expected: First paint follows OS with no FOUC. Menu checks the active pref. Selecting Hell / Dunkel / System persists and swaps .dark live. Session chip stays identity + Abmelden only.
result: [pending]

### 3. Reduced-motion + splash
expected: With OS reduced-motion on, press scale is disabled and transitions clamp. Splash shows wordmark Clared + spinner, then shell or LoginGate.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
