# owthumbnail-alcaras-player-pov

Player-PoV YouTube thumbnail generator for alcaras' Old World videos.
Static site — open `index.html` in a browser, no build step.

Sibling of [`owthumbnail`](../owthumbnail) (the neutral OWCT caster
thumbnail generator). This one is first-person: it matches the channel's
existing thumbnail language — Old World wordmark top-left, painted art
background, translucent banner with a big title over
"alcaras v. Opponent, Part N" — and uplevels it with the electric-blue
lightning avatar and glowing banner hairlines, so PoV videos are
recognizable at feed size regardless of which nation is being played.

## Layouts

- **Channel banner** — the channel's classic strip: big title over
  "alcaras v. Opponent, Part N", lightning avatar breaking out on the right.
- **OWCT 2026** — mirrors the official tournament generator (Empires of the
  Indus logo, tournament caption, gold VS HUD) but PoV-ified: your cell gets
  the electric avatar ring and a cyan "› Player PoV" tag, the opponent side
  stays tournament-gold. Note field becomes the crimson round pill under VS;
  Part shows under the opponent's name.

Both honor `?layout=` and `?background=` URL params for bookmarking.

## Fields

- **You / Opponent / Part** — composed into "alcaras v. Ninjaa, Part 2".
  Part blank = hidden.
- **Note** — small letterspaced line under the subtitle
  (e.g. "Round 3 · Match 44"). Blank = hidden.
- **Title** — the big line ("Tournament", "Succession Game", …).
- **Tag** — small electric caps above the title ("Player PoV"). Blank = hidden.
- **Background** — curated nation-neutral Old World event art
  (blue/storm picks first, to echo the avatar). Sourced from the game via
  owreference / [pinacotheca](https://becked.github.io/pinacotheca/)
  extractions, recompressed to 1600px JPG.
- **Avatar toggle** — hide the lightning avatar if the thumbnail needs
  the full banner width.

## Assets

- `assets/oldworld-logo.png` — Old World main-menu wordmark.
- `assets/alcaras.png` — the lightning avatar (from github.com/alcaras).
- `assets/backgrounds/*.jpg` — curated event art. Add more by dropping a
  16:9-ish JPG here and listing it in `BACKGROUNDS` in `app.js`.

Export uses [html-to-image](https://github.com/bubkoo/html-to-image);
downloads a native 1280×720 PNG.
