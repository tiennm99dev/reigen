# Reigen Arataka — a fan page

An unofficial, non-commercial fan page about **Reigen Arataka** (霊幻新隆), the
self-proclaimed "Greatest Psychic of the 21st Century" from ONE's *Mob Psycho
100*. A single scrolling page of plain HTML, CSS and ES modules — no build step,
no framework, no dependencies to install.

**Live:** https://tiennm99.github.io/reigen/

## What's on it

Ten sections in one scroll: hero, profile, who he is, personality, an
abilities panel that sets his four real skills against his four branded fake
"techniques", quotes, the people around him, story arcs, and the credits.

- **No anime imagery.** Every visual — the aura fields, ray burst, faceless
  suited figure, salt-splash dividers, favicon — is hand-authored CSS and inline
  SVG. There is not a single `<img>` tag or raster file in the repo, which is
  deliberate: see [Licensing](#licensing-and-credits).
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
css/style.css         # design tokens, layout, the CSS/SVG artwork
js/main.js            # entry point; wires up the enhancements
js/scroll-reveal.js   # IntersectionObserver reveals (reduced-motion aware)
js/nav-highlight.js   # highlights the nav link for the section in view
assets/favicon.svg    # original salt-splash mark
plans/reports/        # research and build notes
.github/workflows/    # GitHub Pages deployment
```

Type is loaded from Google Fonts (Archivo, Archivo Black, Newsreader) with
system-font fallbacks, so the page still sets sensibly if the request fails.

## Deployment

Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which publishes the
repo root to GitHub Pages. Enable it once under **Settings → Pages → Source:
GitHub Actions**. Because it deploys to a project subpath (`/reigen/`), all
asset paths must stay relative (`./css/style.css`) — a root-absolute path would
404 in production.

## Licensing and credits

This is a **fan work**. *Mob Psycho 100* and all its characters are the property
of **ONE, Shogakukan, and studio Bones**. This page is not affiliated with,
authorised by, or endorsed by any of them, and nothing here is for sale.

No official art, screenshots or logos are used, reproduced or hotlinked — the
artwork is original to this repo for exactly that reason. Character quotes are
short excerpts used for commentary and attributed to Reigen.

Factual content was compiled from the sources credited in the page footer,
chiefly the Mob Psycho 100 Wiki and Wikipedia. Claims that could not be
corroborated were left out rather than guessed at, and quotes carry no episode
or chapter citation because their exact provenance could not be verified — an
invented citation would be worse than none.

The site's own code and original artwork are free to reuse. If you hold rights
to the series and want something changed or taken down, open an issue or reach
me at [github.com/tiennm99](https://github.com/tiennm99).
