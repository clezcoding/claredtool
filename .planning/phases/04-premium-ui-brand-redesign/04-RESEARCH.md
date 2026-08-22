# Phase 4: Premium UI & Brand Redesign - Research

**Researched:** 2026-08-23
**Domain:** Design-token system (Tailwind v4 CSS-first), Tauri 2 native menu + OS appearance, CSS motion, Higgsfield asset wiring
**Confidence:** HIGH (stack is entirely already-installed; new work is dual-theme tokens + one native menu + asset swaps)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Brand SSOT is **Crafted Minimal** (not "Nordic Calm Fintech"). Tokens, UI-SPEC, ROADMAP, Higgsfield prompts use this name. Retitle ROADMAP.
- **D-02:** Palette SSOT (`mockups/approved/01-brandkit.png`): Pure White `#FFFFFF`, Pale Oatmeal `#F7F7F5`, Deep Charcoal `#111110`, Muted Stone `#8A8A8A`, Soft Sage Green `#A8BFA3`. **Amber = sparse emphasis only** (warnings/rare), not a 5th brand color. Exact Amber hex is Claude discretion from dark Rechnung mockup.
- **D-03:** Typography = **system fonts only** (SF Pro macOS, Segoe UI Windows). No webfonts (Inter/Geist/serif rejected). Tabular numerals via `font-variant-numeric: tabular-nums` on money, not a second family.
- **D-04:** In-app mark = wordmark **"Clared" in the system font**. No generated logo / serif wordmark / C-monogram / star. `mockups/higgsfield/logo-*.png` archive only.
- **D-05:** Add requirement **BRAND-01** to `.planning/REQUIREMENTS.md` this phase: Crafted Minimal is the visual system (tokens + mockup SSOT + motion). UI-01 still requires mockup/UI-SPEC before code.
- **D-06:** Default appearance **follows OS**. Replaces Phase 1 D-09 (dark-first) from this phase on. Costly to reverse — every token + Higgsfield crop must work in both themes.
- **D-07:** In-app override in a native app menu **Darstellung** with Hell / Dunkel / System. **Not** in the session chip (Phase 2 D-36 stays). No Settings route.
- **D-08:** One component tree. Semantic CSS tokens swap Light/Dark (Tailwind v4 `@theme` / shadcn token slots in `packages/ui/src/styles/globals.css`). No duplicate components, no two CSS bundles.
- **D-09:** `PdfPaper` content stays **always light**. Surrounding stage follows app theme. Do not invert invoice numbers, do not force dark stage in Light mode.
- **D-10:** Visual SSOT `mockups/approved/`. Write **one** `04-UI-SPEC.md`, then code. Not page-by-page image gates.
- **D-11:** **Look is 1:1 to approved mockups.** Information architecture unchanged: sidebar Rechnung · Entities · Kunden · Tax · PDF; split invoice canvas; list+panel; compact line-item cards. Native window chrome is the exception (D-19).
- **D-12:** In-scope approved files: `01-brandkit.png` (tokens only; type/logo overridden by D-03/D-04), `02-rechnung-light.png`, `03-rechnung-dark.png`, `04-entities-light.png`, `05-entities-dark.png`, `06-tax-engine.png`, `07-pdf-viewer.png`, `08-login.png`, `09-empty-state.png`. **Kunden shares Entities mockups.** Splash/error have no screen mockup — derive from tokens + existing `error-state.tsx`/skeleton.
- **D-13:** Out-of-scope mockups (do not implement): `10-onboarding`, `11-settings`, `12-profile`, `13-dashboard`, `14-catalog`, `15-export`. `explorations/` are rejected — do not resurrect Nordic/glass/warm-editorial/corporate-teal.
- **D-14:** Higgsfield budget **10 Starter credits**. GPT Image 2 = 7 credits/image; Nano Banana 2 Lite = 1 credit. **Reuse** existing Crafted art (`empty-invoices.png`, `empty-entities.png`, `splash.png`) — do NOT spend GPT Image 2 duplicating Empty-State. Spend on the **missing Login-Gate hero** first (GPT Image 2), then Lite dark-theme crops. **Report leftover credits** after jobs; user generates remainder in ChatGPT and drops PNGs into `apps/desktop/public/`. Wire reused files into `public/` replacing old navy `empty-state-hero.png`/`login-gate-hero.png`. D-25 holds: no stock, no Cursor GenerateImage for in-app illustrations.
- **D-15:** UI copy **German primary, English available**. No new translation framework beyond what UI-SPEC needs for shell/gate/empty/errors.
- **D-16:** Short splash on launch: **wordmark "Clared" + spinner**, then shell. No new Higgsfield splash gen. Existing `splash.png` may sit behind wordmark if it fits without extra credits; else type-only. Keep brief when `/me` is warm.
- **D-17:** Motion follows `docs/macos-ui-design-mit-tauri.md` §14 + ROADMAP: durations **<300ms**, custom ease-out, honor `prefers-reduced-motion`. Apply to sidebar selection, list+panel, tax rail updates, empty-state toggle. Primary-button press `scale(0.97)` in scope.
- **D-18:** In-app loading uses existing **skeletons** (`skeleton.tsx`) matching layout, not full-screen spinner (except splash).
- **D-19:** Keep **native OS titlebar** (`decorations` on). Do not build custom titlebar even if mockups show one. Costly to reverse.

### Claude's Discretion
- Exact Amber hex + dark-theme HSL derived from `03-rechnung-dark.png`/`05-entities-dark.png`.
- Whether `splash.png` sits behind the wordmark or splash is type-only.
- Lite vs GPT Image 2 split after login-gate hero, as long as 10-credit ceiling holds and leftovers reported.
- shadcn radius stays 8px (matches brandkit).
- Skeleton/error copy in DE with EN counterpart.

### Deferred Ideas (OUT OF SCOPE)
- Onboarding (`10-onboarding.png`) — own phase.
- Settings page (`11-settings.png`) — Darstellung menu covers theme; no settings route.
- Profile page (`12-profile.png`) — chip stays identity+logout.
- Dashboard (`13`), catalog (`14`), DATEV export (`15`) — new capabilities, not redesign.
- Extra Higgsfield mockups for splash/error/Kunden — blocked by 10-credit cap.
- PDF binary download, audit-trail UI, offline — Phase 5.
- Stripe/seats — SAAS-01 / v2.
- Custom titlebar / hidden traffic-lights overlay.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | Every UI-bearing phase has interactive mockups / UI-SPEC before implementation | Satisfied: `mockups/approved/` (D-10–D-12) + `04-UI-SPEC.md` already approved (`shadcn_initialized: true`, preset `b0`). This phase codes to that contract. |
| BRAND-01 (new) | Crafted Minimal is the visual system (tokens + mockup SSOT + motion) | This research defines the token split, motion rules, and asset wiring that BRAND-01 codifies. Planner MUST add BRAND-01 to `REQUIREMENTS.md` (D-05) and to the traceability table (Phase 4). |
</phase_requirements>

## Summary

This is a **restyle + rebrand** phase over an existing, complete React 19 + Vite + Tauri 2 desktop app. **No new npm/cargo dependency is required** — every capability (dual-theme tokens, native menu, motion, static image assets) is served by what is already installed: Tailwind v4 CSS-first (`@theme` + `@custom-variant dark`), `@tauri-apps/api` ^2 (menu + event modules), `tw-animate-css` + plain CSS transitions, and `public/` PNGs. `[VERIFIED: apps/desktop/package.json:13-39; packages/ui/package.json:12-29]`

Three concrete pieces of new engineering: (1) **rewrite `packages/ui/src/styles/globals.css`** — it is currently forced-dark navy (`--background: hsl(222 47% 11%)` under a shared `:root, .dark` block) with `--font-sans: Inter`; it must split into a light `:root` block (White/Oatmeal/Charcoal/Sage) and a `.dark` block (Charcoal), drop Inter for a system stack, and add tabular-nums for money. (2) **theme control**: replace the unconditional `document.documentElement.classList.add("dark")` in `apps/desktop/src/main.tsx` with an OS-follow + persisted-override initializer, and add a **Darstellung** native menu built entirely in TypeScript via `@tauri-apps/api/menu` (no Rust change strictly needed). (3) **asset swap**: copy `mockups/higgsfield/{empty-invoices,empty-entities,splash}.png` into `apps/desktop/public/`, replace the two old navy heroes, and generate the one missing Login-Gate hero with GPT Image 2 (7 of 10 credits), then report the ~3 leftover.

The bulk of the phase is mechanical: re-skin ~17 existing `.tsx` files (5 routes, 9 components, 3 auth) to match `mockups/approved/` 1:1 using the new tokens. Do the token rewrite first — it flows to every screen — then per-route polish.

**Primary recommendation:** Wave 1 = token rewrite in `packages/ui` + theme init/menu wiring (blocks everything). Wave 2 = per-surface restyle to the mockups + motion + asset wiring, parallelizable by route.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dual-theme color tokens | Browser / Client (CSS in `@clared/ui`) | — | Tailwind v4 CSS-first tokens resolve at render; `.dark` class toggles the cascade. Pure webview concern. |
| OS appearance detection | Browser / Client (`matchMedia`) | Native (Tauri `theme()` fallback) | WebView inherits OS color-scheme; `window.matchMedia('(prefers-color-scheme: dark)')` is the lazy, correct source. Native API is redundant. |
| Darstellung override menu | Native (Tauri menu) → Browser (apply) | — | Menu is an OS-native control (D-07); selection dispatched to webview which owns the `.dark` class + persistence. |
| Theme persistence | Browser / Client (`localStorage`) | — | Non-secret single value; no Rust/keychain needed. Keychain is for the session token only. |
| `prefers-reduced-motion` | Browser / Client (CSS `@media` + `matchMedia`) | — | Pure CSS/JS media query; already used in `spinner.tsx`. |
| Motion / transitions | Browser / Client (CSS) | — | `<300ms` CSS transitions + `tw-animate-css`; no JS animation lib. |
| Illustration / splash assets | CDN / Static (`public/`) | — | Higgsfield PNGs shipped as static assets (D-14), never runtime-generated. |
| Native titlebar | Native (Tauri `decorations`) | — | `decorations: true` stays (D-19); no custom chrome. |

## Standard Stack

### Core (all already installed — no install step)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | ^4.1.13 | CSS-first design tokens (`@theme`, `@custom-variant`) | Already the token engine; `globals.css` uses `@import "tailwindcss"` + `@custom-variant dark (&:is(.dark *))`. `[VERIFIED: packages/ui/src/styles/globals.css:1-5]` |
| @tailwindcss/vite | ^4.1.13 | Tailwind Vite plugin | Already wired. `[VERIFIED: apps/desktop/package.json:27]` |
| shadcn | ^4.18.0 | Component slots (badge/button/card/input/select/…) | UI-SPEC preset `b0`, `shadcn_initialized: true`. `[VERIFIED: 04-UI-SPEC.md:5,21-24,106]` |
| radix-ui / @base-ui/react | ^1.6.7 / ^1.7.0 | Primitives behind shadcn | `[VERIFIED: packages/ui/package.json:13,17]` |
| tw-animate-css | ^1.4.0 | Utility keyframe/animation classes | Already imported (`@import "tw-animate-css"`). Covers enter/exit + fades for reduced-motion fallback. `[VERIFIED: packages/ui/src/styles/globals.css:2]` |
| @tauri-apps/api | ^2 | `menu` (Darstellung) + `event` (menu→webview) modules | Already a dep; menu is core, no plugin needed. `[VERIFIED: apps/desktop/package.json:15]` `[CITED: tauri-apps/tauri-docs learn/window-menu.mdx]` |
| lucide-react | ^1.31.0 | Icon set (nav + controls) | Already used in `App.tsx`. `[VERIFIED: apps/desktop/package.json:19; App.tsx:1-7]` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tauri-apps/plugin-os | ^2.3.2 | OS platform info | Only if a platform-specific tweak is needed; theme detection does NOT need it (use `matchMedia`). `[VERIFIED: apps/desktop/package.json:18]` |
| higgsfield CLI | homebrew (`/opt/homebrew/bin/higgsfield`) | Generate the one Login-Gate hero | GPT Image 2 (`gpt_image_2`). `[VERIFIED: shell command -v higgsfield]` `[CITED: higgsfield-generate skill]` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS transitions + tw-animate-css | framer-motion / motion | REJECT — adds a dependency for <300ms micro-interactions CSS already does; violates lazy/YAGNI. |
| `matchMedia` for OS theme | Tauri `getCurrentWindow().theme()` + `onThemeChanged` | Both work; `matchMedia` is fewer moving parts and runs purely in the webview. Keep Tauri API only as a documented fallback. |
| Native menu built in Rust | Menu built in TS via `@tauri-apps/api/menu` with `action` callbacks | TS is lazier (no Rust edit, no rebuild loop); the app currently sets **no** custom menu, so TS `setAsAppMenu()` is clean. `[CITED: tauri-apps/tauri-docs learn/window-menu.mdx]` |
| `localStorage` theme persistence | tauri-plugin-store | Store plugin is overkill for one enum; localStorage survives across launches in the webview. |

**Installation:** None. If the planner chooses the Rust-side menu variant instead of TS, no new crate is needed either — `tauri::menu` is in the core `tauri` crate already present (`tauri = { version = "2" }`). `[VERIFIED: apps/desktop/src-tauri/Cargo.toml:17]`

## Package Legitimacy Audit

**No external packages are installed in this phase.** All libraries are pre-existing and version-pinned in the repo's `package.json` / `Cargo.toml` (read this session). The Package Legitimacy Gate is **not applicable** — no registry lookup, no SLOP/SUS risk introduced.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
                       OS appearance (light/dark)
                                 │
                                 ▼
   ┌───────────────────────────────────────────────────────┐
   │  main.tsx  theme initializer (runs before React mount) │
   │   read localStorage["clared-theme"]  (light|dark|system)│
   │   default = "system"                                    │
   └───────────────┬───────────────────────────┬────────────┘
                   │ mode=system                │ mode=light/dark
                   ▼                            ▼
     matchMedia('(prefers-color-scheme: dark)')  explicit
                   │                            │
                   └──────────► resolve ◄───────┘
                                 │
                                 ▼
            document.documentElement.classList.toggle("dark")
                                 │
                                 ▼
        Tailwind cascade: :root (light) vs .dark (dark)  ── globals.css
                                 │
                                 ▼
        every screen (App shell, routes, components, PdfPaper stage)


   Darstellung native menu (Tauri) ──action──► set localStorage + re-resolve + toggle .dark
   OS theme change event (matchMedia 'change') ──► re-resolve ONLY when mode=system
   prefers-reduced-motion  ──► CSS @media + matchMedia (independent; OS always wins, D-17)
```

### Recommended Project Structure (files touched — no new folders)
```
packages/ui/src/styles/
└── globals.css              # REWRITE: split :root(light)/.dark, system font, tabular-nums, Crafted palette

apps/desktop/src/
├── main.tsx                 # REWRITE boot: OS-follow + persisted override (replaces classList.add("dark"))
├── App.tsx                  # restyle shell chrome; build Darstellung menu (or a lib/theme-menu.ts); DO NOT add nav items
├── (new) lib/theme.ts       # small helper: resolveTheme(), applyTheme(), THEME_KEY  (optional, keeps main.tsx lean)
├── auth/{login-gate,session-chip,session-banner}.tsx   # restyle + new login-gate hero; chip gains NO theme item (D-07)
├── routes/{rechnung,entities,kunden,tax,pdf}.tsx        # restyle 1:1 to mockups
└── components/{invoice-empty-state,tax-rail,pdf-paper,line-item-card,skeleton,error-state,spinner,create-disabled-button,session-*}.tsx
apps/desktop/public/
├── login-gate-hero.png      # REPLACE (old navy) → new Crafted GPT Image 2 hero
├── empty-state-hero.png     # REPLACE (old navy) → copy of higgsfield/empty-invoices.png
├── (new) empty-entities.png # copy from mockups/higgsfield/
└── (new) splash.png         # copy from mockups/higgsfield/ (optional splash atmosphere, D-16)
```

### Pattern 1: Tailwind v4 CSS-first dual-theme split
**What:** Keep the existing `@theme inline` alias block (maps `--color-*` → `var(--*)`); split the raw HSL values into a light `:root` and a dark `.dark`. The `@custom-variant dark (&:is(.dark *))` is already present and correct — keep it.
**When to use:** Now — this is the token rewrite that unblocks every screen.
**Example (shape; exact dark HSL is Claude discretion from the dark mockups — see Assumptions A1/A2):**
```css
/* Source pattern: existing globals.css @theme inline block is reused verbatim */
:root {
  /* Crafted Minimal — Light */
  --background: #ffffff;          /* Pure White  D-02 */
  --card:       #f7f7f5;          /* Pale Oatmeal D-02 */
  --sidebar:    #f7f7f5;
  --foreground: #111110;          /* Deep Charcoal D-02 */
  --muted-foreground: #8a8a8a;    /* Muted Stone D-02 */
  --accent:     #a8bfa3;          /* Soft Sage Green D-02 */
  --accent-foreground: #111110;
  --destructive: <amber-hex>;     /* [ASSUMED A1] sparse emphasis only */
  --border: <oatmeal-darker>;
  --radius: 8px;                  /* D: shadcn radius stays 8px */
}
.dark {
  /* Crafted Minimal — Dark (derive HSL from 03-rechnung-dark.png / 05-entities-dark.png) */
  --background: #111110;          /* Deep Charcoal */
  --card:       <charcoal-raise>; /* [ASSUMED A2] */
  --foreground: #f7f7f5;
  --muted-foreground: #8a8a8a;
  --accent:     #a8bfa3;
  --accent-foreground: #111110;
  --destructive: <amber-hex>;
  --border: <charcoal-hairline>;  /* "whisper separator" not a heavy rail (specifics) */
  --radius: 8px;
}
```
**Note:** current file uses HSL (`hsl(222 47% 11%)`); either keep HSL or switch to hex — Tailwind v4 accepts any CSS color in the var. Money elements add `font-variant-numeric: tabular-nums` (D-03), e.g. a `.tabular-nums` utility or applied on `netto`/totals in `line-item-card.tsx`/`tax-rail.tsx`.

### Pattern 2: Boot-time theme initializer (replaces `classList.add("dark")`)
**What:** Resolve theme before React mounts to avoid a flash. Persist in `localStorage`.
```ts
// apps/desktop/src/lib/theme.ts  (new, ~15 lines)
export const THEME_KEY = "clared-theme";
export type ThemePref = "light" | "dark" | "system";

export function resolveDark(pref: ThemePref): boolean {
  if (pref === "system")
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  return pref === "dark";
}
export function applyTheme(pref: ThemePref): void {
  localStorage.setItem(THEME_KEY, pref);
  document.documentElement.classList.toggle("dark", resolveDark(pref));
}
export function currentPref(): ThemePref {
  return (localStorage.getItem(THEME_KEY) as ThemePref) ?? "system";
}
```
```ts
// apps/desktop/src/main.tsx — replaces line 6 (document.documentElement.classList.add("dark"))
import { applyTheme, currentPref, resolveDark } from "./lib/theme";
applyTheme(currentPref());
// re-resolve on OS change ONLY while in system mode
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (currentPref() === "system")
    document.documentElement.classList.toggle("dark", resolveDark("system"));
});
```

### Pattern 3: Darstellung native menu in TypeScript (Tauri v2)
**What:** Build a submenu with three `CheckMenuItem`s; `action` callback applies + persists; keep the checkmarks in sync. No Rust edit.
```ts
// Source: tauri-apps/tauri-docs learn/window-menu.mdx  [CITED]
import { Menu, Submenu, CheckMenuItem, PredefinedMenuItem } from "@tauri-apps/api/menu";
import { applyTheme, currentPref, type ThemePref } from "./lib/theme";

async function buildAppMenu() {
  const mk = (id: ThemePref, text: string) =>
    CheckMenuItem.new({
      id, text, checked: currentPref() === id,
      action: async () => { applyTheme(id); await syncChecks(); },
    });
  const hell = await mk("light", "Hell");
  const dunkel = await mk("dark", "Dunkel");
  const system = await mk("system", "System");
  const darstellung = await Submenu.new({ text: "Darstellung", items: [hell, dunkel, system] });
  // include a default app submenu (Quit/Edit) on macOS so nothing is lost when replacing the menu
  const menu = await Menu.new({ items: [darstellung] });
  await menu.setAsAppMenu();
  async function syncChecks() {
    await hell.setChecked(currentPref() === "light");
    await dunkel.setChecked(currentPref() === "dark");
    await system.setChecked(currentPref() === "system");
  }
}
```
**When to use:** Call once after React mount (or in `main.tsx` after `applyTheme`). Only for the `main` window (login window has no menu need).

### Pattern 4: Motion — CSS transitions, <300ms, reduced-motion (D-17)
```css
/* one custom ease-out token; durations <300ms */
:root { --ease-out: cubic-bezier(0.22, 1, 0.36, 1); --dur: 180ms; }   /* [ASSUMED A3] values are docs-compliant defaults */
.nav-item, .list-row, .tax-rail-value { transition: background-color var(--dur) var(--ease-out),
                                                     color var(--dur) var(--ease-out); }
.btn-primary:active { transform: scale(0.97); }   /* brandkit press feel, D-17 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 1ms !important; animation-duration: 1ms !important; }
  .btn-primary:active { transform: none; }
}
```
Reuse the existing `spinner.tsx` pattern (already gates `animate-spin` on `prefers-reduced-motion`). `[VERIFIED: apps/desktop/src/components/spinner.tsx:2-10]`

### Anti-Patterns to Avoid
- **Two CSS bundles / duplicate Light+Dark components** — violates D-08. One tree, token swap only.
- **Inverting `PdfPaper`** — it uses inline `#fff/#111` on purpose; do not tokenize its content (D-09). `[CITED: STATE.md:94]`
- **Putting the theme toggle on the session chip** — D-07/Phase 2 D-36 forbid it; chip = identity + logout only.
- **Adding nav items or routes** — IA is frozen (D-11); restyle only.
- **Adding a webfont** — D-03 system fonts only; remove `--font-sans: Inter` and the `body { font-family: Inter … }`.
- **JS animation library** — CSS covers <300ms micro-interactions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark/light switching | Custom context + inline style objects | `.dark` class + CSS token cascade (already scaffolded) | `@custom-variant dark` + `@theme inline` already present; one `classList.toggle` drives everything. |
| OS appearance detection | Polling / Rust IPC | `window.matchMedia('(prefers-color-scheme: dark)')` + `change` listener | Native browser API, zero deps. |
| Native menu | Hand-rolled HTML menubar (would need custom titlebar, breaks D-19) | `@tauri-apps/api/menu` | Real OS menu, keeps native decorations. |
| Reduced-motion | Per-component JS checks everywhere | Global `@media (prefers-reduced-motion: reduce)` + existing spinner pattern | One CSS block covers the app. |
| Enter/exit fades | Custom keyframes | `tw-animate-css` utilities (already imported) | Present dependency. |
| Illustrations | Runtime generation / Cursor GenerateImage | Static PNGs in `public/` (Higgsfield/ChatGPT) | D-14/D-25; deterministic, no build cost. |

**Key insight:** The repo already committed to Tailwind v4 CSS-first tokens and a `.dark` class variant; the "new" theme system is finishing a half-built pattern, not introducing one.

## Runtime State Inventory

> Rebrand/restyle phase — mostly code + static assets, minimal runtime state. Explicitly checked:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **None** — no DB rows store "Nordic"/theme; theme is not persisted anywhere yet (`main.tsx` hard-codes dark). Verified by reading `main.tsx:6`. | Add new `localStorage["clared-theme"]` key (code edit only; no migration — no prior value exists). |
| Live service config | **None** — no external service embeds the brand string. | none |
| OS-registered state | Tauri window `title: "Clared"`, `productName: "Clared"`, bundle `identifier: com.clared.app` already say "Clared" (not "Nordic"). `[VERIFIED: tauri.conf.json:3-5,16]` | none — brand name unchanged; only the visual system changes. |
| Secrets / env vars | Keychain `com.clared.app`/`session` holds the session token only — untouched by this phase. `[VERIFIED: lib.rs:7-8]` | none |
| Build artifacts / assets | `apps/desktop/public/empty-state-hero.png`, `login-gate-hero.png` are old navy art (dated Aug 22). `[VERIFIED: shell ls apps/desktop/public/*.png]` | Replace both; add `empty-entities.png`, `splash.png`. Static-asset swap, not a data migration. |

**Canonical question — after every file is updated, what runtime state still holds the old look?** Only the two old navy PNGs in `public/` (replaced) and the hard-coded dark class in `main.tsx` (rewritten). No datastore, no OS registration, no secret carries the old visual system.

## Common Pitfalls

### Pitfall 1: Theme flash on launch (FOUC)
**What goes wrong:** React mounts in the wrong theme, then snaps.
**Why:** `.dark` toggled after first paint.
**How to avoid:** Resolve + `classList.toggle` in `main.tsx` **before** `ReactDOM.createRoot(...).render` (the existing code already runs the class mutation pre-render at line 6 — keep that ordering).
**Warning signs:** brief white/dark flicker at splash.

### Pitfall 2: `prefers-reduced-motion` overridden by Darstellung
**What goes wrong:** Treating reduced-motion as a "theme" and letting the override win.
**Why:** Conflating two independent axes.
**How to avoid:** Darstellung override wins for **color only**; reduced-motion is **always** OS-driven (D-17). Keep them in separate code paths — never gate motion on the color pref.

### Pitfall 3: Menu ACL / permission error at runtime
**What goes wrong:** `Menu.new` / `setAsAppMenu` throws a permission-denied from the webview.
**Why:** Tauri v2 gates core commands via capabilities. `default.json` grants `core:default` which bundles `core:menu:default` + `core:app:default`. `[VERIFIED: apps/desktop/src-tauri/capabilities/default.json:6-15]`
**How to avoid:** `core:default` normally covers menu building; **if** a runtime ACL error appears, add explicit `core:menu:default` / `core:app:allow-set-app-menu` to `default.json`. Verify in the plan's manual UAT (menu appears + toggles).
**Warning signs:** console error mentioning `menu.new` or `app.set_app_menu` not allowed.

### Pitfall 4: PdfPaper accidentally themed
**What goes wrong:** Replacing inline `#fff/#111` with tokens inverts the invoice in dark mode.
**How to avoid:** Leave `pdf-paper.tsx` content colors inline; only the surrounding stage uses tokens (D-09).

### Pitfall 5: Higgsfield over-spend
**What goes wrong:** Regenerating empty-state (7 credits) leaves <3 for anything else.
**How to avoid:** Reuse `empty-invoices.png`/`empty-entities.png`/`splash.png` (0 credits); spend GPT Image 2 (7) on the **login-gate hero only**; run `higgsfield generate cost gpt_image_2 …` before `create`; report leftover (~3 credits → Nano Banana Lite crops or ChatGPT hand-off). `[CITED: higgsfield-generate skill; D-14]`

## Code Examples

### Existing `@theme inline` alias block to REUSE verbatim (do not rewrite the aliases, only the raw values)
```css
/* Source: packages/ui/src/styles/globals.css:10-33 (VERIFIED this session) */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-primary: var(--primary);
  --color-accent: var(--accent);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
  /* … */
}
```

### Current values to REPLACE (proof of the forced-dark navy problem)
```css
/* Source: packages/ui/src/styles/globals.css:11,35-56 (VERIFIED) — THIS is what changes */
--font-sans: Inter, ui-sans-serif, system-ui, sans-serif;   /* → drop Inter (D-03) */
:root, .dark {                                              /* → split into :root and .dark */
  --background: hsl(222 47% 11%);   /* navy, not Charcoal */
  --primary:    hsl(217 91% 60%);   /* blue, not Sage */
  --accent:     hsl(217 91% 60%);   /* blue, not Sage #A8BFA3 */
}
```

### System font stack (replaces Inter, D-03)
```css
:root { --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }
body { font-family: var(--font-sans); font-size: 14px; font-weight: 400; line-height: 1.5; }
.money { font-variant-numeric: tabular-nums; }   /* apply to netto/totals (D-03) */
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phase 1 D-09 dark-first, no light theme | D-06 OS-follow, both themes | Phase 4 | `globals.css` must split `:root`/`.dark`; `main.tsx` must stop forcing dark. |
| Nordic Calm Fintech (navy/blue) | Crafted Minimal (Oatmeal/Charcoal/White/Sage) | Phase 4 (D-01) | Full palette rewrite; ROADMAP retitle. |
| Inter webfont in tokens | System fonts only (D-03) | Phase 4 | Remove `--font-sans: Inter` + body Inter. |
| Tailwind v3 `tailwind.config` `darkMode:'class'` | Tailwind v4 `@custom-variant dark (&:is(.dark *))` | already in repo | Keep — `.dark` class approach unchanged. `[VERIFIED: globals.css:5]` |

**Deprecated/outdated:** the navy HSL token set and `Inter` font in `globals.css` — fully superseded this phase.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Exact **Amber hex** for `--destructive` (sparse emphasis) | Pattern 1 / globals.css | Wrong shade → off-brand warnings; low risk, D-02 grants discretion, derive from `03-rechnung-dark.png`. |
| A2 | **Dark-theme raised-surface / border HSL** (card, hairline) | Pattern 1 | Wrong contrast in dark mode; derive by sampling `03-rechnung-dark.png` / `05-entities-dark.png` (D-02 discretion). |
| A3 | Motion `--dur: 180ms` + `cubic-bezier(0.22,1,0.36,1)` ease-out | Pattern 4 | Feels off; any value <300ms with an ease-out satisfies D-17. Tune against mockup feel. |
| A4 | `core:default` capability already permits JS menu build | Pitfall 3 | If not, add `core:menu:default`; caught at first run / UAT. |
| A5 | ~3 credits remain after GPT Image 2 login-gate hero (7 of 10) | Env / Pitfall 5 | Overspend if a retry is needed; mitigate by `generate cost` before `create` and reporting leftover. |

## Open Questions

1. **Login-window (`login-init.html`) brand treatment**
   - What we know: the Authentik login runs in a separate Tauri webview seeded by `src-tauri/login-init.html` (include_str, data URL). `[VERIFIED: lib.rs:74,151]`
   - What's unclear: whether its spinner/background should get Crafted styling this phase (it is Rust-embedded HTML, outside the React tree).
   - Recommendation: minimal — match splash colors in `login-init.html` if trivial; otherwise leave (login gate `login-gate.tsx` is the branded surface). Treat as optional polish, not a gate.

2. **Where to instantiate the Darstellung menu**
   - What we know: menu is `main`-window-scoped; `App.tsx` mounts the shell.
   - Recommendation: build once in `main.tsx` (after `applyTheme`) or a `lib/theme-menu.ts` called from `AuthenticatedApp` mount; keep out of render loop.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| higgsfield CLI | Login-Gate hero (D-14) | ✓ | `/opt/homebrew/bin/higgsfield`, starter plan **10 credits** | User generates in ChatGPT, drops PNG into `public/` |
| GPT Image 2 model | Login-Gate hero | ✓ (`gpt_image_2`, 7 credits) | via CLI | Nano Banana Lite (1cr) or ChatGPT |
| Reusable Crafted PNGs | Empty states + splash | ✓ `empty-invoices.png`, `empty-entities.png`, `splash.png` present | `mockups/higgsfield/` | — |
| Node/pnpm + Vite/Tauri toolchain | Build/dev | ✓ (repo already builds; Phase 1–3 complete) | pnpm workspace | — |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** any illustration beyond the 10-credit budget → ChatGPT hand-off into `apps/desktop/public/` (D-14 specifies an obvious drop-in path).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.10 + @testing-library/react ^16.3.0 + jsdom ^30 `[VERIFIED: apps/desktop/package.json:29,30,36,38]` |
| Config file | none dedicated found — vitest config likely inline/`vite.config` (Wave 0: confirm/add if missing) |
| Quick run command | `pnpm --filter desktop test` (maps to `vitest run`) `[VERIFIED: apps/desktop/package.json:11]` |
| Full suite command | `pnpm --filter desktop test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BRAND-01 | `applyTheme("dark")` toggles `.dark` on `documentElement`; `"light"` removes it | unit | `pnpm --filter desktop test theme` | ❌ Wave 0 (`lib/theme.ts` new) |
| BRAND-01 | `resolveDark("system")` follows `matchMedia` mock | unit | `pnpm --filter desktop test theme` | ❌ Wave 0 |
| BRAND-01 | persisted pref survives reload (localStorage read on `currentPref`) | unit | `pnpm --filter desktop test theme` | ❌ Wave 0 |
| D-17 | reduced-motion: spinner drops `animate-spin` when `matchMedia` reduce=true | unit | `pnpm --filter desktop test spinner` | ⚠️ behavior exists (`spinner.tsx`), add assertion if untested |
| UI-01 | screens render mockup-matching structure (smoke render of each route) | unit/smoke | `pnpm --filter desktop test` | partial — restyle should not break existing route tests |

### Sampling Rate
- **Per task commit:** `pnpm --filter desktop test <changed-area>`
- **Per wave merge:** `pnpm --filter desktop test` (full)
- **Phase gate:** full suite green + manual UAT (menu appears, Hell/Dunkel/System switch live, no FOUC, PdfPaper stays light in dark mode) before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `apps/desktop/src/lib/theme.test.ts` — covers BRAND-01 theme resolve/apply/persist (mock `matchMedia` + `localStorage`).
- [ ] Confirm a vitest config exists (jsdom env for `matchMedia`/`localStorage`); add if missing.
- [ ] Optional: assertion for `spinner.tsx` reduced-motion branch if not already covered.

## Security Domain

> `security_enforcement: true`, ASVS level 1, block-on high. This is a **UI restyle with no new attack surface**; existing auth/session/CSP from Phase 2 are untouched.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no (untouched) | Phase 2 Authentik OIDC — not modified |
| V3 Session Management | no (untouched) | Keychain token, Phase 2 — not modified |
| V4 Access Control | no | — |
| V5 Input Validation | minor | Existing invoice/entity form inputs (`line-item-card.tsx` numeric coercion `Number(...)||0`) — restyle must not remove validation. `[VERIFIED: line-item-card.tsx:65,89]` |
| V6 Cryptography | no | none introduced |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| localStorage theme value tampered | Tampering | Value is a non-secret enum (`light\|dark\|system`); validate on read (`?? "system"`, cast guarded) — no privilege attached. |
| Malicious image asset | Tampering | Only first-party PNGs from `public/`; no remote/runtime image loading (D-25). |
| Menu action injecting behavior | Elevation | Menu actions call local pure functions only; no eval, no IPC to privileged commands beyond existing keychain (unchanged). |

**No high/critical items** — nothing to block on.

## Sources

### Primary (HIGH confidence)
- Repo files read this session (VERIFIED): `packages/ui/src/styles/globals.css`, `apps/desktop/src/main.tsx`, `App.tsx`, `spinner.tsx`, `line-item-card.tsx`, `apps/desktop/package.json`, `packages/ui/package.json`, `src-tauri/{tauri.conf.json,Cargo.toml,src/lib.rs,capabilities/default.json}`, `.planning/config.json`.
- `tauri-apps/tauri-docs` `learn/window-menu.mdx`, `develop/calling-rust.mdx`, `start/migrate/from-tauri-1.mdx` (Context7) — menu build, `on_menu_event`, `emitTo` (CITED).
- `higgsfield account status` (VERIFIED: starter plan, 10 credits) + `command -v higgsfield` (VERIFIED path).

### Secondary (MEDIUM confidence)
- `higgsfield-generate` skill — `gpt_image_2` default, `generate cost`/`create --wait` (CITED).
- `docs/macos-ui-design-mit-tauri.md` §11/§14/§16 — color roles, motion principles, appearance (CITED; note §14 gives principles, the `<300ms`/`scale(0.97)` numbers come from CONTEXT D-17 + brandkit).

### Tertiary (LOW confidence)
- Exact Amber hex / dark-theme HSL (A1/A2) — to be sampled from approved dark mockups; not verified pixel-wise this session.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every lib read from committed manifests; nothing to install.
- Architecture (token split, theme init, menu, motion): HIGH — patterns confirmed against repo state + Tauri docs.
- Pitfalls: HIGH — derived from actual file contents (forced-dark class, PdfPaper inline colors, capabilities).
- Exact color/motion values: LOW — Claude discretion, derive from mockups (A1–A3).

**Research date:** 2026-08-23
**Valid until:** 2026-09-22 (stable stack; re-verify Tauri menu API only if `@tauri-apps/api` majors)
