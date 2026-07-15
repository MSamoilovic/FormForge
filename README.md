<h1 align="center">FormForge</h1>
<p align="center">
  A powerful web application for dynamically creating, managing, and rendering forms.
</p>

---

## Motivation

Building forms by hand is repetitive, and most form tools are either too rigid or lock your data behind a SaaS. FormForge is a self-hostable form platform that lets you:

- **Design visually** — drag & drop 17 field types instead of writing markup.
- **Add logic without code** — an `AND`/`OR` rule engine controls field visibility and behavior.
- **Own your data** — forms and submissions live in your own backend (separate FastAPI + PostgreSQL service).
- **Move fast** — generate a form from a natural-language description with AI, then refine it.

It's built as an Nx monorepo with Angular 20 (standalone components + Signals), so the field library, rule engine, and models are cleanly separated and reusable.

## Quick Start

**Prerequisites:** Node.js 20+, and the backend API running at `http://127.0.0.1:8001` (separate repo: [FormForge_API](https://github.com/MSamoilovic/FormForge_API)).

```bash
git clone https://github.com/MSamoilovic/FormForge.git
cd FormForge
npm install
npm run start        # nx serve FormForge --port 4500
```

Open [http://localhost:4500](http://localhost:4500).

> Without the backend the UI loads, but saving/loading forms and submissions will fail. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#5-api-contract) for the API contract.

## Usage

1. **Sign in** — register or log in (JWT auth).
2. **Build a form** — in the Form Builder, drag fields from the toolbox onto the canvas and configure each in the property panel.
3. **Add rules** — attach conditional rules (show/hide/require) to a field; the canvas shows indicators on fields driven by or triggering rules.
4. **Theme it** — set per-form colors, font, and border radius; toggle dark mode.
5. **Preview & publish** — preview opens the live renderer; share the form URL to collect responses.
6. **Review submissions** — view responses per form and export them to CSV.
7. **AI shortcut** — describe a form in plain language and let AI scaffold it, then edit.

For the full domain model, module map, and API contract, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Contributing

This is an Nx monorepo:

- `apps/FormForge/` — the Angular application
- `apps/FormForge-e2e/` — Playwright E2E tests
- `libs/models/` — shared TypeScript types (`@form-forge/models`, the single source of truth)
- `libs/ui-kit/` — presentational field components (`@form-forge/ui-kit`)
- `libs/rule-engine/` — conditional rule logic (`@form-forge/rule-engine`)
- `libs/config/` — field defaults and UI config (`@form-forge/config`)

**Workflow:**

```bash
npx nx lint FormForge       # lint
npx nx test FormForge       # unit tests (Jest)
npx nx e2e FormForge-e2e    # E2E (Playwright)
npx nx build FormForge      # production build
```
