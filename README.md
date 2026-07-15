<h1 align="center">FormForge</h1>
<p align="center">
  A powerful web application for dynamically creating, managing, and rendering forms.
</p>

---

## Key Features

- **Visual Form Builder** — drag & drop 17 field types (text, select, radio, file upload, rich text, and more).
- **Reactive Forms** — efficient form state management via Angular Reactive Forms + Signals.
- **Rule Engine** — complex rules (`AND`/`OR`) that control field visibility and behavior.
- **Submissions** — collect submissions, view them, and export to CSV.
- **AI Generation** — create a form from a natural-language description.
- **Theming** — per-form visual identity via CSS variables + dark mode.
- **Nx Monorepo** — scalable code with clearly separated libraries and applications.

## Tech Stack

- **Angular 20+** — standalone components, Signals (no `NgModule`).
- **TypeScript** — strictly typed code.
- **Nx** — monorepo tooling for apps and shared libraries.
- **Tailwind CSS** + Spartan UI — styling and UI primitives.
- **Angular CDK** — drag & drop.
- **Jest** (unit) + **Playwright** (E2E) — testing.

## Getting Started

```bash
git clone https://github.com/MSamoilovic/FormForge.git
cd FormForge
npm install
npm run start        # nx serve FormForge --port 4500
```

The app is available at [http://localhost:4500](http://localhost:4500).

> **Backend:** the frontend expects a REST API at `http://127.0.0.1:8001/api`. The backend lives in a separate repository — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#5-api-contract) for the API contract.

## Project Structure

Nx monorepo:

- `apps/FormForge/` — the main Angular application
- `apps/FormForge-e2e/` — Playwright E2E tests
- `libs/models/` — shared TypeScript models (source of truth for types)
- `libs/ui-kit/` — presentational field components + shell
- `libs/rule-engine/` — conditional rule logic
- `libs/config/` — field defaults and UI configuration

## Documentation

- **[PLAN.md](PLAN.md)** — master plan and current focus (single authoritative tracker)
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — technical reference: stack, monorepo, domain model, API contract
- **[docs/ROADMAP.md](docs/ROADMAP.md)** — feature roadmap and backlog
