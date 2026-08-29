# Design — Placar de Ferro

<!-- impeccable:design-schema 1 -->

## World

Industrial gym rack signage: brushed steel placards, hazard-yellow stencil accent, oxide-red for destructive actions only. Hard 4-6px corners, no soft/rounded "wellness app" chrome. Color is restrained — accent yellow marks the one active/primary thing on screen (active tab, primary button, current value), never decoration.

## Palette

- Ground: `--bg #15171a`, `--bg-inset #0e1013`
- Panels: `--panel #212429`, `--panel-2 #262a30`, `--panel-border #34383e`
- Steel: `--steel #3a3f44`, `--steel-light #6b7178`, `--rivet #4d5157`
- Accent (active/primary only): `--accent #f2c230`, `--accent-dim #b8901e`, `--accent-ink #201802`
- Danger (destructive only): `--danger #d4552f`, `--danger-dim #8b3820`
- Text: `--text #edede7`, `--text-dim #9ba1a8`, `--text-faint #6b7178`

## Type

- Display (headers, big stats, stepper values): Oswald, condensed uppercase, tracked.
- Body: system sans stack (`-apple-system, "Segoe UI", Roboto`).

## Components

- **Placard (`.card`)**: subtle steel gradient + inset bevel shadow, hard 6px radius, no drop shadow.
- **Tab rail (`.tabs` / `.tab`)**: steel pills; active tab fills hazard yellow and extends its padding (the "pulled rack tray" cue) — padding change is instant, not eased, to read as mechanical rather than soft.
- **Signature motion**: newly-created set-log chips and stepper values "stamp" in (short scale/opacity keyframe) — the log-a-number-and-see-it-stick feel from the direction brief. No continuous easing anywhere; state changes snap.
- **Identity markers**: a rivet-dot (small circle, steel by default → accent when "done"/active) replaces border-side accents on exercise cards and history entries — chosen deliberately over a left-border stripe, which the mechanical slop-detector flags as a recognizable AI-UI tell.
- **Focus/lift state**: an open `<details>` (Biblioteca accordion) gets a full accent-colored inset ring + lighter panel background, not a border-left stripe (same anti-slop reasoning).
- **Grade badges** (`forte`/`moderada`/`fraca`): a monochrome steel→yellow intensity ramp, not a red/amber/green traffic-light hue set — keeps saturated color exclusive to the accent system.
- **Type badges** (Histórico entries): emoji-prefixed steel badges (🏋/🏃/🧘/💤) instead of per-category background hues, for the same color-discipline reason.
- **Splash**: full-screen charcoal, a stamped steel plate with the wordmark, ~300ms mechanical entrance, hides after first render.

## Layout

- Mobile-first; body content capped at `max-width: 720px`, centered, for desktop review use.
- Rest timer and glossary sheet stay fixed full-width (they're system-level overlays, not content).

## Fixed since initial redesign

- `src/features/nutrition.js` protein calculator: was missing the calculated quantity in its output (a stray `const date = hojeStr();` debug line had overwritten it). Fixed to show `<quantidade> de <alimento> fornece...`.
- `analisarSemana()` (AI analysis) called `api.anthropic.com` directly from the browser — blocked by CORS and would have required exposing a billable API key client-side. Moved to a Supabase Edge Function (`ai-analysis`, deployed) that holds `ANTHROPIC_API_KEY` server-side; the client now calls `${SUPA_URL}/functions/v1/ai-analysis` with the existing anon headers. **Requires the user to set the `ANTHROPIC_API_KEY` secret on the Supabase project** — see chat for instructions.

## Deployment note

An existing Supabase Edge Function (`tracker`, pre-existing, unrelated to this redesign) reassembles `index.html` from a `site_html_chunks` table and republishes it to Supabase Storage as a single static file — this is how the app was previously getting a public URL for phone use. This mechanism only handles one HTML file; it does not account for the Vite build's separate JS/CSS assets. Flagged to the user — deployment approach needs to be decided before this redesign is usable outside local dev.
