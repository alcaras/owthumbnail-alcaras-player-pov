/* =========================================================
   alcaras Player-PoV thumbnail generator — vanilla JS, no build step.

   Data flow:
     state ──(render)──▶ .thumb DOM ──(html-to-image)──▶ PNG
                            │
                            └── also shown in preview, scaled

   Design brief: match the channel's existing thumbnails
   (Old World logo top-left, art background, translucent banner
   with "Tournament" over "alcaras v. X, Part N") but upleveled —
   electric-blue hairlines and the lightning avatar mark it as
   the player's own PoV video, whatever nation they end up playing.
   ========================================================= */

// Curated nation-neutral Old World art (from owreference/pinacotheca
// extractions), recompressed to 1600px JPGs. Blue/storm picks lead
// because they echo the electric avatar.
const BACKGROUNDS = [
  { slug: 'sea_exploration',    label: 'Open Sea' },
  { slug: 'hurricane',          label: 'Hurricane' },
  { slug: 'navalbattle',        label: 'Naval Battle' },
  { slug: 'tsunami',            label: 'Tsunami' },
  { slug: 'battle',             label: 'Land Battle' },
  { slug: 'the_300_spartans',   label: '300 Spartans' },
  { slug: 'lighthouse',         label: 'Lighthouse' },
  { slug: 'city_approach',      label: 'City Approach' },
  { slug: 'nomadic_people',     label: 'Nomads' },
  { slug: 'volcanic_eruption',  label: 'Eruption' },
  { slug: 'sandstorm',          label: 'Sandstorm' },
  { slug: 'fort',               label: 'Fort (OWCT)' },
];
const bgPath = slug => `./assets/backgrounds/${slug}.jpg`;

const LS_KEY = 'alcaras-pov-thumb-v1';

const DEFAULT_STATE = {
  layout: 'channel', // 'channel' = big banner strip · 'owct' = tournament logo + VS HUD
  you: 'alcaras',
  opponent: 'Ninjaa',
  part: '1',        // blank = hidden
  note: '',         // channel: small line under subtitle · owct: crimson round pill under VS
  title: 'Tournament',
  tag: 'Player PoV',// channel: caps above title · owct: cyan tag under your name. Blank = hidden.
  tournament: 'Community Tournament 2026', // owct caption line
  background: 'sea_exploration',
  showAvatar: true,
};

let state = loadState();

function loadState() {
  let s;
  try {
    const raw = localStorage.getItem(LS_KEY);
    s = raw ? { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) } : structuredClone(DEFAULT_STATE);
  } catch {
    s = structuredClone(DEFAULT_STATE);
  }
  // URL overrides (shareable/bookmarkable): ?layout=owct&background=fort
  const params = new URLSearchParams(location.search);
  const layout = params.get('layout');
  if (layout === 'channel' || layout === 'owct') s.layout = layout;
  const bg = params.get('background');
  if (bg && BACKGROUNDS.some(b => b.slug === bg)) s.background = bg;
  return s;
}

function saveState() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}

/* ---------- helpers ---------- */

// Measured fit: render at `base`, compare against the container width,
// scale the font-size down proportionally if it overflows.
function fitText(el, { base, min = 18 } = {}) {
  const parent = el.parentElement; // .banner__text
  if (!parent || parent.clientWidth === 0) return;
  el.style.fontSize = base + 'px';
  const naturalWidth = el.scrollWidth;   // forces layout — fine here
  const avail = parent.clientWidth;
  if (naturalWidth <= avail) return;
  // 0.98 leaves a hair of breathing room so rounding doesn't reintroduce overflow.
  el.style.fontSize = Math.max(min, Math.floor(base * (avail / naturalWidth) * 0.98)) + 'px';
}

// Safe filename fragment.
const safeName = s => (s || 'player').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'player';

/* ---------- DOM refs ---------- */

const $ = sel => document.querySelector(sel);

const refs = {
  thumb:        $('#thumb'),
  previewFrame: $('#previewFrame'),
  thumbBg:      $('#thumbBg'),
  tagLine:      $('#tagLine'),
  titleLine:    $('#titleLine'),
  subtitleLine: $('#subtitleLine'),
  noteLine:     $('#noteLine'),
  avatarBox:    $('#avatarBox'),
  bgGrid:       $('#bgGrid'),
  // OWCT-PoV layout
  tournamentLine: $('#tournamentLine'),
  hudAvatar:    $('#hudAvatar'),
  hudName1:     $('#hudName1'),
  povTag:       $('#povTag'),
  hudVs:        $('#hudVs'),
  roundBadge:   $('#roundBadge'),
  layoutPicker: $('#layoutPicker'),
  ctrls: {
    you:      $('#youInput'),
    opponent: $('#opponentInput'),
    part:     $('#partInput'),
    note:     $('#noteInput'),
    title:    $('#titleInput'),
    tag:      $('#tagInput'),
    tournament: $('#tournamentInput'),
    avatar:   $('#avatarToggle'),
  },
};

/* ---------- render ---------- */

function subtitleText() {
  const you = (state.you || '').trim();
  const opp = (state.opponent || '').trim();
  const part = (state.part || '').trim();
  let s = opp ? `${you} v. ${opp}` : you;
  if (part) s += `, Part ${part}`;
  return s;
}

function render() {
  const owct = state.layout === 'owct';
  refs.thumb.classList.toggle('thumb--owct', owct);

  // Background
  const bgFile = bgPath(BACKGROUNDS.some(b => b.slug === state.background)
    ? state.background : DEFAULT_STATE.background);
  if (!refs.thumbBg.src.endsWith(bgFile.slice(1))) refs.thumbBg.src = bgFile;

  const note = (state.note || '').trim();
  const tag = (state.tag || '').trim();
  const part = (state.part || '').trim();

  if (owct) {
    // OWCT-PoV layout — tournament caption + first-person hero nameplate.
    refs.tournamentLine.textContent = (state.tournament || '').trim();

    refs.povTag.textContent = tag;
    refs.hudName1.textContent = (state.you || '').trim();
    fitText(refs.hudName1, { base: 104, min: 44 });

    const opp = (state.opponent || '').trim();
    refs.hudVs.textContent =
      (opp ? `vs ${opp}` : '') + (part ? `${opp ? ' · ' : ''}Part ${part}` : '');
    fitText(refs.hudVs, { base: 38, min: 20 });

    refs.roundBadge.textContent = note;
    refs.roundBadge.hidden = note === '';

    refs.hudAvatar.hidden = !state.showAvatar;
  } else {
    // Channel layout — banner strip.
    refs.tagLine.textContent = tag;
    refs.titleLine.textContent = (state.title || '').trim();
    refs.subtitleLine.textContent = subtitleText();

    refs.noteLine.textContent = note;
    refs.noteLine.hidden = note === '';

    fitText(refs.titleLine, { base: 76, min: 34 });
    fitText(refs.subtitleLine, { base: 42, min: 20 });

    refs.avatarBox.hidden = !state.showAvatar;
  }

  // Layout picker selected state
  refs.layoutPicker.querySelectorAll('.layout-chip').forEach(chip => {
    chip.classList.toggle('is-selected', chip.dataset.layout === state.layout);
  });

  // Background grid selected state
  refs.bgGrid.querySelectorAll('.bg-chip').forEach(chip => {
    chip.classList.toggle('is-selected', chip.dataset.slug === state.background);
  });

  saveState();
}

/* ---------- preview scaling ---------- */

function fitPreview() {
  const scale = refs.previewFrame.clientWidth / 1280;
  refs.thumb.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fitPreview);

/* ---------- background grid build ---------- */

function buildBgGrid() {
  refs.bgGrid.innerHTML = '';
  for (const bg of BACKGROUNDS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'bg-chip';
    chip.dataset.slug = bg.slug;
    chip.title = bg.label;

    const img = document.createElement('img');
    img.src = bgPath(bg.slug);
    img.alt = bg.label;
    img.loading = 'lazy';
    chip.appendChild(img);

    const label = document.createElement('span');
    label.className = 'bg-chip__label';
    label.textContent = bg.label;
    chip.appendChild(label);

    chip.addEventListener('click', () => {
      state.background = bg.slug;
      render();
    });
    refs.bgGrid.appendChild(chip);
  }
}

/* ---------- input wiring ---------- */

function wireInputs() {
  const bind = (ctrl, key) => {
    ctrl.value = state[key];
    ctrl.addEventListener('input', e => {
      state[key] = e.target.value;
      render();
    });
  };
  bind(refs.ctrls.you, 'you');
  bind(refs.ctrls.opponent, 'opponent');
  bind(refs.ctrls.part, 'part');
  bind(refs.ctrls.note, 'note');
  bind(refs.ctrls.title, 'title');
  bind(refs.ctrls.tag, 'tag');
  bind(refs.ctrls.tournament, 'tournament');

  refs.ctrls.avatar.checked = state.showAvatar;
  refs.ctrls.avatar.addEventListener('change', e => {
    state.showAvatar = e.target.checked;
    render();
  });

  refs.layoutPicker.querySelectorAll('.layout-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.layout = chip.dataset.layout;
      render();
    });
  });
}

/* ---------- download ---------- */

const dlBtn = $('#downloadBtn');
const dlHint = $('#downloadHint');

dlBtn.addEventListener('click', async () => {
  dlBtn.disabled = true;
  const originalText = dlBtn.textContent;
  dlBtn.textContent = 'Rendering…';

  try {
    // 1. Wait for fonts so Inter doesn't fall back in the export.
    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    // 2. Wait for every <img> inside .thumb to be fully loaded.
    await Promise.all(
      Array.from(refs.thumb.querySelectorAll('img')).map(img =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise(res => {
              img.addEventListener('load', res, { once: true });
              img.addEventListener('error', res, { once: true });
            })
      )
    );

    // 3. Export mode: solid banner bg — backdrop-filter rarely survives html-to-image.
    refs.thumb.classList.add('exporting');

    // 4. Temporarily reset the preview transform so we capture the native box.
    const prevTransform = refs.thumb.style.transform;
    refs.thumb.style.transform = 'scale(1)';
    const prevOverflow = refs.previewFrame.style.overflow;
    refs.previewFrame.style.overflow = 'hidden';

    let blob;
    try {
      // Firefox regularly fails the FIRST html-to-image pass while the big
      // background image gets inlined; retrying hits the cache and succeeds.
      // Do NOT cacheBust — a fresh query string would defeat the retry.
      const opts = {
        width: 1280,
        height: 720,
        pixelRatio: 1,
        backgroundColor: '#070d18',
      };
      let lastErr;
      for (let attempt = 0; attempt < 3 && !blob; attempt++) {
        try {
          blob = await htmlToImage.toBlob(refs.thumb, opts);
        } catch (e) {
          lastErr = e;
        }
      }
      if (!blob && lastErr) throw lastErr;
    } finally {
      refs.thumb.style.transform = prevTransform;
      refs.previewFrame.style.overflow = prevOverflow;
      refs.thumb.classList.remove('exporting');
    }

    if (!blob) throw new Error('toBlob returned null');

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const part = (state.part || '').trim();
    a.download = `${safeName(state.you)}-v-${safeName(state.opponent)}${part ? '-part-' + safeName(part) : ''}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    dlHint.textContent = `Saved ${a.download}`;
  } catch (err) {
    console.error(err);
    alert('Export failed: ' + (err.message || err));
  } finally {
    dlBtn.disabled = false;
    dlBtn.textContent = originalText;
  }
});

$('#resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all fields to defaults?')) return;
  state = structuredClone(DEFAULT_STATE);
  wireDefaults();
  render();
});

function wireDefaults() {
  refs.ctrls.you.value = state.you;
  refs.ctrls.opponent.value = state.opponent;
  refs.ctrls.part.value = state.part;
  refs.ctrls.note.value = state.note;
  refs.ctrls.title.value = state.title;
  refs.ctrls.tag.value = state.tag;
  refs.ctrls.tournament.value = state.tournament;
  refs.ctrls.avatar.checked = state.showAvatar;
}

/* ---------- boot ---------- */

buildBgGrid();
wireInputs();
render();
// Wait one frame so layout settles before measuring.
requestAnimationFrame(fitPreview);
// And once again after fonts load (text metrics shift).
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => { fitPreview(); render(); });
}
