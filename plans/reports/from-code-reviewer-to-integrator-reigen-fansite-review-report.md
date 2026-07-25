# Reigen fan page — production-readiness review

Reviewer: code-reviewer · 2026-07-25 · branch `main` @ b3e435c (working tree clean)
Scope: `index.html` (573 L), `css/style.css` (994 L), `js/main.js`, `js/scroll-reveal.js`, `js/nav-highlight.js`, `assets/favicon.svg`, `README.md`. ~1714 LOC.

**Method — empirical.** Browser automation *was* available: `playwright-core` driving the local Chromium build at
`~/AppData/Local/ms-playwright/chromium-1228`, against `python -m http.server 8099`. 10 scripted runs: robustness matrix
(JS off / `js/*` aborted / partial graph / throw-after-signal / IO removed / 2.5 s-delayed modules), 12-width responsive
sweep, pixel-sampled contrast (screenshot with glyphs forced transparent → canvas decode → real rendered background),
CDP `Accessibility.getFullAXTree`, keyboard driving, print-media emulation, dead-selector scan. Findings marked
**[verified]** were reproduced; **[suspected]** is code-reading only.

---

## Blocker

### B1. `revealReady` is signalled before the work, so a mid-execution throw hides the page permanently [verified]
`js/scroll-reveal.js:20` — `document.documentElement.dataset.revealReady = 'true'` is the **first** statement of
`initScrollReveal()`. The inline failsafe (`index.html:29-31`) only drops `html.js` if that flag is unset at 1200 ms.
Anything that throws *after* line 20 disarms the failsafe and leaves `.js [data-reveal] { opacity: 0 }` (`css/style.css:955`)
in force forever.

Reproduced by serving a `scroll-reveal.js` that sets the flag then throws:

```
E: reveal signals then throws
  totalReveal=36 hiddenBeforeScroll=36 hiddenAfterFullScroll=36
```

36 of 36 revealed blocks — the whole profile table, all prose, all traits, both ability panels, every quote, all arcs —
stay at `opacity: 0` after scrolling the full page. Only the hero and footer remain readable. Failure scenario: any
future edit to the stagger loop / `matchMedia` / `IntersectionObserver` construction, a partial CDN or extension-mangled
delivery, or a browser that throws on `IntersectionObserver` options. Passing CI proves nothing here.

Fix (both halves):
1. Move the signal to the end of successful setup — after the `targets.forEach(el => observer.observe(el))` loop, and
   after each early `return` path (`revealAll()` branches).
2. Make the module fail loudly-but-safely: wrap the body in `try { … } catch (e) { document.documentElement.classList.remove('js'); throw e; }`.

Verified-clean counterparts, for contrast — the rest of the progressive-enhancement contract is sound:
JS fully disabled → `hiddenWithText=0`; `js/*` aborted → `0`; only `nav-highlight.js` aborted → `0`;
`IntersectionObserver` deleted → `0`; modules delayed 2.5 s (arriving after the disarm) → `0`, degrades to no animation.

---

## Major

### M1. Hero disclaimer fails WCAG AA at ≤480 px — it sits on top of the tan figure [verified]
`css/style.css:425-431` (`.hero__note`, `--paper-mute` #8f8a80) over `css/style.css:305-311` (`.figure`, `--tan` at
`opacity: .5`). The scrim at `css/style.css:258-269` darkens only the *left* 70% and the *top* 40%; the figure is
bottom-right, exactly where the note lands once the hero body is full-width.

Pixel-sampled against the real rendered background:

| viewport | bg avg | contrast | verdict (13 px text, needs 4.5:1) |
|---|---|---|---|
| 320 | rgb(56,58,52) | **3.35:1** | FAIL |
| 360 | rgb(52,54,49) | **3.56:1** | FAIL |
| 390 | rgb(48,50,46) | **3.77:1** | FAIL |
| 480 | rgb(30,35,34) | 4.64:1 | marginal |
| ≥600 | rgb(13-16,…) | 5.2–5.5:1 | pass |

Worst single glyph column is **1.5:1** (background rgb(118,104,80) — the jacket). Screenshot at 360 px confirms the
text is rendered across the figure's head and shoulder. This is the "fan-made / not affiliated" notice, i.e. the one
paragraph with legal weight, unreadable on the most common viewport class.

Fix: extend the scrim's vertical gradient to cover the bottom (add a `linear-gradient(0deg, rgba(12,12,17,.8), transparent 45%)`
layer), or below `48rem` move `.figure` clear of the copy / drop its opacity, or give `.hero__note` its own
`background: rgba(12,12,17,.72)` + padding. Do not fix by lightening `--paper-mute` alone — the worst pixel is 1.5:1.

### M2. Profile table publishes a disputed birthday as flat fact [verified — contradicts the page's own policy]
`index.html:153` → `Birthday | December 10`. Public sources disagree (December 10 vs October 10 across fan databases).
The footer at `index.html:558-560` states *"Claims that sources disagreed on, or that could not be verified, were left
off this page rather than published as fact"*, and `README.md:76-79` repeats it. The page breaks its own stated
integrity rule in row 3 of its first data table. Fix: drop the row, or label it `December 10 (sources vary)`.

### M3. `English voice: Chris Niosi` is presented as the single canon answer [verified as incomplete]
`index.html:160`. The role was recast across the run — Kyle McCarley voiced Reigen for Season-2-era dub material, with
Niosi credited again for Season 3. A bare name reads as "the" English VA. Fix: `Chris Niosi (S1, S3); Kyle McCarley (S2-era)`,
or scope the row to the season the rest of the row cites. Same policy conflict as M2.

### M4. The skill bars read as canon stats, not as fan flavour — plainly [verified by inspection of rendered page]
Asked directly: **to a first-time visitor these read as canon stats.** `index.html:256-284` renders four precise
percentages (94 / 90 / 88 / 72%) as filled segmented meters in a panel headed "Genuine → Real skills", inside a page
whose immediately preceding section is a sourced production data table. The visual grammar is a stat block; the
"Expert / Very high / Surprising" labels do not undercut it because the bar lengths are visibly distinct and precise.

Mitigations exist but are too weak: the disclaimer (`index.html:289`) is `--fs-xs` / `--paper-mute` fine print placed
*after* all five rows, i.e. the least prominent text in the panel, read last; and the "one number on this page that is
canon" note (`index.html:286`) is attached to a different row. Note also the meter track is `aria-hidden="true"`, so
screen-reader users get "Massage & acupressure — Expert" and never see a number — the two audiences are shown
different claims.

Fix (pick one): (a) move the disclaimer above the list as a visible `.panel__intro` sibling to the "Theatre" panel's
intro, so the framing lands before the data; (b) drop numeric precision to a coarse 5-segment "4 of 5" rendering that
cannot be misread as a percentage; (c) both. Everything else in this area is clean — no episode or chapter citations on
any quote, the "why no citation" note at `index.html:372-376` is honest, arcs carry no invented ranges, and
`Chapter 1` / `S1E1 + title + July 2016` are real and verifiable.

---

## Minor

- **m1. `README.md:29-30` overstates the failsafe** — *"If the JavaScript fails to load, the reveal state disarms
  itself so no content can be left invisible"*. False for B1 (loads, then throws). `README.md:23-24` claims
  "WCAG AA text contrast" — false at ≤480 px per M1. Fix both after the code fixes. [verified]
- **m2. No error isolation in the entry point** — `js/main.js:11-12` calls `initScrollReveal()` then
  `initNavHighlight()` bare. A throw in the first prevents the second (and vice-versa for future inits). Wrap each in
  `try/catch`. [suspected — ordering read from source; B1 is the reproduced consequence]
- **m3. Footer source links miss the 24 px target minimum** — `css/style.css:927-928`: `.sources li` links measure
  15 px tall with an 8 px `gap` (≈23 px effective spacing) at 390 px. Each `<li>` contains only a link, so the
  inline-text exemption for WCAG 2.2 SC 2.5.8 is arguable at best. Fix: `gap: var(--sp-3)` or
  `.sources li a { display: inline-block; padding-block: 0.3rem }`. Nav links (37 px) and summaries (44 px) are fine. [verified]
- **m4. Print force-opens every spoiler** — `css/style.css:992` `.spoiler__body { display: block }` overrides the
  closed `<details>`. In print media the closed body renders 233 px tall, so printing or PDF-ing the page dumps all
  three spoiler arcs while the summary still reads "reveal". If intentional, it defeats the opt-in gate for anyone who
  saves the page to read later. Decide: drop the rule, or add a print-only note that spoilers are expanded. [verified]
- **m5. Skip link leaves focus on `<body>`** — after Tab+Enter, `document.activeElement === BODY` (scrollY 65, i.e. the
  scroll lands correctly). Chromium's sequential-focus starting point makes the next Tab land inside `main`, so it
  works here, but this relies on non-universal behaviour. Add `tabindex="-1"` to `<main id="main">` (`index.html:79`). [verified]
- **m6. Nav edge fade never retracts** — `css/style.css:189-196` `.site-nav::after` is unconditional below `56rem`.
  Scrolled fully to the end at 360 px, it still overlays the last 23 px of the "Arcs" chip, dimming its trailing glyphs
  from 9.25:1 to 6.5:1 (still AA-pass, so cosmetic) and implying content that isn't there. Fix: fade it out via a
  scroll-driven class, or `mask-image` on the `ul` instead. [verified]
- **m7. `--header-h` is a wrong hardcoded guess** — `css/style.css:53` declares `4.25rem` (68 px); measured header is
  **98 px** below 900 px viewport and 65 px above. `.section { scroll-margin-top: calc(68px + 1rem) }` is therefore
  14 px short on mobile. No visible defect *today* — anchor landings measured clean at 360 and 1280 px (`#profile`
  numTop 141 vs header bottom 98) because `--sp-9` section padding absorbs the error — but the token is a latent trap.
  Fix: `scroll-margin-top: 7rem` for the narrow case, or set `--header-h` from a media query. [verified]
- **m8. Pseudo-element text leaks into the disclosure's accessible name** — `css/style.css:887-896` `content: "reveal"`
  yields AX name `"SPOILERS LATER ARC — THE TURN REVEAL"` (and `… HIDE` when open), duplicating state that the
  `DisclosureTriangle` role + `expanded` property already convey. Harmless but noisy. [verified]

## Nit

- `--fs-xl` (`css/style.css:40`) is defined and never referenced — the *only* unused token, and the dead-selector scan
  found **zero** unmatched selectors across the whole sheet. Token/CSS hygiene is genuinely good. [verified]
- `css/style.css:898` sets `padding` then `padding-top` in the same block; fold into one declaration.
- `css/style.css:684` `background-size: 11px 100%` is redundant — the `repeating-linear-gradient` already has an 11 px period.
- `css/style.css:749` `.quote` transitions `transform`, but no rule ever changes its transform.
- `README.md:12` says "Ten sections"; nine are listed. `README.md:13` says "four real skills"; the list has five rows.
- No `og:image` (`index.html:11-14`), so link previews render bare.

---

## Clean areas (one line each)

- **No-JS / broken-JS robustness:** clean apart from B1 — 5 of 6 failure modes leave 0 hidden elements.
- **Responsive 320→1400 px:** clean. `documentElement.scrollWidth === clientWidth` at all 12 widths tested; zero
  page-level horizontal overflow; the only internal overflows are intentional (`.site-nav ul` scroller, `.hero__art`
  clip, `.visually-hidden` caption). No overflow or layout break with Google Fonts blocked either.
- **Stacked profile table ARIA:** clean and *effective*, not just valid. CDP AX tree is byte-identical at 360 px
  (`display:block`) and 1280 px (native): `table 1, rowgroup 1, row 10, rowheader 10, cell 10, caption 1`, table name
  "Identity and production details for Reigen Arataka". Rows render at 77 px with no zero-height rows; `th` never
  clips (`scrollWidth === clientWidth` at the 44 rem boundary); no horizontal scroll needed at any width.
- **Structure:** exactly one `<h1>`, 33 headings, zero skipped levels; 1 header / 1 main / 1 footer / 1 labelled nav;
  zero unlabelled `<section>`s.
- **Keyboard & focus:** clean. Skip link is first in tab order with a 3 px `--acid` outline; nav links, summaries,
  footer links and brand all show the same visible ring; `<summary>` toggles on both Enter and Space.
- **Contrast elsewhere:** 29 of 31 pixel-sampled targets pass (only `.hero__note` fails; `.scroll-cue` is
  `aria-hidden` decoration at 5.2:1 avg). The token comments' claimed ratios are conservative, not optimistic.
- **Errors & paths:** zero console errors and zero failed requests on normal load; zero root-absolute `src`/`href`
  (GitHub Pages subpath safe); no empty links; no `<svg>` missing `aria-hidden` outside an already-hidden ancestor;
  every CJK string carries `lang="ja"`; removing `[data-reveal]` and `.site-nav` from the DOM produces no page errors.
- **Reduced motion:** honoured — reveals bypassed (`hidden=0`), `.scroll-cue` `animation-name: none`.
- **Deploy workflow:** `.github/workflows/deploy-pages.yml` publishes `.` with `.nojekyll` present; correct for a
  project-subpath site.

---

## Unresolved questions

1. **M4** is an editorial judgement, not a spec violation — do you want the percentages softened, or is the fine print
   the accepted trade-off? I recommend (a)+(b), but it is your call to make, not mine.
2. **m4** (print reveals spoilers): intentional "print gives you everything" choice, or an oversight?
3. **M3**: which season's dub cast is the profile table meant to describe? That decides the wording.
4. Is there a target minimum viewport? M1's failure is confined to ≤480 px; if 320 px is out of scope the severity drops.

---

Status: DONE_WITH_CONCERNS
Summary: One blocker — `js/scroll-reveal.js:20` signals the inline failsafe before doing its work, so a throw anywhere
after that line leaves all 36 revealed content blocks permanently invisible (reproduced). Four major issues follow: the
hero legal disclaimer fails WCAG AA (3.35:1 at 320 px) because it renders over the tan figure, and three content-integrity
items where the page publishes disputed or editorial data as canon, contradicting its own stated sourcing policy.
Concerns/Blockers: Everything else is in good shape — no-JS/broken-JS behaviour, responsive layout 320→1400, the stacked-table
ARIA approach, headings, landmarks, keyboard operability and reduced motion all verified clean. Fix B1 before landing;
M1 and M2/M3 are quick and self-contained. Per instruction I changed no files.

---

## Re-verification

Same setup: playwright-core + Chromium 1228 + `python -m http.server 8099`. 6 new scripts, ~40 runs.

**1. Blocker B1 (failsafe ordering) — VERIFIED FIXED.** `revealReady` is now the last statement (`js/scroll-reveal.js:57`).
- throw *after* the observe loop: `hiddenAfterFullScroll=0`, `revealed=36` — flag is set but observation is already live, so the reveal still completes. This is the correct invariant.
- throw *before* the observe loop: flag `unset`, `jsClass=false`, `hidden=0` — failsafe rescues.
- Early-return paths are **harmless, confirmed**, and in fact double-safe: `revealAll()` has already added `is-revealed`, *and* the unset flag makes the failsafe strip `html.js` so the hidden rule goes inert. No-IO → `hidden=0`; reduced-motion → `hidden=0`; isolated zero-target run (`initScrollReveal('[data-no-such-attr]')`) → `ready=unset, js=false, hidden=0`.
- Baseline, `js/*` aborted, JS disabled: `hidden=0`. All 8 paths clean.

**2. Hero disclaimer contrast — VERIFIED FIXED.** Glyph-masked pixel sampling (identical method to the original 3.35:1 finding); background is now solid `rgb(12,12,18)`:

| viewport | 320 | 360 | 390 | 480 |
|---|---|---|---|---|
| avg contrast | **9.25** (was 3.35) | **9.25** (3.56) | **9.25** (3.77) | **9.25** (4.64) |
| worst pixel | **6.51** (was 1.52) | 6.51 | 6.51 | 6.51 |

Worst pixel is now the `--line` border-top, not the jacket. Screenshot at 360: reads as a deliberate caption band, not a mistake; figure still reads (192 px visible, opacity .5, head above the band, tie below). *Cosmetic nit:* the band's hard horizontal edge visibly slices the figure — a bottom-fading gradient would hide the seam.

**3. Disputed facts — VERIFIED FIXED.** 8 rows (was 10); Birthday + English voice gone. Zero matches for `Niosi|EpicStream|Birthday|December|English voice` across `index.html`, `README.md`, `css/`, `js/`. Sources 11→9. Stacked ARIA intact and unchanged between breakpoints: AX `table 1 / rowgroup 1 / row 8 / rowheader 8 / cell 8 / caption 1` identical at 360 px (`th` `display:block`) and 1280 px (`table-cell`); 0 zero-height rows; no table overflow. The GameRant age/height/birthday link is retained but still legitimately supports "Age 28" — not stale.

**4. Skill bars — PARTIALLY FIXED, residual accepted.** `.panel__intro` renders above all five rows at every width tested (320/360/480/700/928/1024/1400: `introAboveRows=true`, no overflow, no panel overlap, 58 rem split breakpoint intact). `.fine-print` still used 3× and `.fine-print--wide` 2× → no CSS went dead; `.panel__intro` 2 uses. **Honest read:** the caveat now lands *before* the data, so a top-to-bottom reader cannot mistake the bars for canon — that closes most of the risk. A skimmer who jumps straight to the bars still meets stat-block grammar, since the percentage-width encoding was kept. Mitigating, and visible in the screenshot: 94/90/88 render within ~1 segment of each other, so the *apparent* precision is much lower than the numbers imply. Raw values remain in the DOM as `--pct`. Not a defect — your editorial call, and the framing fix is the part that mattered.

**5. Print spoiler leak — RETRACTED. My original finding was a measurement artifact; I got it wrong.** Using `checkVisibility({contentVisibilityAuto,opacityProperty,visibilityProperty})` in print media: closed bodies `visible:false`, open body `visible:true`. Re-adding the OLD `.spoiler__body { display: block }` rule in print media leaves them **still `false`** — that rule never defeated the closed `<details>`, because Chrome hides the content via `content-visibility:hidden` on the internal slot, which a descendant's `display` cannot override. My original evidence (`getBoundingClientRect().height === 233`) was invalid: descendants of a closed `<details>` still report layout boxes — the screen control shows the same 233. Net effect of your change: a dead rule removed (small KISS win), behaviour unchanged and now soundly verified correct.

**Regressions — NONE.**
- Page overflow 320→1400: **12/12 widths clean**.
- Structure: 1 `<h1>`, 33 headings, 0 skipped levels, 0 unlabelled sections, 0 root-absolute paths, 0 CJK strings without `lang="ja"`.
- Zero console errors, zero failed requests on normal load.
- Reduced motion: `hidden=0`, `.scroll-cue` `animation-name:none`, `scroll-behavior:auto`.
- Anchor nav and deep-linking re-checked (not previously covered): clicking each nav link and cold-loading `#abilities` reveals all in-view content at 360 and 1280. The 1–2 residual hidden blocks have `visibleRatio` 0.006–0.071, i.e. barely peeking under the `-10%` rootMargin — intended threshold behaviour, they reveal on any scroll.

**Still open (first-pass minors, untouched and not re-tested):** m2 (no `try/catch` isolation in `js/main.js`), m3 (footer link targets ~23 px), m5 (`tabindex="-1"` on `<main>`), m6 (nav edge fade never retracts), m7 (`--header-h` 68 px vs measured 98 px), m8 (pseudo-content in the summary's accessible name), and the nits (`--fs-xl` unused, doubled `padding` declaration, README section/skill miscounts, no `og:image`).

Status: DONE
Summary: All four accepted fixes hold under real-browser verification — the reveal failsafe is now correctly ordered (8/8 failure paths leave nothing hidden), the hero disclaimer went from 3.35:1 to 9.25:1, the disputed rows are cleanly gone with stacked-table ARIA intact at 8 rows, and the skill-bar caveat now precedes the data. No regressions in overflow, structure, errors, or reduced motion; I retract my print-spoiler finding as a measurement artifact of my own making.

---

## Second re-verification

**1. `--header-h` anchor landing — VERIFIED.** Token resolves to `6.25rem`/100px at 360 px (`scroll-margin-top: 116px`, header bottom 98 px) and `4.25rem`/68px at 1280 px (`84px`, header 65 px). All 7 nav links, both widths: nothing lands under the header. Gap from header bottom to the section number is **+75/+76 px** at 360 and **+131 px** at 1280 (h2 +110/+112 and +131). Clearance margin over the sticky header is 18 px at 360, 19 px at 1280 — consistent by design. (My previous "+264 px" numbers were my own harness bug: 950 ms is not enough for the smooth scroll to settle. Re-measured with a scroll-stabilisation loop.)

**2. Footer tap targets — VERIFIED.** `.sources a` heights: **36.9 px** at 360 px, **38.7 px** at 1280 px (2-line IMDb item 57.8/61.3) — all ≥24 px, was ~23. Inter-`li` gaps are now 0, so boxes touch, but the 8 px top + 8 px bottom padding puts 16 px between adjacent link texts (was 8 px). Screenshots at both widths: comfortable, neither cramped nor double-spaced. Adjacent targets touching is fine for SC 2.5.8 since height alone satisfies it.

**3. `.sources li::before` dash alignment — STILL BROKEN (minor).** The dash sits **above** the first line's centre, not on it: off by **−2.3 px at 360 px** and **−1.5 px at 1280 px** (measured against the Range text-box centre of line 1, all 6 items sampled, consistent). At 3× zoom it is plainly high — level with the cap-height rather than mid-glyph. Correct values by measurement are **1.38em at 360 px** and **1.31em at 1280 px**; a single `em` cannot be exact at both because `padding-block` is a fixed 8 px while `--fs-sm` scales. Use either:
- `top: calc(var(--sp-2) + 0.8em)` — padding-top + half the 1.6 line-height, right by construction (≤0.8 px at both), or
- `top: 1.35em` — splits the difference (≤0.6 px at both).
Correct behaviour confirmed on the 2-line IMDb item: its dash tracks the first line, not the block centre.

**4. Band seam + contrast — VERIFIED.** Glyph-masked sampling over the text rows only (bottom fade padding excluded): background is still solid `rgb(12,12,18)` and contrast is **unchanged at crAvg 9.25 / crWorst 6.51** at 320/360/390/480 px. No glyph enters the fade — the last glyph bottom sits **3.1–4.0 px above** the fade start at every width, so the gradient eats no text. Screenshot at 360: the hard horizontal edge is gone, the note now dissolves into the figure's shoulder, and the head/tie still read above and below. The remaining top hairline is the pre-existing `border-top` divider, by design.

**No regressions.** Page overflow: none at 320/360/768/1280/1400. Zero console errors, zero failed requests, 0 hidden `[data-reveal]` after a full scroll.

Status: DONE_WITH_CONCERNS
Summary: Three of four fixes verified clean; the `.sources li::before` dash is still ~1.5–2.3 px above the first line's centre and needs `calc(var(--sp-2) + 0.8em)` (or `1.35em`) instead of `1.2em`.
