# Reigen Arataka — Three.js

A tiny web app that draws **Reigen Arataka** from *Mob Psycho 100* — his face
and slicked-back hair — as a procedural 3D model built with **plain JavaScript
and Three.js only**. No build step, no framework.

**Live demo:** https://tiennm99.github.io/reigen/

## Features

- **Cel-shaded (toon) look** with inked outlines for a Mob Psycho 100 feel.
- A **sculpted head** (brow ridge, cheekbones, eye sockets, defined jaw/chin)
  rather than a plain ball — plus detailed eyes (iris, pupil, catchlight, the
  signature sharp eye-line and heavy lids), a structured nose, lips, brows and
  ears, slicked-back strand-by-strand hair, and a suit with lapels + red tie.
- **7 camera shots** you can switch between with a smooth tween:
  front, 3/4 view, side profile, face close-up, "the stare", hair/top, low hero.
- Orbit with the mouse (drag to rotate, scroll to zoom) and an auto-rotate toggle.
- Warm key + cool rim lighting for an anime-portrait feel.

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
js/main.js                 # renderer, lights, controls, shot switching, loop
js/reigen-character.js     # procedural Reigen model (head, face, hair, bust)
js/camera-shots.js         # named camera positions/targets
.github/workflows/         # GitHub Pages deployment
```

Three.js is loaded from a CDN via the import map in `index.html`.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow
(`.github/workflows/deploy-pages.yml`), which publishes the repo root to GitHub
Pages. Enable Pages once under **Settings → Pages → Source: GitHub Actions**.
