# Mockup Gap Audit — 2026-08-24

Tauri MCP screenshots vs `mockups/approved/`. UAT 04 marked pass on tokens; visual fidelity **fail**.

**Scope lock (D-11/D-13):** 5-item nav only. No mockup 10–15 routes. German product copy. System fonts (D-03).

| ID | Route | Mockup | Severity | Gap |
|----|-------|--------|----------|-----|
| F-01 | Shell | 02–07 | high | Sidebar missing logo mark, ⌘K hint, upgrade card; nav density/spacing off |
| F-02 | Rechnung | 02/03 | high | Missing Betreff, Notiz, Zahlungsbedingung, Kategorie column+icons, entity logos in Von/Kunde, bottom action bar, Senden split, Steuerregel card+chart, legal-check box, relative save time |
| F-03 | Entities | 04/05 | high | Missing search+filter, checkboxes, avatars, row menus, flags, pagination; detail panel missing tabs/sections/map/contacts |
| F-04 | Kunden | 04/05 | high | Same list+panel gaps as Entities (D-12) |
| F-05 | Tax | 06 | high | Missing 4 rule cards, drag handles, toggles, +New Rule, Reorder; shows raw field dump not rules UI |
| F-06 | PDF | 07 | high | Missing breadcrumb INV id, fullscreen, EN/DE toggle, audit timeline with checkmarks, View Full Audit Trail |
| F-07 | Rechnung | 02 | medium | Tax rail shows raw metadata keys below Gesamtbetrag (not in mockup) |
| F-08 | Entities | 04 | medium | Detail panel not auto-open on first row |
| F-09 | All | 01 | medium | Light-mode verification pending (screenshots were dark) |

**Update 2026-08-24 (pass 2):** Inter + Instrument Serif fonts; dark canvas #0F0F0F; Rechnung sage Senden + card layout + line-item icons; entity tabs functional; sidebar active bar. Remaining: populated demo data (12 entities), functional ⌘K/filter dropdowns, API persist for Betreff/Notiz.
