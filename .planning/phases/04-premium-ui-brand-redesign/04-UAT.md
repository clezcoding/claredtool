---
status: complete
phase: 04-premium-ui-brand-redesign
source: 04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md, 04-05-SUMMARY.md, 04-VERIFICATION.md
started: 2026-08-23T01:40:00Z
updated: 2026-08-23T16:50:00Z
tester: agent (gsd-verify-work 4; macos-mcp + Coolify + dbhub; VITE_BACKEND_URL=https://clared-api.puzzlessdev.online)
---

## Current Test

[testing complete]

## Tests

### 1. 1:1 mockup match (Light + Dark), 5-item shell restyle (D-13)
expected: Open in-scope screens in Light and Dark (Darstellung Hell then Dunkel) and compare to mockups/approved 02–09 as a restyle of the 5-item shell (D-11, D-13). Rechnung, Entities/Kunden, Tax, PDF, Login, empty-state match Crafted density (whisper border-border/70, sage accent). No Übersicht/Banking/Senden. Screens 10–15 absent.
result: issue
reported: "Prod UAT 2026-08-23 18:44–18:50 CEST. Desktop tauri dev with VITE_BACKEND_URL=https://clared-api.puzzlessdev.online (vite PID env confirmed). Coolify clared-api yzmje7zsrp1qwtvsd7izjhaf running:healthy; GET /health/ready postgres+redis up. dbhub public: 2 invoices (RE-2026-001, RE-2026-002 drafts), 1 entity, 1 customer, 23 tax_rules. Keychain com.clared.app/session empty — unsigned LoginGate only. Darstellung Hell canvas sampled #ffffff not Pale Oatmeal #F7F7F5; Dunkel sampled rgb(15,17,19)=#0f1113 not Deep Charcoal #111110. Matches globals.css --background. LoginGate: hero PNG + Clared wordmark + Anmelden SSO (opens authentik 'Log in to continue to clared') — not mockup 08 email/password card. Sage primary on EN/DE chip. No Übersicht/Banking/Senden on unsigned gate. Signed-in Rechnung/Entities/Kunden/Tax/PDF not walked (Authentik password/MFA)."
severity: major

### 2. Cold launch FOUC + splash + Darstellung
expected: Cold-launch with clared-theme cleared, OS Dark then OS Light; confirm splash then LoginGate/shell; no UA-white flash. First paint oatmeal or charcoal; Clared splash observable ~700ms; Hell/Dunkel/System persist; chip is identity + Abmelden only.
result: issue
reported: "Darstellung Hell/Dunkel/System menu present and applied live on LoginGate. Hell/Dunkel persist for the session (menu check). Chip not visible unsigned. Splash not observed (warm/signed-out boot already on LoginGate). Burst-capture after killing target/debug/clared also killed tauri CLI (exit 0); 25 frames were desktop behind the dead window (rgb 18,18,18), not a relaunch. Structural FOUC still in code: index.html boot IIFE paints #F7F7F5/#111110 then CSS --background #ffffff/#0f1113 takes over — Light first-paint cannot stay oatmeal."
severity: major

### 3. Reduced-motion + live OS theme while System
expected: OS reduced-motion on; press Anmelden / + Position; live OS theme change while Darstellung=System. No press scale. Theme class AND canvas hex follow OS together (syncSystemAppearance unit-tested; live OS flip is not).
result: skipped
reason: "com.apple.universalaccess reduceMotion unset. Did not toggle macOS-wide dark mode or reduceMotion for this agent session. Anmelden press fired open_login_window (authentik webview). + Position needs signed-in Rechnung. syncSystemAppearance remains unit-covered in theme.test.ts."

## Summary

total: 3
passed: 0
issues: 2
pending: 0
skipped: 1
blocked: 0

env: VITE_BACKEND_URL=https://clared-api.puzzlessdev.online; Coolify production Postgres via dbhub; macos-mcp vision + screencapture; no Playwright MCP

## Gaps

- gap_id: G-04-1
  truth: "Rechnung split canvas, Entities/Kunden list+panel, Tax dl, PDF stage, Login gate, and empty-state match Crafted Minimal 1:1 (spacing, density, sage accent, whisper separators). Out-of-scope 10–15 are absent."
  status: failed
  reason: "User reported: Prod UAT 2026-08-23 18:44–18:50 CEST. Desktop tauri dev with VITE_BACKEND_URL=https://clared-api.puzzlessdev.online (vite PID env confirmed). Coolify clared-api yzmje7zsrp1qwtvsd7izjhaf running:healthy; GET /health/ready postgres+redis up. dbhub public: 2 invoices (RE-2026-001, RE-2026-002 drafts), 1 entity, 1 customer, 23 tax_rules. Keychain com.clared.app/session empty — unsigned LoginGate only. Darstellung Hell canvas sampled #ffffff not Pale Oatmeal #F7F7F5; Dunkel sampled rgb(15,17,19)=#0f1113 not Deep Charcoal #111110. Matches globals.css --background. LoginGate: hero PNG + Clared wordmark + Anmelden SSO (opens authentik 'Log in to continue to clared') — not mockup 08 email/password card. Sage primary on EN/DE chip. No Übersicht/Banking/Senden on unsigned gate. Signed-in Rechnung/Entities/Kunden/Tax/PDF not walked (Authentik password/MFA)."
  severity: major
  test: 1
  root_cause: "D-02 canvas tokens in index.html/theme.ts (#F7F7F5 / #111110) drifted from CSS --background in apps/desktop/src/styles/globals.css and packages/ui/src/styles/globals.css (#ffffff / #0f1113). LoginGate is SSO by design (D-13); mockup 08 email fields were never the live product. Signed-in 5-route craft still needs a live session."
  artifacts:
    - path: apps/desktop/src/styles/globals.css
      issue: ":root --background #ffffff; .dark --background #0f1113"
    - path: packages/ui/src/styles/globals.css
      issue: "same token split vs D-02"
    - path: apps/desktop/index.html
      issue: "boot IIFE still paints #F7F7F5 / #111110"
  missing:
    - "Align --background (and html/body paint) to D-02 Pale Oatmeal / Deep Charcoal"
    - "Human or agent signed-in walk of Rechnung/Entities/Kunden/Tax/PDF after session"
  debug_session: ""

- gap_id: G-04-2
  truth: "First paint follows OS with no FOUC. Menu checks the active pref. Selecting Hell / Dunkel / System persists and swaps .dark live. Session chip stays identity + Abmelden only."
  status: failed
  reason: "User reported: Darstellung Hell/Dunkel/System menu present and applied live on LoginGate. Hell/Dunkel persist for the session (menu check). Chip not visible unsigned. Splash not observed (warm/signed-out boot already on LoginGate). Burst-capture after killing target/debug/clared also killed tauri CLI (exit 0); 25 frames were desktop behind the dead window (rgb 18,18,18), not a relaunch. Structural FOUC still in code: index.html boot IIFE paints #F7F7F5/#111110 then CSS --background #ffffff/#0f1113 takes over — Light first-paint cannot stay oatmeal."
  severity: major
  test: 2
  root_cause: "Boot IIFE and applyTheme paint D-02 hex; Tailwind bg-background uses different --background. Killing the debug binary ends `tauri dev`, so a screenshot loop cannot observe splash/FOUC on relaunch without restarting the CLI first."
  artifacts:
    - path: apps/desktop/index.html
      issue: "IIFE #F7F7F5 vs CSS #ffffff"
    - path: apps/desktop/src/lib/theme.ts
      issue: "PAINT_LIGHT/DARK diverge from CSS tokens"
  missing:
    - "Single source of truth for canvas hex (CSS + IIFE + applyTheme)"
    - "Cold-launch capture with tauri CLI kept alive"
  debug_session: ""

- gap_id: G-04-3
  truth: "With OS reduced-motion on, press scale is disabled and transitions clamp. Splash shows wordmark Clared + spinner, then shell or LoginGate."
  status: skipped
  reason: "reduceMotion unset; no OS-wide appearance toggle this session"
  severity: major
  test: 3
  root_cause: "Live OS a11y/appearance not flipped by agent; unit tests still cover syncSystemAppearance and motion-reduce CSS."
  artifacts: []
  missing:
    - "Human: enable reduceMotion, cold-launch, press Anmelden, flip OS appearance while Darstellung=System"
  debug_session: ""
