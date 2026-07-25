# Reigen Arataka fan site — build report

Handoff: ui-ux-designer → code-reviewer. Date 2026-07-25.

## Files created

- `index.html` — whole page, all content in markup (no JS-injected text)
- `css/style.css` — single stylesheet, ~830 lines, token-driven
- `js/main.js` — entry, imports two modules, nothing else
- `js/scroll-reveal.js` — IntersectionObserver reveals + stagger
- `js/nav-highlight.js` — `aria-current` on in-view section + keeps active chip in view
- `assets/favicon.svg` — original salt-splash mark

Untouched as instructed: `README.md`, `.github/`, `.nojekyll`, `plans/`.
All paths relative (`./css/…`). Verified zero root-absolute refs → Pages-safe.

## Design system

Palette (contrast vs `--ink #0c0c11`, all computed):
- ink #0c0c11, ink-2 #14141c, ink-3 #1d1d28, line #2c2c3a / #3d3d50
- paper #f2ede2 (11.9:1), paper-dim #b8b2a6 (7.0:1), paper-mute #8f8a80 (4.6:1)
- magenta #ff3d7f (5.6:1), teal #17d6c6 (10.4:1), acid #d8f24a (14.9:1), tan #d9b483 (8.4:1)

Type — 3 Google families, all with Vietnamese subsets; mono is system stack (saves a request):
- display `Archivo Black` (hero, section titles, meters values)
- body/UI `Archivo` 400..700
- pull quotes `Newsreader` italic (editorial weight, carries the quotes section)
- `--f-ja` separate CJK stack (Hiragino/Yu Gothic/Meiryo/Noto Sans JP) — Latin webfonts have no kanji; without this the 霊 mark rendered as tofu
- fluid `clamp()` scale, 8 steps, `--fs-hero` 2.75→8.5rem

Motion:
- reveal 560ms `cubic-bezier(.2,.7,.3,1)`, translateY(18px)+opacity, 70ms stagger capped at 4 steps
- meter fills scaleX 900ms
- hover/UI 150–240ms
- `prefers-reduced-motion: reduce` → all durations 1ms, delays 0, reveals and meters forced to final state, scroll-cue animation off, `scroll-behavior: auto`

Original art (all hand-authored, no external assets): CSS aura blobs + SVG ray burst, abstract faceless suit-and-tie figure (geometric paths, no facial features — suggestive not derivative), salt-splash dot-field divider (17 hand-placed radial gradients), salt-grain SVG symbol on technique cards, segmented "100%"-style meters, halftone dot overlay at 5%.

## Section inventory

Hero (EN+JA name, struck-through "self-proclaimed", self-title, tagline, 0%/100% stat chips, inline fan-made note) → 01 Profile (identity table) → 02 Who He Is (drop cap prose + pull quote) → 03 Personality (6 traits) → 04 What He Can Actually Do (2-panel real-vs-performed split, meters left / salt-branded "techniques" right, punchline) → 05 In His Own Words (5 quotes) → 06 The People Around Him (6 cards) → 07 Story Arcs (timeline, 3 gated) → footer (disclaimer + sources).

Sticky in-page nav; horizontal scroll strip <56rem with right-edge fade affordance.

## Fact-sheet items deliberately omitted

- **MBTI ENFJ** — dropped entirely per instruction (fan speculation, not canon).
- **Cheese-Burger Tornado** — report itself calls it "more a gag than a recurring technique"; unsourced → omitted. 4 techniques kept, all report-backed.
- **All quote citations** — report flags every quote's episode/chapter as unverified (Uncertainty 1 & 5). No source lines shown at all; one honest note explains why rather than a guessed citation. No episode number invented anywhere.
- **Quote 3** — near-duplicate of quote 2 (same lesson, S2 variant); cut for tightness. 5 of 6 quotes used.
- **Kanji meaning gloss** (霊験灼か / "strikingly blessed") — Uncertainty 2, single source → kanji shown, no interpretation.
- **Manga Ch.1 title** — Uncertainty 3 says chapter title unverified → "Chapter 1" only. Anime ep 1 title kept (IMDb-sourced).
- **Arc episode ranges** — Uncertainty 4 → arcs ordered by name/phase, no episode numbers; footnote says why.
- **Serizawa's job title** — Uncertainty 6 → "works alongside", no title.
- **Spoiler leakage** — report's summary ties his arc to the Separation Arc; kept out of hero/intro. Tome's later secretary role and Dimple's later companion role also dropped (mild spoilers, low value).

Gated behind `<details>` with SPOILERS badge + reveal/hide affordance: Separation, Reunion & Rebuild, Finale (incl. the Toichiro confrontation).

## Accessibility

- Landmarks: 1 `header`, 1 `nav` (`aria-label`), 1 `main`, 1 `footer`. Verified counts.
- Exactly 1 `h1`; heading order dumped and checked — h1→h2→h3→h4, no skips.
- Skip-to-content link, visible on focus (acid block, verified by screenshot).
- `:focus-visible` 3px acid outline, 3px offset, global.
- Text contrast meets AA everywhere. Hero kicker initially measured **4.37:1** over the aura — fixed with a two-layer scrim on `.hero__art::after`, re-measured from actual screenshot pixels at **4.92:1**.
- Decorative SVG (`.sprite`, hero art, meter tracks, timeline dots, footer mark) all `aria-hidden="true"` / `focusable="false"`. Meters expose label+value as text; only the bar is hidden.
- Japanese text wrapped in `lang="ja"` (hero, table, brand mark, footer mark). `lang="en"` on `<html>`.
- Touch targets: nav links, brand and spoiler summaries all ≥44px min-height.
- Profile table stacks label-over-value below 44rem with explicit `role="table"/"rowgroup"/"row"/"rowheader"/"cell"` so semantics survive the `display:block` restyle.
- Print stylesheet forces reveals visible and drops decoration.

## No-JS / resilience

Found and fixed a real defect during testing: the head inline script set `html.js` (which arms the `opacity:0` hidden state), but inline scripts still run when an *external module* fails — so blocking `js/main.js` left **all 36 reveal blocks invisible**. Now the inline script self-disarms: it removes the `js` class after 1200ms unless `scroll-reveal.js` has set `documentElement.dataset.revealReady`. Verified with scripts network-aborted: `hiddenReveals 0/36`, `collapsedMeters 0`. JS fully disabled never runs the inline script at all → everything visible by default. Nav degrades to plain anchors.

## How I verified

Served `python -m http.server 8099`, drove real Chromium via `agent-browser`.

- All 6 assets return 200 (index, css, 3 js, favicon).
- `agent-browser errors` and `console`: **empty** on every pass.
- Screenshots reviewed and iterated at 320, 480, 768, 1024, 1280, 1400px.
- Horizontal overflow: `documentElement.scrollWidth == clientWidth` at 320/480/768/1024. Only nav chips exceed their own scroll container (intended).
- Contrast measured by sampling actual screenshot pixels with ImageMagick, then computing WCAG ratios — not eyeballed.
- Reduced motion via `set media reduced-motion`: reveals visible, `animationName: none`, transitions 0.001s, meters uncollapsed.
- Reveal + nav highlight live: scrolled to Abilities → 14/36 revealed progressively, `aria-current` = "Abilities".
- Spoiler `<details>`: keyboard focus lands on summary, click toggles `open`, focus ring visible.
- Copyright audit: `0` `<img>` tags, `0` raster references, external hosts limited to Google Fonts + cited sources + github contact.
- CSS braces balanced (232/232); no root-absolute URLs in HTML or CSS.

Fixes made from self-review: CJK font stack (tofu), brand mark size, hero scrim for AA, larger salt icons, mobile table stacking (was cramped/clipped at 320), nav scroll affordance, `h1` accessible name ("ReigenArataka" → "Reigen Arataka"), no-JS failsafe.

## Unresolved questions

1. Google Fonts is an external dependency — served offline the 3 families fall back to system stacks (layout holds, character changes). Self-host if offline fidelity matters.
2. Meter ratings other than "psychic ability: none" are my editorial estimates. Captioned as such on-page. Say the word and I'll cut the bars to the one canon value.
3. "Confidence 100%" hero chip is invented flavour (deliberate joke against the canon 0%). Flagged in case you want strict facts only.
4. Hero figure is intentionally faceless/abstract for copyright safety — confirm the abstraction level reads as tribute rather than likeness.
5. Kept 5 of 6 quotes (dropped the near-duplicate). Restore quote 3 if you want the S2 phrasing too.

Status: DONE
Summary: Single-scroll fan tribute page built and shipped as plain static HTML/CSS/ES-modules with original CSS/SVG art only; verified in a real browser at 320–1400px with zero console errors, AA contrast measured from pixels, full reduced-motion and no-JS support.
Concerns/Blockers: Two invented-but-labelled editorial values (skill bars, "Confidence 100%") are the only non-canon content on the page — both captioned; drop them if the bar is strict facts only.
