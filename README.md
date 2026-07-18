# Reigen Arataka — Three.js

A tiny web app that draws **Reigen Arataka** from *Mob Psycho 100* — his face
and slicked-back hair — as a flat **2D anime illustration**, built with **plain
JavaScript and Three.js only**. No build step, no framework.

The character is drawn with `THREE.Shape` vector fills and dark outlines on the
XY plane, viewed through an orthographic camera — true 2D, still rendered by
Three.js/WebGL.

**Live demo:** https://tiennm99.github.io/reigen/

## Features

- Flat, outlined **2D vector portrait**: slicked-back side-parted hair with
  swept strands, a high forehead, sharp half-lidded confident eyes with the
  signature heavy eye-line, thin angled brows, a defined nose, a smug smirk,
  ears, and a light suit with a shirt V and red tie.
- **6 shot framings** you can switch between with a smooth tween:
  full, portrait, face, "the stare" (eyes), hair, and smirk close-ups.
- Scroll to zoom; a subtle idle bob keeps the portrait alive.

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
js/main.js                 # renderer, orthographic camera, shot framings, loop
js/reigen-2d.js            # the flat 2D Reigen (THREE.Shape fills + outlines)
js/camera-shots.js         # 2D framing presets (zoom + pan)
.github/workflows/         # GitHub Pages deployment
```

Three.js is loaded from a CDN via the import map in `index.html`.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow
(`.github/workflows/deploy-pages.yml`), which publishes the repo root to GitHub
Pages. Enable Pages once under **Settings → Pages → Source: GitHub Actions**.
