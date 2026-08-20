# Phase 1: Tauri Desktop & Mockup-First UI - Context

**Gathered:** 2026-08-19
**Status:** Ready for planning

<domain>
## Phase Boundary

User launches Clared as a Tauri desktop window on macOS and Windows. Interactive mockups of the invoice → live-tax → PDF loop exist **inside that window** before feature implementation. The mockuped shell is navigable: Rechnung, Entities, Kunden, Tax-Vorschau, PDF.

This phase delivers the desktop shell + clickable Dark UI + UI-SPEC. It does **not** deliver Authentik, Coolify API, tax engine, real PDF generation, persist, or offline sync.

</domain>

<decisions>
## Implementation Decisions

### UI-Framework
- **D-01:** Frontend is React/TypeScript, not Vue. — **Reversibility:** costly — undoing means rewriting `apps/desktop` and `packages/ui`.
- **D-02:** Component layer is a headless kit: shadcn/ui + Radix. Not a full library (MUI/Ant) and not primitives-from-scratch.
- **D-03:** Styling is Tailwind CSS.
- **D-04:** Phase 1 repo layout is `apps/desktop` (Tauri + React) plus `packages/ui` (shared design-system). Do **not** scaffold empty `apps/backend` or `packages/tax-engine` in this phase. — **Reversibility:** costly — path and import graph lock.

### Desktop-Shell
- **D-05:** Primary navigation is a left sidebar, not top tabs, not command-palette-only.
- **D-06:** Sidebar order: Rechnung · Entities · Kunden · Tax · PDF.
- **D-07:** Use the native OS titlebar (`decorations` stay on). No custom titlebar in Phase 1.
- **D-08:** Visual density is dense-but-calm: clear numbers/tables, not Excel-cramped, not editorial-airy.
- **D-09:** Theme is **dark-first**. Light theme is not required in Phase 1 mockups. — **Reversibility:** costly — tokens, Higgsfield art, and UI-SPEC assume dark.

### Mockup-Tiefe
- **D-10:** Deliverable is a clickable Dark UI **in the Tauri window** plus a UI-SPEC. Not Figma-only, not SPEC-without-app.
- **D-11:** Clickable screens: the five sidebar destinations plus one invoice empty state. No per-screen loading/error/offline states in this phase.
- **D-12:** One realistic B2B sample invoice: EU-GmbH seller entity + US customer. Not lorem. Not multiple tax scenarios (those are Phase 3).
- **D-13:** Interaction: sidebar navigation works; invoice form fields are visible/editable in the mock (no persist). Tax and PDF are **staged** — no tax engine, no real PDF file, no fake tax math.

### Invoice-Canvas
- **D-14:** Invoice workspace is a split: form on the left, live-tax rail on the right. Not a WYSIWYG page, not a wizard.
- **D-15:** Live tax on the invoice screen lives in the right rail and shows staged TaxDecision-shaped fields: rate, reverse charge, legal text, applied_rule_id. Tax is not only on the Tax sidebar screen.
- **D-16:** PDF in the loop: a mini paper peek **under the tax rail** on the invoice screen; click opens the full PDF sidebar screen. No PDF modal.
- **D-17:** Line items are **one compact card per line**, not a table, not a Word-like block. Cards must stay compact so they do not fight D-08.

### Karten-Inhalt
- **D-18:** Each line-item card shows: Bezeichnung, Menge, Einzelpreis, Netto. No per-line tax rate on the card (tax stays document-level in the rail).
- **D-19:** Card fields are always visible (no accordion, no edit dialog).
- **D-20:** Add line via a „+ Position“ control at the bottom of the list. In the mock this may be a no-op or a local visual add; it must be visible.
- **D-21:** Delete via a small X revealed on hover.

### Start & Empty
- **D-22:** App launch lands on the **filled sample invoice** (the 2-minute loop), not empty, not Entities.
- **D-23:** Empty state is reached via „Neue Rechnung“ in the invoice header. It toggles locally to empty; a further action returns to the sample. No persist.
- **D-24:** Empty state is a **large illustration + marketing copy**, not a short empty hint and not a blank form.

### Graphics (Higgsfield)
- **D-25:** All illustrative graphics (empty-state hero, marketing art) are generated with the **`higgsfield` CLI**, following the higgsfield-generate skill. Default image model: GPT Image 2. Do not use stock photos or Cursor GenerateImage for these assets.
- **D-26:** Higgsfield is **not** used for the invoice paper visual. The staged PDF is HTML/CSS rendered from the sample invoice data so numbers stay consistent.

### PDF auf Dark
- **D-27:** Paper is a light page on a dark stage (frame + shadow). Do not invert PDF content. Do not switch the PDF screen to a light app theme.
- **D-28:** Full PDF sidebar view: one centered page on a dark stage. Zoom controls may be decorative. No two-page spread, no full-bleed paper.

### Entities / Kunden mock
- **D-29:** Each of Entities and Kunden is a list; click opens a read-only fake detail. Not list-only, not a split inspector.
- **D-30:** Sample rows: exactly one entity (EU-GmbH) and one customer (US), the same parties as the sample invoice.
- **D-31:** „Anlegen“ buttons are **visible, disabled**, with a mock/phase hint. Do not omit them. Do not open a fake create form.

### Claude's Discretion
- Exact Tailwind/shadcn token values and shadcn style (e.g. new-york vs default), as long as dark-first + dense-but-calm hold.
- Default window size, sidebar icon set, and Tax-rail / empty-state marketing **copy** (user locked the pattern, not the words).
- Concrete sample invoice field values (names, addresses, line amounts), as long as the seller is an EU-GmbH and the buyer is a US customer.
- Whether „+ Position“ in the mock adds a visual card or is a visible no-op.
- Decorative zoom on the PDF viewer.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product / phase scope
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria (Tauri window, mockups before implementation, five-screen shell).
- `.planning/REQUIREMENTS.md` — UI-01 (mockup-first / UI-SPEC), DESK-01 (Tauri macOS + Windows).
- `.planning/PROJECT.md` — locked: Tauri not Electron; Coolify/OIDC/tax library are later phases.
- `docs/clared-app-prd.md` — §2.1 UI-Framework alternatives (now locked React); §6.1 recommended folders `apps/desktop/`, `packages/ui/`.

### Tax preview shape (staged only in this phase)
- `docs/clared-tax-engine-architecture.md` — TaxDecision fields the staged rail should *look like* (do not implement `evaluate` here).
- `docs/clared-tax-rule-matrix.md` — human spec for later test cases; do not invent collision logic.
- `docs/clared-tax-rule-dsl-schema.json` — TaxRule SSOT for Phase 3, not this phase.

### Graphics
- `/Users/puzzless/.claude/skills/higgsfield-generate/SKILL.md` — Higgsfield CLI workflow; GPT Image 2 default for UI/illustration stills.

</canonical_refs>

<code_context>
## Existing Code Insights

Greenfield. No `apps/`, no Tauri project, no UI components, no `.planning/codebase/` maps.

### Reusable Assets
- None in-repo. Start from `create-tauri-app` React + TypeScript + Vite template, then add Tailwind + shadcn into `packages/ui`.

### Established Patterns
- None yet. D-01–D-04 become the patterns.

### Integration Points
- None. Phase 2 will attach HTTPS + OIDC to this shell. Do not add a real API client beyond a stub if needed for layout.

</code_context>

<specifics>
## Specific Ideas

- Empty state should feel like marketing (illustration + copy), generated via Higgsfield, sitting in an otherwise dense dark desktop shell.
- Invoice PDF mock is a **paper object** (light) inside the dark app — peek under the tax rail, full page on the PDF route.
- Line-item cards stay compact: four fields always visible, hover-X, add control at list bottom.
- Disabled „Anlegen“ on Entities/Kunden should read as intentional mock, not a broken control.

</specifics>

<deferred>
## Deferred Ideas

- Light theme (user chose dark-first; not in Phase 1 mockups).
- Custom titlebar / `decorations: false`.
- Vue, MUI/Ant, CSS-in-JS, full PRD monorepo (`apps/backend`, `packages/tax-engine`).
- Real tax engine, collision logic, multiple tax scenarios.
- Real PDF generation / embedded PDF file (Phase 4).
- Authentik / Coolify / persist / offline (Phases 2–4).
- Owner-only entity create (Phase 3) — Phase 1 only shows a disabled mock button.
- Per-screen loading, error, and offline states.

</deferred>

---

*Phase: 1-Tauri Desktop & Mockup-First UI*
*Context gathered: 2026-08-19*
