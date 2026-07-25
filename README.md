# Reigen Arataka — a fan page

An unofficial, non-commercial fan page about **Reigen Arataka** (霊幻新隆), the
self-proclaimed "Greatest Psychic of the 21st Century" from ONE's *Mob Psycho
100*. A single scrolling page of plain HTML, CSS and ES modules — no build step,
no framework, no dependencies to install.

**Live:** https://tiennm99.github.io/reigen/ — also mirrored at
https://reigen.web.app. The GitHub Pages URL is canonical; the page carries a
`rel="canonical"` link so the two copies aren't treated as duplicates.

## What's on it

Ten numbered sections in one scroll — profile, who he is, origin story,
personality, the look, an abilities panel that sets his four real skills against
his four branded fake "techniques", quotes, the people around him, story arcs and
trivia — then a credits footer.

- **No official artwork of the character, anywhere.** The portrait, aura, salt
  motifs and favicon are hand-authored SVG and CSS, drawn for this page. The
  portrait is a single SVG symbol whose fills read custom properties, so one
  drawing re-colours itself for the manga and anime palettes in *The look*.
- **Photographic textures are licensed stock**, used as low-opacity backdrops:
  one CC0, two under the Unsplash License, each credited in the footer with
  author and source. None of them depict the character or the series — see
  [Licensing](#licensing-and-credits).
- **Content lives in the HTML**, not injected by JavaScript, so the page reads
  fine with scripting off and is indexable.
- **Accessible by construction** — semantic landmarks, skip link, one `<h1>`,
  keyboard-operable spoiler disclosures, visible focus rings, WCAG AA text
  contrast, decorative SVG hidden from assistive tech.
- **Spoilers are opt-in.** Story-arc entries that reveal plot sit behind
  `<details>` disclosures with a SPOILERS badge; nothing is spoiled above them.
- **Motion is optional.** Scroll reveals and the nav highlight are progressive
  enhancement, and `prefers-reduced-motion: reduce` turns the animation off.
  If the JavaScript fails to load, the reveal state disarms itself so no content
  can be left invisible.

## Run locally

It uses ES modules, so open it through a local server rather than `file://`:

```bash
python -m http.server 8099
# then visit http://localhost:8099
```

## Project structure

```
index.html            # the whole page — all content is in the markup
css/style.css         # design tokens, layout, texture machinery, CSS/SVG artwork
js/main.js            # entry point; wires up the enhancements
js/scroll-reveal.js   # IntersectionObserver reveals (reduced-motion aware)
js/nav-highlight.js   # highlights the nav link for the section in view
assets/favicon.svg    # original salt-splash mark
assets/textures/      # 3 licensed photographic backdrops (~84 KB total)
plans/reports/        # research, build and review notes
.github/workflows/    # GitHub Pages deployment
```

Type is loaded from Google Fonts (Archivo, Archivo Black, Newsreader) with
system-font fallbacks, so the page still sets sensibly if the request fails.

## Deployment

Pushing to `main` deploys to **two hosts in parallel**, both from the same
commit:

- `.github/workflows/deploy-pages.yml` → **GitHub Pages** (canonical) at
  `tiennm99.github.io/reigen`. Enable once under **Settings → Pages → Source:
  GitHub Actions**.
- `.github/workflows/firebase-hosting-merge.yml` → **Firebase Hosting** (mirror)
  at `reigen.web.app`, authenticating with the `FIREBASE_SERVICE_ACCOUNT_REIGEN`
  repo secret. A second workflow posts a preview channel on pull requests.

Two things to keep in mind when changing either:

- **Paths must stay relative** (`./css/style.css`). Pages serves from a project
  subpath (`/reigen/`), so a root-absolute path 404s there even though it would
  work fine on Firebase.
- **Neither host may publish `plans/`.** The Pages workflow stages an explicit
  file list into `_site`; `firebase.json` excludes `plans/**` from its ignore
  list. Both were leaking those internal notes at one point — if you add a new
  directory of working files, exclude it in both places.

`firebase.json` deliberately has **no `rewrites`**. `firebase init` offers a
single-page-app catch-all (`** → /index.html`); this site is one page of anchor
links with no client-side router, so that rewrite would only turn every missing
asset into an HTTP 200 serving the whole page, hiding broken links from us and
feeding duplicate URLs to crawlers.

## Licensing and credits

This is a **fan work**. *Mob Psycho 100* and all its characters are the property
of **ONE, Shogakukan, and studio Bones**. This page is not affiliated with,
authorised by, or endorsed by any of them, and nothing here is for sale.

No official art, screenshots or logos are used, reproduced or hotlinked. Every
depiction of the character in this repo is original vector work drawn for it —
there is deliberately no image *file* of him at all, because a picture of a
copyrighted character stays copyrighted no matter who draws or licenses it.
Character quotes are short excerpts used for commentary and attributed to Reigen.

The photographic textures in `assets/textures/` are licensed stock that has
nothing to do with the series — aged paper under **CC0 1.0**
(ambientCG/Lennart Demes via Wikimedia Commons), plus a
night skyline and a bokeh/dust abstract under the **Unsplash
License**. Per-image authors, licenses and source links are in the page footer
and in `plans/reports/from-researcher-to-ui-designer-cc0-texture-manifest-report.md`.

Factual content was compiled from the sources credited in the page footer — the
Mob Psycho 100 Wiki and MyAnimeList for character details, Wikipedia and Anime
News Network for production and cast credits, and a number of anime news and
listicle sites for the rest. Those last ones are the weakest link, and they are
why two claims turned out to be contested.

Claims that could not be corroborated were left out rather than guessed at, ones
that sources genuinely disagree on are shown as disagreeing, and quotes carry no
episode or chapter citation because their provenance could not be verified — an
invented citation would be worse than none.

The site's own code and original artwork are released under the MIT License (see
`LICENSE`). That covers this repo's own work only — not the series, and not the
third-party textures, which keep their own licences as credited above. If you
hold rights to the series and want something changed or taken down, open an issue
or reach me at [github.com/tiennm99](https://github.com/tiennm99).
