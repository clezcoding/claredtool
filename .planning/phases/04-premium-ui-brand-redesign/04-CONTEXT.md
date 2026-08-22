# Phase 4: Premium UI & Brand Redesign - Context

**Gathered:** 2026-08-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Clared gets a complete premium redesign under the brand **Crafted Minimal**. Every *existing* surface is rebuilt mockup-first: app shell, Rechnung, Entities, Kunden, Tax, PDF, Login/Session, plus empty / error / loading and a short splash. New brand tokens, Higgsfield (or reused) illustrations, and motion ship in this phase.

This phase does **not** add product capabilities. PDF generation, tax-decision audit persistence, and offline sync stay Phase 5. Stripe/seats stay v2. Dashboard, catalog, DATEV export, profile page, settings page, and onboarding were explored in mockups — they are **out of scope** here (deferred).

ROADMAP still says “Nordic Calm Fintech”. That name is superseded: SSOT is Crafted Minimal. Planner must retitle the phase in ROADMAP to match.

</domain>

<decisions>
## Implementation Decisions

### Brand-Lock
- **D-01:** Brand name SSOT is **Crafted Minimal**, not “Nordic Calm Fintech”. Tokens, UI-SPEC, ROADMAP, and Higgsfield prompts use this name. — **Reversibility:** costly — tokens, mockups, and copy all assume it.
- **D-02:** Palette SSOT (from `mockups/approved/01-brandkit.png`): Pure White `#FFFFFF`, Pale Oatmeal `#F7F7F5`, Deep Charcoal `#111110`, Muted Stone `#8A8A8A`, Soft Sage Green `#A8BFA3` (calm success / pills). **Amber is sparse emphasis only** (warnings, rare highlights) — not a fifth equal brand color. Exact Amber hex is Claude discretion from the dark Rechnung mockup.
- **D-03:** Typography is **system fonts only**: SF Pro on macOS, Segoe UI on Windows. No webfont packaging (Inter/Geist/serif from the brandkit board are **rejected** for the shipping app). Tabular numerals via `font-variant-numeric: tabular-nums` on money, not a second family.
- **D-04:** In-app mark is the wordmark **“Clared” in the system font**. No generated logo, no serif wordmark PNG, no C-monogram, no four-point star from the brandkit. `mockups/higgsfield/logo-*.png` are archive only.
- **D-05:** Add requirement **BRAND-01** to `.planning/REQUIREMENTS.md` during this phase: Crafted Minimal is the visual system (tokens + mockup SSOT + motion). UI-01 still requires mockup/UI-SPEC before code.

### Theme-System
- **D-06:** Default appearance **follows OS** (macOS / Windows). This **replaces Phase 1 D-09** (dark-first, no light theme) for this phase onward. — **Reversibility:** costly — every token and Higgsfield crop must work in both themes.
- **D-07:** In-app override lives in a native app menu **Darstellung** with Hell / Dunkel / System. **Not** in the session chip (Phase 2 D-36 stays: chip is identity + logout only). No Settings route.
- **D-08:** One component tree. Semantic CSS tokens swap Light/Dark (Tailwind v4 `@theme` / existing shadcn token slots in `packages/ui/src/styles/globals.css`). No duplicate Light/Dark components, no two CSS bundles.
- **D-09:** `PdfPaper` content stays **always light** (Phase 1 D-26/D-27). The surrounding stage follows the app theme. Do not invert invoice numbers. Do not force a dark stage in Light mode.

### Mockup-zu-Code
- **D-10:** Visual SSOT is `.planning/phases/04-premium-ui-brand-redesign/mockups/approved/` (see README there). Write **one** `04-UI-SPEC.md` covering all in-scope surfaces, then code. Not page-by-page image gates.
- **D-11:** **Look is 1:1 to those approved mockups** (spacing, density, sidebar treatment, cards, type size, color). Information architecture does **not** change: left sidebar Rechnung · Entities · Kunden · Tax · PDF; split invoice canvas; list+panel; compact line-item cards (Phase 1 D-05/D-06/D-14/D-17, Phase 3 D-01). Native window chrome is the exception (D-19).
- **D-12:** In-scope approved files: `01-brandkit.png` (tokens only; type/logo overridden by D-03/D-04), `02-rechnung-light.png`, `03-rechnung-dark.png`, `04-entities-light.png`, `05-entities-dark.png`, `06-tax-engine.png`, `07-pdf-viewer.png`, `08-login.png`, `09-empty-state.png`. **Kunden shares the Entities mockups.** Splash / error have no extra screen mockups — derive from tokens + existing `error-state.tsx` / skeleton.
- **D-13:** Out-of-scope mockups (do not implement): `10-onboarding.png`, `11-settings.png`, `12-profile.png`, `13-dashboard.png`, `14-catalog.png`, `15-export.png`. Explorations in `mockups/explorations/` are rejected directions — do not resurrect Nordic / glass / warm-editorial / corporate-teal.
- **D-14:** Higgsfield budget is **10 Starter credits** (`higgsfield account status` at discuss time). GPT Image 2 = 7 credits/image; Nano Banana 2 Lite = 1 credit. **Reuse** existing Crafted art in `mockups/higgsfield/` (`empty-invoices.png`, `empty-entities.png`, `splash.png`) — do **not** spend GPT Image 2 duplicating Empty-State. Spend remaining credits on the **missing Login-Gate hero** first (GPT Image 2), then Lite dark-theme crops/companions. After jobs, **report leftover credits**; user generates remaining art in ChatGPT and drops PNGs into `apps/desktop/public/`. Wire reused files into `public/` replacing the old navy `empty-state-hero.png` / `login-gate-hero.png`. D-25 still holds: no stock, no Cursor GenerateImage for in-app illustrations.
- **D-15:** UI copy is **German primary, English available** (login mockup is bilingual; STATE: i18n from day 1). No new translation framework beyond what the UI-SPEC needs to keep DE/EN strings for shell, gate, empty, errors.

### Motion & Splash
- **D-16:** Short splash on launch: **wordmark “Clared” + spinner**, then shell. No new Higgsfield splash generation. Existing `mockups/higgsfield/splash.png` may be used as atmosphere behind the wordmark if it fits without extra credits; otherwise typography-only. Keep it brief when `/me` is warm.
- **D-17:** Motion follows `docs/macos-ui-design-mit-tauri.md` §14 and ROADMAP: durations **<300ms**, custom ease-out, honor `prefers-reduced-motion`. Apply to sidebar selection, list+panel, tax rail updates, empty-state toggle. Brandkit press state `scale(0.97)` on primary buttons is in scope.
- **D-18:** In-app loading uses existing **skeletons** (`skeleton.tsx`) that match the layout, not a full-screen spinner (except the splash).
- **D-19:** Keep the **native OS titlebar** (`decorations` on, Phase 1 D-07). Do not build a custom titlebar even if mockups show one. — **Reversibility:** costly — Tauri window config + Windows/macOS chrome.

### Claude's Discretion
- Exact Amber hex and dark-theme HSL derived from `03-rechnung-dark.png` / `05-entities-dark.png`.
- Whether splash.png sits behind the wordmark or splash is type-only.
- Lite vs GPT Image 2 split after the login-gate hero is generated, as long as the 10-credit ceiling holds and leftovers are reported.
- shadcn radius stays 8px (already matches brandkit).
- Skeleton/error copy in DE with EN counterpart.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 4 visual SSOT
- `.planning/phases/04-premium-ui-brand-redesign/mockups/README.md` — inventory; which files are approved vs archive.
- `.planning/phases/04-premium-ui-brand-redesign/mockups/approved/` — 1:1 visual contract for in-scope screens (D-10–D-13).
- `.planning/phases/04-premium-ui-brand-redesign/mockups/higgsfield/` — reusable illustrations (empty invoices/entities, splash); logos unused (D-04).

### Product / phase scope
- `.planning/ROADMAP.md` — Phase 4 goal and success criteria (retitle Nordic → Crafted Minimal).
- `.planning/REQUIREMENTS.md` — UI-01 (mockup-first). Add BRAND-01 this phase (D-05).
- `.planning/PROJECT.md` — Tauri, mockup-first, paid SaaS locks.

### Desktop / native
- `docs/macos-ui-design-mit-tauri.md` — layout, type, color, motion §14, reduced-motion, native titlebar §5/§19, appearance §16.
- `.planning/phases/01-tauri-desktop-mockup-first-ui/01-CONTEXT.md` — D-01–D-08 shell; D-14–D-21 invoice canvas; D-24–D-28 empty + Higgsfield + PDF paper. D-09 dark-first is superseded by D-06.
- `.planning/phases/01-tauri-desktop-mockup-first-ui/01-UI-SPEC.md` — current screens to restyle, not to copy tokens from.
- `.planning/phases/02-self-hosted-backend-authentik-sso/02-CONTEXT.md` — D-33–D-39 login gate + session chip (no theme toggle on chip).
- `.planning/phases/02-self-hosted-backend-authentik-sso/02-UI-SPEC.md` — gate/chip contract; dark-only tokens superseded.
- `.planning/phases/03-entities-invoices-live-tax/03-CONTEXT.md` — list+panel, autosave, live tax rail; do not regress behavior.
- `.planning/phases/03-entities-invoices-live-tax/03-UI-SPEC.md` — live product screens; restyle only.

### Graphics
- Higgsfield CLI + `higgsfield-generate` skill — GPT Image 2 default; cost before create. Account: starter plan, 10 credits at discuss time.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/desktop/src/App.tsx` — `AppShell`, `NAV_ITEMS`, hash router. Restyle chrome; do not add nav items.
- `apps/desktop/src/auth/login-gate.tsx` + `session-chip.tsx` + `session-banner.tsx` — gate/chip/banner stay; new tokens + new gate hero.
- `apps/desktop/src/routes/{rechnung,entities,kunden,tax,pdf}.tsx` — product screens to restyle 1:1 to mockups.
- `apps/desktop/src/components/{invoice-empty-state,tax-rail,pdf-paper,line-item-card,skeleton,error-state,spinner}.tsx` — keep behavior, swap visuals.
- `packages/ui/src/styles/globals.css` — today forced dark HSL; split `:root` vs `.dark` per D-08.
- `apps/desktop/src/main.tsx` — `classList.add("dark")` at boot must become OS-follow + Darstellung override (D-06/D-07).
- `apps/desktop/public/empty-state-hero.png`, `login-gate-hero.png` — old navy art; replace with Crafted assets.

### Established Patterns
- React 19 + Vite + Tauri 2 + shadcn/Radix from `@clared/ui` + Tailwind v4 CSS-first tokens.
- Dense-but-calm (Phase 1 D-08). Hash router. Native `decorations`.
- Higgsfield PNGs as static `public/` assets, not runtime generation.
- PdfPaper uses inline light colors so theme tokens cannot invert paper (keep that technique).

### Integration Points
- Token rewrite in `packages/ui` flows to every screen — do this before per-route polish.
- Tauri menu plugin (or existing menu) for Darstellung — new; chip menu must not gain theme items.
- `prefers-reduced-motion` + OS appearance: listen to both; Darstellung override wins over OS for color, not for reduced-motion.

</code_context>

<specifics>
## Specific Ideas

- Brandkit essence line “Unseen details compound.” is optional empty-state/marketing copy, not a required heading.
- Button press `scale(0.97)` from the brandkit board is the intended click feel.
- Floating/minimal sidebar from entities mockups (whisper separator, not a heavy painted rail).
- Higgsfield empty-invoices still-life (oatmeal, charcoal bowl, sage spheres, scalloped paper) is the Empty visual language — wire `empty-invoices.png` rather than regenerating.
- User will ChatGPT any illustration the 10 credits cannot cover; planner should leave an obvious `public/` drop-in path.

</specifics>

<deferred>
## Deferred Ideas

- Onboarding / welcome (`10-onboarding.png`) — own phase; not a Phase 4 route.
- Settings page (`11-settings.png`) — Darstellung menu covers theme; no settings route.
- Profile page (`12-profile.png`) — chip stays identity+logout (Phase 2).
- Dashboard (`13-dashboard.png`), product catalog (`14-catalog.png`), DATEV export (`15-export.png`) — new capabilities, not a redesign of existing surfaces.
- Extra Higgsfield screen mockups for splash/error/Kunden (user preferred this, blocked by 10-credit cap).
- PDF binary download, audit trail UI, offline — Phase 5.
- Stripe/seats — `SAAS-01` / v2.
- Custom titlebar / hidden traffic-lights overlay.

</deferred>

---

*Phase: 4-Premium UI & Brand Redesign*
*Context gathered: 2026-08-23*
