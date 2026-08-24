# Phase 4: Premium UI & Brand Redesign - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-23
**Phase:** 4-premium-ui-brand-redesign
**Areas discussed:** Brand-Lock, Theme-System, Mockup-zu-Code, Motion & Splash

---

## Brand-Lock

| Option | Description | Selected |
|--------|-------------|----------|
| Nordic Calm Fintech | ROADMAP name at phase add | |
| Crafted Minimal | Mockup session + STATE palette | ✓ |
| Neuer Name | User-supplied | |

**User's choice:** 1b Crafted Minimal; 2a Oatmeal/Charcoal/White/Sage/Amber; 3a system fonts; 4a wordmark only.
**Notes:** Brandkit board later showed Inter/Geist + serif logo + star mark — discuss answers override those. Sage is the calm accent; Amber is rare.

---

## Theme-System

| Option | Description | Selected |
|--------|-------------|----------|
| Immer Dark | Keep Phase 1 D-09 | |
| Immer Light | Dark optional | |
| Folgt OS | macOS/Windows Appearance | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Menü Darstellung | Hell / Dunkel / System, not on session chip | ✓ |
| Nur OS | No in-app override | |
| Sidebar toggle | Extra chrome | |

| Option | Description | Selected |
|--------|-------------|----------|
| Semantische Tokens | One tree, Light/Dark swap | ✓ |
| Getrennte Komponenten | | |
| Zwei CSS-Bundles | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Papier immer hell, Bühne folgt Theme | | ✓ |
| Papier und Bühne beide hell im Light-Theme | | |
| PDF-Screen ignoriert App-Theme | | |

**User's choice:** 1c, 2a, 3a, 4a.
**Notes:** Replaces Phase 1 D-09. Phase 2 chip remains identity+logout.

---

## Mockup-zu-Code

| Option | Description | Selected |
|--------|-------------|----------|
| Page-by-page Bild→SPEC→Code | | |
| Mockups ins Repo + ein UI-SPEC + Code | | ✓ |
| Nur UI-SPEC | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Higgsfield heroes neu | Crafted palette | ✓ (budget-capped) |
| Alte navy PNGs behalten | | |
| Helden weglassen | | |

| Option | Description | Selected |
|--------|-------------|----------|
| IA bleibt, Look 1:1 Mockups | | ✓ |
| Layouts dürfen sich ändern | | |
| IA neu | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Keine neuen Screen-Mockups (4a) | Forced by credits | ✓ |
| Lücken Splash/Error/Kunden (4b) | User preference | blocked |
| Alles neu zeichnen | | |

**User's choice:** 1b; 2a with 10-credit cap; 3 = IA stays but visual 1:1; 4a because credits (wanted 4b).
**Notes:** Account `slowapp@aage.feycupz.biz.id`, starter, 10 credits. GPT Image 2 = 7/image. After save: mockups live in `mockups/approved|explorations|higgsfield`. Existing higgsfield empty/splash reused so GPT Image 2 can go to the missing login-gate. Leftover credits reported; user fills gaps in ChatGPT.

---

## Motion & Splash

| Option | Description | Selected |
|--------|-------------|----------|
| Credits max-spend then ChatGPT leftover | | ✓ |
| Wordmark splash, no new Higgsfield splash | | ✓ |
| Illustrated splash (would steal credits) | | |

| Option | Description | Selected |
|--------|-------------|----------|
| <300ms + reduced-motion | | ✓ |
| Fast keine | | |
| Reichhaltig / staggered pages | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Native OS-Titelleiste (D-07) | | ✓ |
| Custom titlebar 1:1 mockup chrome | | |
| Hidden titlebar | | |

**User's choice:** 1+2 spend all 10 credits, leftover → ChatGPT; 3a; 4a.
**Notes:** Native chrome wins over mockup custom titlebars.

---

## Claude's Discretion

- Exact Amber hex and dark HSL sampled from dark mockups.
- Splash.png behind wordmark vs type-only.
- Higgsfield Lite vs GPT split after login-gate exists, inside the 10-credit ceiling.

## Deferred Ideas

- Onboarding, settings page, profile, dashboard, catalog, DATEV export (approved mockups 10–15).
- Extra Higgsfield screen mockups for splash/error/Kunden.
- Phase 5 PDF/audit/offline; v2 Stripe.
- Custom titlebar.
