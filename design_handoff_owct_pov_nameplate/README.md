# Handoff: OWCT Player-PoV Nameplate (YouTube thumbnail / stream banner)

## Overview
A 1280×720 thumbnail/overlay for "Old World — Empires of the Indus" Community Tournament videos. It frames a match from one player's point of view: the streamer's emblem, a "vs OPPONENT" headline, and a round tag, over a fortress backdrop with the tournament logo up top.

## About the Design Files
The file in this bundle (`owct-pov.html`) is a **design reference created in HTML** — a prototype showing the intended look and behavior, not production code to ship as-is. The task is to **recreate this design in your target environment** (a thumbnail-generator template, a React/Vue component, an OBS browser-source overlay, an SVG/Canvas render pipeline, etc.) using that environment's established patterns. If there is no existing codebase, pick whatever framework best fits the use (a parametric HTML template is perfectly reasonable here) and implement it there.

The design is **parameterized by intent** — opponent name, round label, avatar image, and background should be inputs, not hardcoded.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and layout are all specified below. Recreate pixel-accurately at 1280×720.

## Screens / Views

### View: PoV Nameplate (single 1280×720 frame)

**Canvas:** 1280×720px, `overflow: hidden`, base background `#070d18`.

**Layer stack (back → front):**
1. **Background image** — full-bleed, `object-fit: cover`, `object-position: center 35%`. Sample asset: `assets/bg-fort.jpg`.
2. **Scrim** — a vertical gradient to seat text top and bottom:
   `linear-gradient(180deg, rgba(7,13,24,0.45) 0%, rgba(7,13,24,0) 26%, rgba(7,13,24,0) 45%, rgba(7,13,24,0.55) 72%, rgba(7,13,24,0.92) 100%)`
3. **Top cluster** — absolutely positioned, `top: 30px`, full width, flex column, centered, `gap: 6px`:
   - **Tournament logo** image — `width: 780px`, height auto. Drop shadows: `drop-shadow(0 0 20px rgba(231,196,119,0.35)) drop-shadow(0 4px 18px rgba(0,0,0,0.7))`. Asset: `assets/owct-logo.png`.
   - **Tournament caption** — text "COMMUNITY TOURNAMENT 2026". Cinzel 600, 22px, color `#e3c477`, `letter-spacing: 0.34em`, uppercase, `text-shadow: 0 2px 8px rgba(0,0,0,0.8)`.
4. **Hero row (`.povhero`)** — absolutely positioned, `left: 64px; right: 64px; bottom: 44px`, flex row, `align-items: center`, `gap: 40px`:
   - **Avatar medallion** — 216×216px circle. `border: 5px solid #c9a352`. Layered ring shadow: `0 0 0 3px rgba(7,13,24,0.85), 0 0 0 5px rgba(201,163,82,0.55), 0 10px 34px rgba(0,0,0,0.65)`. Image inside is `object-fit: cover` **and zoomed** `transform: scale(1.32); transform-origin: center 46%` — this is deliberate, to push the source icon's square frame/border outside the circular crop. Asset: `assets/alcaras.png`.
   - **Text block** (`flex: 1; min-width: 0`):
     - **Tag** — "alcaras · PoV". Cinzel 600, 21px, color `#e3c477`, `letter-spacing: 0.42em`, uppercase, `text-shadow: 0 2px 8px rgba(0,0,0,0.85)`, `margin-bottom: 4px`.
     - **Name row** — flex, `align-items: baseline`, `gap: 20px`, `line-height: 1.0`, uppercase, color `#f5ecd3`, `text-shadow: 0 3px 16px rgba(0,0,0,0.75), 0 0 30px rgba(231,196,119,0.28)`:
       - **"vs" prefix** — Cinzel 600, 44px, color `#e3c477`, `letter-spacing: 0.06em`.
       - **Opponent name** — Cinzel 800, base 104px, `overflow-wrap: anywhere`. **Auto-fit:** on load and after fonts settle, shrink font-size in 2px steps from 104px down to a floor of 34px until the name row no longer overflows its container. (See "Interactions & Behavior".)
     - **Round tag** — inline-block chip, "ROUND 1". `margin-top: 14px`, `padding: 5px 14px`, background `#8c2a33` (crimson), color `#f5ecd3`, Cinzel 600, 15px, `letter-spacing: 0.22em`, uppercase, `box-shadow: 0 2px 10px rgba(0,0,0,0.55)`.

## Interactions & Behavior
This is a static render, but one piece of logic matters:

- **Opponent-name auto-fit.** Long usernames (e.g. `A_Modern_Major_General`) must stay on one line and clear the 64px right margin. Algorithm:
  1. Set opponent font-size to max (104px).
  2. Measure the name row's `scrollWidth` vs its `clientWidth`.
  3. While it overflows and size > 34px, decrement size by 2px and remeasure.
  Run this on `fit()` immediately, on `window load`, and on `document.fonts.ready` (Cinzel metrics change the fit). In a component environment, run it in an effect after mount + font load, or precompute the size if rendering server-side.

No hover/click/loading states — it's an image-style frame.

## State Management / Inputs
Treat these as props/inputs:
- `opponentName` (string) — drives the auto-fit headline.
- `roundLabel` (string) — the crimson chip, e.g. "Round 1".
- `playerTag` (string) — e.g. "alcaras · PoV".
- `avatarSrc` (image) — the medallion (expect a square source; the 1.32 zoom hides its frame).
- `backgroundSrc` (image) — full-bleed backdrop.
- `tournamentCaption` (string) — e.g. "Community Tournament 2026".

## Design Tokens
Colors:
- Navy deep (base bg): `#070d18`
- Parchment hi (name/light text): `#f5ecd3`
- Gold: `#c9a352`
- Gold hi (accents/tag): `#e3c477`
- Crimson (round chip): `#8c2a33`

Typography: **Cinzel** (Google Fonts, weights 400–900). Display stack: `'Cinzel', 'Trajan Pro', 'Times New Roman', serif`.

Type scale (px): opponent name 104 (auto-fit floor 34) · "vs" 44 · player tag 21 · tournament caption 22 · round chip 15.

Spacing: canvas margins `left/right: 64`, hero `bottom: 44`, top cluster `top: 30`, hero `gap: 40`, name-row `gap: 20`, avatar 216×216.

Radii/borders: avatar circle (`border-radius: 50%`), avatar `5px` gold border. Round chip is square (no radius).

## Assets
Bundled in `assets/`:
- `alcaras.png` — player emblem (square icon; rendered zoomed 1.32× inside the circular medallion). Replace per streamer.
- `bg-fort.jpg` — fortress backdrop. Swap per video.
- `owct-logo.png` — tournament wordmark/logo lockup (rendered at 780px wide).

Fonts: Cinzel loaded from Google Fonts. Substitute your codebase's font-loading mechanism.

## Files
- `owct-pov.html` — the complete design reference (self-contained HTML + inline CSS + the auto-fit script). Asset paths are relative to the file (`assets/...`).
