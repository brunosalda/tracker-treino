# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Migrating from a single static `index.html` (plain HTML/CSS/JS, no build) to Vite + vanilla JS. User's choice after reviewing trade-offs: prioritizes maintainability as the app grows (splash/loading, redesign) over the zero-dependency simplicity of opening the raw file directly.

## Users

Single user (Bruno), personal fitness tracker. Used on mobile during workouts (logging sets, reps, running sessions) and on desktop for planning and reviewing history/progress.

## Product Purpose

Personal training log: track strength training (musculação), running (corrida), and mobility work; track meals/nutrition; track body weight over time; import workout data from Garmin; maintain an exercise library and a training plan. Success = fast, low-friction logging in the moment (especially mid-workout on mobile) and clear historical/progress views afterward.

## Positioning

A personal tool tailored to one user's own routine and data, not a general-audience fitness app — integrates directly with the user's Garmin data and a Supabase backend, and encodes their specific training/nutrition tracking workflow rather than a generic template.

## Operating Context

- Logging happens live during/right after workouts, primarily on a phone at the gym or mid-run.
- Review/planning happens at a desktop (history, progress charts, plan editing).
- Data is persisted to a Supabase backend (see `.mcp.json`).
- Workout data can be imported from Garmin.

## Capabilities and Constraints

Existing features (current `index.html`):
- Tabs: Hoje, Importar Garmin, Biblioteca, Histórico, Plano.
- "Hoje" splits into Treino (musculação/corrida/mobilidade session logging, exercise cards, set logging) and Alimentação (meal logging with quick-import text shorthand, macro calculator).
- Weight tracking with chart (`renderPesoChart`).
- Guided workout wizard with autosave per set.
- Exercise library (`renderBiblioteca`).
- Garmin import flow.
- Day rollover logic: day changes at 4am, not midnight.

Constraints: single-user app, no auth/multi-tenant concerns. No native app requirement — stays a web app (PWA install/offline explicitly out of scope for now, see below).

## Evidence on Hand

The current `index.html` implementation is the functional source of truth for all existing behavior — must be preserved during the redesign (visual replacement only, not a feature rewrite). Backend: Supabase project connected via MCP.

## Product Principles

1. Logging speed beats generality — mid-workout entry (mobile) must stay minimal-friction; never add steps to core logging flows for the sake of visual polish.
2. Personal tool, not a product for strangers — no onboarding-for-new-users flows, no generic empty states aimed at unknown audiences.
3. Data trust — weight, sets, and meal data are the user's real historical record; the redesign must not risk data loss or misrepresent logged values.
4. Mobile-first for action, desktop-friendly for review — the two contexts (gym/run vs. planning) have different needs and both must work well.
5. Build path: comp-first (visual reference image before code) is the chosen default for this project's new-work.

## Accessibility & Inclusion

No specific accessibility requirement established beyond standard web practice (single sighted user, no stated assistive-tech need). Standard contrast/legibility care applies as general craft floor, not a documented requirement.
