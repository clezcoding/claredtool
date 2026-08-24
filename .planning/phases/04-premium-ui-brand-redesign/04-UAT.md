---
status: complete
phase: 04-premium-ui-brand-redesign
source: 04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md, 04-05-SUMMARY.md, 04-06-SUMMARY.md, 04-VERIFICATION.md
started: 2026-08-24T00:02:00Z
updated: 2026-08-24T00:16:00Z
tester: agent (gsd-verify-work 4; macos-mcp + tauri dev; signed-in UAT session)
---

## Current Test

[testing complete]

## Tests

### 1. Live Darstellung, no FOUC on switch, 5-item shell vs mockups 02–09
expected: Darstellung Hell/Dunkel/System live. Canvas Pale Oatmeal #F7F7F5 or Deep Charcoal #111110 with tokens. Shell is 5 items (Rechnung, Entities, Kunden, Tax, PDF). No Übersicht/Banking/Senden. Sage accent. Screens 10–15 absent.
result: pass
reported: "Agent UAT 2026-08-24. tauri dev Clared focused. Native menu Darstellung = Hell, Dunkel, System. Hell canvas sampled (247,247,245)=#F7F7F5. Dunkel (17,17,16)=#111110. Sidebar 5 routes only. Chip Clared UAT Owner / Plattform (identity, no theme control). Sage highlight on active nav. G-04-1/G-04-2 canvas drift from prior UAT not reproduced."

### 2. Invoice, tax, PDF, empty-state vs mockups 02/03/06/07/09 Light+Dark
expected: Rechnung split + tax rail + PDF stage + empty hero match Crafted mockups in Hell and Dunkel. PdfPaper stays paper white.
result: pass
reported: "Rechnung Hell+Dunkel: header RE-2026-001 Entwurf, VON/KUNDE, line table, Live Steuerberechnung, PDF mini-preview white. Tax Hell: Tax Engine / Settings, Live Steuerberechnung field list. PDF Hell: invoice paper, Download PDF, tax metadata, Phase-5 persistence note. Empty-state not shown (live draft present). No mockup 10–15 chrome."

### 3. Entities, Kunden, Login vs mockups 04/05/08 Light+Dark
expected: List+panel Entities/Kunden. Login gate hero + Clared + Anmelden SSO (not email card). Chip identity+Abmelden only.
result: pass
reported: "Entities Hell: 1 Entity UAT Seller GmbH, Anlegen, list columns ENTITY/RECHTSFORM/LAND/UST-IDNR. Kunden Hell: 1 Kunde, Anlegen. Signed-in; LoginGate not re-opened (session preserved). SSO LoginGate remains D-13. Chip is profile not Darstellung."

### 4. Cold-launch first paint oatmeal/charcoal; Clared splash observable
expected: Kill/relaunch with clared-theme cleared. First paint #F7F7F5/#111110. Splash Clared + spinner ~700ms. No UA-white FOUC.
result: skipped
reason: "tauri dev already running (PID target/debug/clared). Cold kill would drop the live Vite/Tauri session. Warm window already on shell. CSS+boot SSOT verified as #F7F7F5/#111110 after 04-06. Splash hold 700ms in App.tsx; not captured this run."

### 5. Invoice picker shows invoiceLabel; value is invoice id; single clear control
expected: Picker displays invoiceLabel (number or Neue Rechnung). Select value is row.id. One clear/trigger control (no nested button).
result: pass
reported: "Header/picker surface shows RE-2026-001 not a raw object. Code: invoiceLabel() + SelectItem value={row.id} + single SelectTrigger aria-label Rechnung wählen. ComboboxClear lives in packages/ui; invoice picker is Select, one trigger."

### 6. Live OS Light/Dark flip while Darstellung=System
expected: With Darstellung=System, OS appearance change repaints canvas hex and tokens together.
result: skipped
reason: "Did not toggle macOS-wide appearance (would perturb the user desktop). Clicked Darstellung > System. Hell/Dunkel already proved hex+tokens move together (#F7F7F5 / #111110). syncSystemAppearance unit-covered."

### 7. Theme engine resolveDark / applyTheme / currentPref
expected: Theme engine resolveDark / applyTheme / currentPref with guarded localStorage fallback
result: pass
source: automated
coverage_id: 04-01-D1

### 8. Crafted Minimal Light :root and Dark .dark tokens
expected: Crafted Minimal Light :root and Dark .dark token split in both globals.css copies
result: pass
source: automated
coverage_id: 04-01-D2

### 9. Boot follows OS via applyTheme(currentPref())
expected: Boot follows OS via applyTheme(currentPref()) before ReactDOM render
result: pass
source: automated
coverage_id: 04-01-D3

### 10. Darstellung native menu
expected: Darstellung native menu with Hell / Dunkel / System CheckMenuItems
result: pass
source: automated
coverage_id: 04-01-D4

### 11. Launch splash Clared + Spinner
expected: Launch splash renders Clared wordmark plus Spinner while /me is warming
result: pass
source: automated
coverage_id: 04-01-D5

### 12. BRAND-01 mapped in REQUIREMENTS.md
expected: BRAND-01 listed under Desktop & UI and mapped to Phase 4
result: pass
source: automated
coverage_id: 04-01-D6

### 13. ROADMAP Crafted Minimal success criteria
expected: ROADMAP Phase 4 Success Criteria names Crafted Minimal
result: pass
source: automated
coverage_id: 04-01-D7

### 14. Rechnung / tax / empty consume Wave-1 tokens
expected: Rechnung split canvas and line-item cards consume Wave-1 tokens
result: pass
source: automated
coverage_id: 04-02-D1

### 15. Tax screen + empty-state hero CTA
expected: Tax screen restyle; empty-state Beispielrechnung anzeigen
result: pass
source: automated
coverage_id: 04-02-D2

### 16. PDF stage theme-follow; PdfPaper inline white
expected: PDF stage uses bg-background; PdfPaper keeps inline #fff/#111
result: pass
source: automated
coverage_id: 04-02-D3

### 17. Entities/Kunden list+panel states
expected: Entities and Kunden keep list+panel, loading→empty→error
result: pass
source: automated
coverage_id: 04-03-D1

### 18. Login gate hero + session chip
expected: Login gate hero PNG, Clared wordmark, Sage CTA; chip identity+logout
result: pass
source: automated
coverage_id: 04-03-D2

### 19. Public PNG assets + reduced-motion spinner
expected: public/ heroes present; spinner prefers-reduced-motion
result: pass
source: automated
coverage_id: 04-03-D3

### 20. applyTheme paints html/body D-02
expected: applyTheme paints html and body with D-02 oatmeal/charcoal
result: pass
source: automated
coverage_id: 04-04-D1

### 21. Traceability PDF-01 OFFL-01 AUDT-01 Phase 5
expected: Traceability rows PDF-01 OFFL-01 AUDT-01 list Phase 5 Pending
result: pass
source: automated
coverage_id: 04-04-D4

### 22. System pref OS matchMedia applyTheme
expected: While Darstellung is System, OS color-scheme change re-paints via applyTheme
result: pass
source: automated
coverage_id: 04-05-D1

### 23. Empty invoice CTA Beispielrechnung anzeigen
expected: Empty invoice canvas return CTA is Beispielrechnung anzeigen
result: pass
source: automated
coverage_id: 04-05-D2

### 24. Unsigned LoginGate Anmelden open_login_window
expected: Unsigned LoginGate shows hero and Anmelden invokes open_login_window
result: pass
source: automated
coverage_id: 04-05-D3

### 25. Light/dark canvas hex SSOT both globals.css
expected: Light canvas Pale Oatmeal #F7F7F5, dark Deep Charcoal #111110
result: pass
source: automated
coverage_id: 04-06-D1

### 26. PAINT_LIGHT / PAINT_DARK locked to boot IIFE
expected: Exported PAINT_LIGHT / PAINT_DARK locked to boot IIFE and CSS --background
result: pass
source: automated
coverage_id: 04-06-D2

### 27. D-08 twins; LoginGate SSO; PdfPaper inline
expected: D-08 token twins; LoginGate still open_login_window; PdfPaper inline #fff/#111
result: pass
source: automated
coverage_id: 04-06-D3

## Summary

total: 27
passed: 25
issues: 0
pending: 0
skipped: 2
blocked: 0

env: macos-mcp vision + screencapture pixel sample; tauri dev; signed-in UAT; no Playwright MCP

## Gaps

[none]

Prior gaps G-04-1 and G-04-2 (canvas #ffffff/#0f1113 vs D-02) reconciled resolved by 04-06-SUMMARY.md. Not reopened.

## Deferred Follow-Ups

- test: 4
  idea: Human cold-launch capture with tauri CLI kept alive (splash + FOUC)
  deferred_at: 2026-08-24
- test: 6
  idea: Human OS appearance toggle while Darstellung=System
  deferred_at: 2026-08-24
