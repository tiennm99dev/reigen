# Reigen Arataka — Three.js

A tiny web app that draws **Reigen Arataka** from *Mob Psycho 100* — his face
and slicked-back hair — as a flat **2D portrait rendered "using points"**, built
with **plain JavaScript and Three.js only**. No build step, no framework.

The character is defined once as shaded vector regions (`THREE.Shape`) in
`reigen-regions.js`, then each region is sampled into ~3 million coloured points
drawn as a single `THREE.Points` cloud through an orthographic camera. This is
an **original fan interpretation** of the character (not a traced official
image).

**Live demo:** https://tiennm99.github.io/reigen/

## Features

- **Point-cloud portrait** (~3M points): slicked-back side-parted hair with neat
  swept-back grooves, high forehead, sharp half-lidded confident eyes with the
  signature heavy eye-line, thin angled brows, a defined nose, a smug smirk,
  ears, and a light suit with a shirt V and red tie.
- **Form shading** via per-point vertical gradients (lit-from-above skin, crown
  highlight / darker hair roots, jacket shading, under-chin neck shadow, and a
  soft forehead shadow). A custom round-point shader keeps the cloud solid and
  crisp at any zoom or export size.
- **6 shot framings** (full, portrait, face, "the stare", hair, smirk) with a
  smooth tween; scroll to zoom.
- **Download ~100 MP PNG** — a single 100-megapixel framebuffer isn't feasible
  in WebGL, so the current framing is rendered in **supersampled tiles** into a
  ~10000×10000 image and saved. Points stay sharp and anti-aliased at that size.

## Run locally

Because it uses ES modules and an import map, open it through a local server
(not `file://`):

```bash
python3 -m http.server 8099
# then visit http://localhost:8099
```

## Project structure

```
index.html                 # markup, import map, UI chrome
css/style.css              # layout and controls styling
js/main.js                 # renderer, ortho camera, shots, tiled 100MP export, loop
js/reigen-regions.js       # Reigen as placed vector regions (single source)
js/reigen-points.js        # samples regions into the THREE.Points cloud + shader
js/camera-shots.js         # 2D framing presets (zoom + pan)
.github/workflows/         # GitHub Pages deployment
```

Three.js is loaded from a CDN via the import map in `index.html`.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow
(`.github/workflows/deploy-pages.yml`), which publishes the repo root to GitHub
Pages. Enable Pages once under **Settings → Pages → Source: GitHub Actions**.
