# Phase 1: Tauri Desktop & Mockup-First UI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-19
**Phase:** 1-Tauri Desktop & Mockup-First UI
**Areas discussed:** UI-Framework, Desktop-Shell, Mockup-Tiefe, Invoice-Canvas, Karten-Inhalt, Start & Empty, PDF auf Dark, Entities/Kunden-Mock

Mode: `--batch` (4 questions per area). User asked for a recommended option on every question.

---

## UI-Framework

| Option | Description | Selected |
|--------|-------------|----------|
| React/TypeScript | Official Tauri template; GSD/shadcn React-first | ✓ |
| Vue/TypeScript | Also an official Tauri template | |

| Option | Description | Selected |
|--------|-------------|----------|
| Nur custom | Primitives from scratch | |
| Headless-Kit (shadcn/Radix) | A11y primitives, custom pixels | ✓ |
| Full-Library (MUI/Ant) | Generic admin look | |

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind | Fast mockup → pixels, pairs with shadcn | ✓ |
| CSS Modules | | |
| CSS-in-JS | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Nur `apps/desktop` | | |
| `apps/desktop` + `packages/ui` | Design-system home | ✓ |
| Full PRD monorepo incl. empty backend/tax | YAGNI for Phase 1 | |

**User's choice:** 1a, 2b, 3a, 4b
**Notes:** Followed recommendations.

---

## Desktop-Shell

| Option | Description | Selected |
|--------|-------------|----------|
| Linke Sidebar | Five destinations reachable | ✓ |
| Tabs oben | | |
| Rechnung-only + palette/drawer | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Native Titlebar | Cross-OS safer for Phase 1 | ✓ |
| Custom Titlebar | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Dicht, aber ruhig | | ✓ |
| Sehr dicht (Excel) | | |
| Editorial/luftig | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Light default, Dark later | Agent rec | |
| Light + Dark from the start | | |
| Dark-first | | ✓ |

**User's choice:** 1a, 2a, 3a, 4c
**Notes:** Overrode theme rec (light-default) in favor of dark-first. Light deferred.

---

## Mockup-Tiefe

| Option | Description | Selected |
|--------|-------------|----------|
| Nur UI-SPEC.md | | |
| Klickbares Dark-UI im Tauri-Fenster + UI-SPEC | | ✓ |
| Figma/Canvas first | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Five shell targets + 1 invoice empty | | ✓ |
| Loop only, Entities/Kunden placeholder | | |
| Five + loading/error/offline each | | |

| Option | Description | Selected |
|--------|-------------|----------|
| One realistic B2B invoice (EU-GmbH + US customer) | | ✓ |
| Lorem | | |
| Multiple tax scenarios | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Nav + fields visible, tax/PDF staged | | ✓ |
| Hotspots only | | |
| Fake local tax math | | |

**User's choice:** 1b, 2a, 3a, 4a
**Notes:** Followed recommendations.

---

## Invoice-Canvas

| Option | Description | Selected |
|--------|-------------|----------|
| Split: form left, tax rail right | | ✓ |
| WYSIWYG document | | |
| Wizard | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Right rail (staged TaxDecision fields) | | ✓ |
| Sum block under lines | | |
| Tax sidebar only | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Peek on invoice + full sidebar PDF | | ✓ |
| PDF sidebar only | | |
| PDF modal | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Compact table | Agent rec | |
| One card per line | | ✓ |
| Word-like free text | | |

**User's choice:** 1a, 2a, 3a, 4b
**Notes:** Overrode table rec. Cards must stay compact vs dense-but-calm.

---

## Karten-Inhalt

| Option | Description | Selected |
|--------|-------------|----------|
| Bezeichnung, Menge, Einzelpreis, Netto | | ✓ |
| Plus per-line tax rate | | |
| Name + amount only | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Fields always visible, compact | | ✓ |
| Accordion | | |
| Double-click dialog | | |

| Option | Description | Selected |
|--------|-------------|----------|
| „+ Position“ at list bottom | | ✓ |
| Plus between cards | | |
| Keyboard only | | |

| Option | Description | Selected |
|--------|-------------|----------|
| X on hover | | ✓ |
| X always visible | | |
| Swipe/context menu | | |

**User's choice:** 1a, 2a, 3a, 4a
**Notes:** Followed recommendations.

---

## Start & Empty

| Option | Description | Selected |
|--------|-------------|----------|
| Launch on filled sample invoice | | ✓ |
| Launch on empty | | |
| Launch on Entities | | |

| Option | Description | Selected |
|--------|-------------|----------|
| „Neue Rechnung“ in invoice header | | ✓ |
| Second sidebar row | | |
| Via Entities/Kunden only | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Short sentence + button, no illustration | Agent rec | |
| Large illustration + marketing copy | | ✓ |
| Blank form | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle empty ↔ sample, no persist | | ✓ |
| Fillable blank, reset on nav | | |
| Button decorative only | | |

**User's choice:** 1a, 2a, 3b, 4a
**Notes:** Overrode empty-content rec. User lock: graphics via **higgsfield CLI** (higgsfield-generate, GPT Image 2 default). Not stock, not Cursor GenerateImage.

---

## PDF auf Dark

| Option | Description | Selected |
|--------|-------------|----------|
| Light paper on dark stage | | ✓ |
| Inverted PDF | | |
| PDF screen switches to light theme | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Peek under tax rail | | ✓ |
| Under line-item cards | | |
| Bottom-right overlay | | |

| Option | Description | Selected |
|--------|-------------|----------|
| One centered page, zoom decorative | | ✓ |
| Full-width paper | | |
| Two-page spread | | |

| Option | Description | Selected |
|--------|-------------|----------|
| HTML/CSS paper from sample data | | ✓ |
| Higgsfield image of an invoice | | |
| Embed a real PDF file | | |

**User's choice:** 1a, 2a, 3a, 4a
**Notes:** Higgsfield stays on illustrations; invoice paper is HTML/CSS so numbers match the sample.

---

## Entities/Kunden-Mock

| Option | Description | Selected |
|--------|-------------|----------|
| List + read-only fake detail | | ✓ |
| List only | | |
| List + inspector panel | | |

| Option | Description | Selected |
|--------|-------------|----------|
| 1 entity + 1 customer matching the invoice | | ✓ |
| 5–6 dummy rows | | |
| Empty lists + Higgsfield empty | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Omit create in Phase 1 | Agent rec | |
| Visible disabled button + mock hint | | ✓ |
| Fake create form | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Rechnung · Entities · Kunden · Tax · PDF | PRD order | ✓ |
| Loop grouped (Rechnung · Tax · PDF first) | | |
| Icons only | | |

**User's choice:** 1a, 2a, 3b, 4a
**Notes:** Overrode omit-create rec. Disabled Anlegen must look intentional.

---

## Claude's Discretion

Exact tokens/shadcn variant, window size, icon set, marketing copy wording, concrete sample invoice numbers, whether „+ Position“ is a visual add or a visible no-op, decorative PDF zoom.

---

## Deferred Ideas

- Light theme
- Custom titlebar
- Vue / MUI / full PRD monorepo scaffolding
- Real tax engine, collision logic, multi-scenario tax
- Real PDF (Phase 4)
- Auth, Coolify, persist, offline
- Owner-only entity create (Phase 3)
- Per-screen loading/error/offline
