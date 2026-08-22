# Phase 2 — UI Review

**Audited:** 2026-08-22
**Baseline:** `02-UI-SPEC.md` (approved 2026-08-21)
**Screenshots:** captured (Vite `localhost:5174`; unsigned gate). Chip, banners, and login WebView not painted (browser has no Tauri keychain). Paths: `.planning/ui-reviews/02-20260822-073223/{desktop,mobile,tablet}.png`

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | Gate/banner/chip strings match the contract; no OSS/free/Logout English |
| 2. Visuals | 3/4 | Gate hierarchy holds; Abmelden has no focus ring; badge refuses wrap |
| 3. Color | 3/4 | Tokens match 60/30/10; Abmelden keyboard focus fills accent |
| 4. Typography | 3/4 | Display/Body/Label sizes land; Badge and Rolle primitives still default `font-medium` |
| 5. Spacing | 2/4 | Abmelden under 44px; banner stacks `p-4` on Card `p-4` |
| 6. Experience Design | 2/4 | Window close and 60s timeout never show cancel banner |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **Login close / ticket timeout never sets cancel banner** — User dismisses Anmelden or waits out the 60s ticket and gets no „Anmeldung abgebrochen“ (D-20, E12, E17). **Fix:** On login-window `Destroyed`/`CloseRequested` without a ticket, and on a 60s timer after `open_login_window`, set `bannerKind: "cancel"` in `session-provider.tsx`. Do not auto-reopen the window.

2. **Abmelden misses 44px hit target, ring, and accent ban** — Menu row is `py-1` (~24–32px), `outline-hidden`, `focus:bg-accent`. Keyboard users get a tiny, accent-filled control the contract forbids. **Fix:** On that `DropdownMenuItem` add `min-h-11 font-normal focus:bg-muted focus:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` (keep default variant, not `destructive`).

3. **Banner padding doubled** — Wrapper `p-4` plus Card `p-4` yields 32px, not the declared md 16px. Banner reads as a padded card inside another pad, heavier than recovery chrome. **Fix:** Drop the wrapper `p-4` (keep `sticky top-0 z-10`) or pass `className="p-0 shadow-sm"` on Card and keep one 16px pad + `gap-2`.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

Contract strings are present and exact. No OSS / kostenlos / free / self-host / Profile / Billing / English Logout / Überall abbrechen in UI copy (`onLogout` is an identifier only).

| Element | Spec | Found |
|---------|------|-------|
| Gate h1 | Clared | `login-gate.tsx:36` |
| Gate body | Anmelden, um Rechnungen zu stellen. | `login-gate.tsx:38` |
| Gate / banner CTA | Anmelden | `login-gate.tsx:46`, `session-banner.tsx:35` |
| 401 | Sitzung abgelaufen. Bitte erneut anmelden. | `session-banner.tsx:26` |
| Cancel | Anmeldung abgebrochen | `session-banner.tsx:27` |
| Rolle prefix | Rolle: | `session-chip.tsx:57` |
| Logout | Abmelden | `session-chip.tsx:59` |
| Boot / login-init | Wird geladen | `spinner.tsx:12`, `login-init.html:56` |
| Network | Phase 1 ErrorState + Erneut versuchen | `error-state.tsx:8-17` |
| Window title | Anmelden | `lib.rs:131`, `login-init.html:9` |

German badge map locked in `session-chip.tsx:13-21` (Plattform … Ansicht).

**WARNING (path, not wording):** Cancel copy exists in the component but the close/timeout path never mounts it (see pillar 6). Not a copy defect.

### Pillar 2: Visuals (3/4)

**What holds (screenshots + code):**
- Unsigned gate is full-viewport `bg-background`, no AppShell, one CTA. Desktop/tablet/mobile captures show hero → Display „Clared“ → muted body → accent Anmelden. Left-aligned stack inside centered `max-w-xl` column matches the contract (column centered, not `text-center`).
- Hero is `/login-gate-hero.png`, `alt=""`, `rounded-md`. Paint matches the locked prompt (folio + keyhole glow, no people/letters/logo/chrome).
- Chip is sidebar `mt-auto`, `bg-card`, no avatar, no extra shadow. Accessible name = display name (`aria-label` + `aria-haspopup="menu"`).
- Banners live in `<main>` / gate column, not over the nav.
- Login stage is dark `hsl(222 47% 11%)` + 16×16 spinner; no Clared marketing in that window.
- Gate CTA autofocus shows the specified `focus-visible` ring (visible on desktop screenshot as a light-blue edge).

**WARNING — Abmelden has no visible focus ring.** `DropdownMenuItem` uses `outline-hidden` and no `ring-ring` (`dropdown-menu.tsx:73-74`). Spec Focus row requires the same ring on Abmelden as gate/chip (`02-UI-SPEC.md` Color/Focus). Keyboard path D-39 is incomplete.

**WARNING — Badge will not wrap.** Official Badge CVA is `whitespace-nowrap overflow-hidden` (`badge.tsx:8`). Chip adds `shrink-0`. Spec E13/E16: badge stays Label 12px and wraps to the next line / inside the badge for unknown `primaryRole`. Long raw values ellipsis-clip instead.

**WARNING — Dropdown primitive radius/shadow vs contract.** `DropdownMenuContent` defaults `rounded-lg shadow-md` (`dropdown-menu.tsx:44`). Call site adds `rounded-md` (`session-chip.tsx:56`) which should win via `cn`, but the primitive still introduces 12px radius (`--radius-lg`) the spec forbade as a new radius. Spec: dropdown uses `rounded-md` (8px).

### Pillar 3: Color (3/4)

Live tokens in `apps/desktop/src/styles/globals.css:34-51` match the contract HSL (dominant 222 47% 11%, secondary 217 33% 17%, accent 217 91% 60%, destructive 0 84% 60%). Dark-only `:root` and `.dark` share the same values. `login-init.html` hardcodes the same dominant HSL (allowed: no Tailwind in that document).

Accent usage on Phase 2 surfaces:
- Gate CTA: `@clared/ui` Button default `bg-primary` — reserved. Count: 1.
- Banner CTA: same — reserved. Count: 1.
- Active nav: `bg-accent` — Phase 1 inherit. Count: 1.
- Chip: `bg-card text-foreground hover:bg-muted` — not accent.
- Badge: `variant="secondary"` — not `default` (accent).

**WARNING — Abmelden keyboard/hover fill is accent.** `DropdownMenuItem` `focus:bg-accent focus:text-accent-foreground` (`dropdown-menu.tsx:74`). Spec Button table: menu Abmelden is default, **not accent fill**. Color reserved list: do not put accent on Abmelden.

**WARNING — Badge default variant is still accent.** CVA `default: bg-primary` (`badge.tsx:12`). Chip overrides to `secondary`. Any future Badge without `variant="secondary"` would violate the 10% cap.

Phase 2 `bg-primary` / `text-primary` / `border-primary` in new files: none besides inherited Button. Hardcoded hex in `apps/desktop/src` TSX: none (PDF paper `border-black/20` is Phase 1).

### Pillar 4: Typography (3/4)

Phase 2 surfaces vs contract:

| Role | Spec | Implementation |
|------|------|----------------|
| Display | 28px / 600 / 1.2 | `text-[28px] font-semibold leading-[1.2]` `login-gate.tsx:36` |
| Body | 14px / 400 / 1.5 | `text-sm` on gate body, chip name, banner message; `body` 14/400/1.5 in CSS |
| Label | 12px / 400 / 1.4 | Badge `text-xs font-normal leading-[1.4]` |
| Heading | 20px / 600 | unused on gate (correct); invoice heading still Phase 1 `text-xl font-semibold` |

Gate/banner CTA override Button `font-medium` with `font-semibold`. Chip trigger uses `font-normal`. Two-weight contract (400/600) holds **at call sites**.

**WARNING — Shared primitives still ship weight 500.** Badge base CVA `font-medium` (`badge.tsx:8`). `DropdownMenuLabel` base `font-medium` (`dropdown-menu.tsx:171`); chip passes `font-normal` so Rolle should compute to 400. Contract: “Do not ship `font-medium` (500) on Phase 2 controls.” Overrides exist; the installed primitives still default 500.

Abmelden item is `text-sm` (14px Body) with no weight override — inherits 400 from the item, not 500. Fine.

Distinct Phase 2 sizes in use: `text-[28px]`, `text-sm`, `text-xs` (3). Weights on those call sites: `font-semibold`, `font-normal` (2). Within the four-size / two-weight cap.

### Pillar 5: Spacing (2/4)

Declared scale: 4 / 8 / 16 / 24 / 32 / 48 / 64. Exception: `min-h-11` (44px) on gate Anmelden, chip, banner Anmelden, **and menu Abmelden**.

**What holds:**
- Gate column `gap-4` (16), `py-16` (64 = 3xl), `max-w-xl`. Extra `px-4` (16) is on-scale and needed at 375px.
- Chip `gap-2` `px-2` (8 = sm). Nav `p-2` `w-48`.
- CTAs `min-h-11` on gate and banner.
- Radius `--radius` / `--radius-md` = 8px. Gate hero/CTAs/chip use `rounded-md`.

**WARNING — Abmelden hit target not 44px.** `DropdownMenuItem` is `px-1.5 py-1` (`dropdown-menu.tsx:74`). ~4px vertical pad on 14px type ≈ 22–32px. Spec exception list names menu Abmelden as a 44px control. This is the spacing miss that drops the pillar to 2.

**WARNING — Banner padding is 32px, not 16px.** `session-banner.tsx:19` wrapper `p-4` plus `card.tsx:9` `p-4`. Spec Banners: padding md (16px), gap sm (8px). Inner `gap-2` is correct; outer stack is not.

**WARNING — Off-scale 6px / 2px on Phase 2 primitives.** Menu item `px-1.5` (6px). Badge `py-0.5` (2px), `px-2` (8px). Scale requires multiples of 4 except the 44px exception.

Gate `px-4` is extra vs the spec sentence (only `max-w-xl`, `gap-4`, vertical 3xl) but on-scale and helps mobile. Not scored down.

### Pillar 6: Experience Design (2/4)

**Covered:**
- Silent boot: full-viewport Spinner + sr-only „Wird geladen“ (`App.tsx:98-102`). `prefers-reduced-motion` drops `animate-spin` (`spinner.tsx:2-10`, `login-init.html:30-34`).
- Unsigned: LoginGate only. Signed: existing hash router + AppShell. Boot `/me` 401 → gate, no banner (`session-provider.tsx:118-123`). Network/5xx → `ErrorState` + Erneut versuchen, no login window (`App.tsx:106-111`).
- 401 while signed: `role="alert"`, banner, `open_login_window`, `replayLastRequest` after redeem (`session-provider.tsx:171-174`, `86-94`).
- Redeem failure after `clared://`: unsigned + `bannerKind: "cancel"` (`session-provider.tsx:95-99`).
- Opening Anmelden does not replace the gate with a spinner (E11). Banner Anmelden may show inner Spinner while `openingLogin` (E15).
- Abmelden: no confirm dialog; this-device keychain delete + `endSessionUrl` in login window; main goes to gate (`session-provider.tsx:187-208`).
- Chip name truncates with `title`; empty name → email; never `sub`/groups/permissions.
- Keyboard: gate `autoFocus`; chip is a Button; Radix menu gets Escape / arrows. No global login shortcut.

**WARNING — Close login window does not cancel.** `open_login_window` in `lib.rs:105-167` has no `CloseRequested`/`Destroyed` emit. `session-provider` only sets cancel on redeem catch. Native close (E12 error, D-20) leaves the gate with no banner. User task “I cancelled” has no feedback.

**WARNING — No 60s ticket timeout in the desktop UI.** Spec: window close **or** ticket timeout (60s) → cancel banner. Backend ticket TTL is 60s; desktop never starts a timer. Sitting in the WebView past TTL is a silent hang until a later failed redeem.

**WARNING — Broken hero has no `onError`.** Spec E11 empty: missing/broken file keeps title, body, CTA and must not swap empty-state art. There is no `onError` to hide a broken-image icon (`login-gate.tsx:31-35`). Low severity if the PNG ships (it does: 2688×1520 per 02-04).

**WARNING — Badge overflow vs E16.** See pillar 2 `whitespace-nowrap`.

Loading / error / empty / disabled:
- Loading: boot spinner, login-init spinner, banner opening spinner — present.
- Error: 401 banner, boot-error ErrorState — present. Close/timeout error chrome — missing.
- Empty: gate marketing empty — present.
- Disabled: Button has disabled styles; Anmelden is not disabled while the window opens (spec allows keeping the label; double-invoke focuses the existing window — `lib.rs:114-119`).
- Destructive confirm: correctly absent.

No Experience deduction for registry flags (none).

---

## Registry Safety

`packages/ui/components.json` is shadcn official only (`style: radix-nova`, no `registries` key). UI-SPEC Registry Safety table: third-party = none. Phase 2 added official `badge` and `dropdown-menu` into `packages/ui`.

Registry audit: 0 third-party blocks checked, no flags

---

## Files Audited

- `apps/desktop/src/auth/login-gate.tsx`
- `apps/desktop/src/auth/session-provider.tsx`
- `apps/desktop/src/App.tsx`
- `apps/desktop/src/components/session-chip.tsx`
- `apps/desktop/src/components/session-banner.tsx`
- `apps/desktop/src/components/spinner.tsx`
- `apps/desktop/src/components/error-state.tsx`
- `apps/desktop/src/styles/globals.css`
- `apps/desktop/src-tauri/login-init.html`
- `apps/desktop/src-tauri/src/lib.rs` (window chrome / close path)
- `packages/ui/src/components/button.tsx`
- `packages/ui/src/components/badge.tsx`
- `packages/ui/src/components/dropdown-menu.tsx`
- `packages/ui/src/components/card.tsx`
- `packages/ui/src/index.ts`
- `packages/ui/components.json`
- `apps/desktop/src/__tests__/session-chip.test.tsx`
- `apps/desktop/src/__tests__/session-banner.test.tsx`
- Screenshots: `.planning/ui-reviews/02-20260822-073223/desktop.png`, `mobile.png`, `tablet.png`
