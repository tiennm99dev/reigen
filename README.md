# Anime portrait in points — PixiJS

A tiny web app that **reproduces an image with points**: it samples an image's
pixels into a coloured point cloud rendered with **PixiJS v8** (2D-native WebGL)
through a pan/zoom "world" container. Plain JavaScript, no build step.

Ships with a **CC0 / public-domain** anime portrait as the default. Load any
image of your own to reproduce that instead — the sampling is image-agnostic.

**Live demo:** https://tiennm99.github.io/reigen/

## Features

- **Reproduce any image with points** — each opaque pixel of the sampled image
  becomes one round, per-point-tinted particle in a PixiJS `ParticleContainer`
  (hundreds of thousands of points; framing via a parent container transform).
- **Load your own image** — click *Load image*, drag an image onto the canvas,
  or paste an image URL. Images you load are processed **locally in your
  browser** and never uploaded; remote URLs are fetched client-side only.
- **6 shot framings** (full, portrait, face, eyes, top, detail) with a smooth
  tween; scroll to zoom.
- **Download ~100 MP PNG** — a single 100-megapixel framebuffer isn't feasible
  in WebGL, so the current framing is rendered in **supersampled tiles** into a
  ~10000×10000 image and saved.

## Run locally

Because it uses ES modules and an import map, open it through a local server
(not `file://`):

```bash
python3 -m http.server 8099
# then visit http://localhost:8099
```

## Project structure

```
index.html                     # markup, import map, UI chrome
css/style.css                  # layout and controls styling
js/main.js                     # PixiJS app: world transform, shots, 100MP export
js/sample-image.js             # image -> point positions + colours (framework-agnostic)
js/pixi-points.js              # builds the PixiJS ParticleContainer point cloud
js/image-loaders.js            # load an <img> from a File or URL
js/camera-shots.js             # 2D framing presets (zoom + focus)
assets/anime-portrait-cc0.png  # default CC0 image (public domain)
.github/workflows/             # GitHub Pages deployment
```

PixiJS v8 is loaded from a CDN via the import map in `index.html`.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow
(`.github/workflows/deploy-pages.yml`), which publishes the repo root to GitHub
Pages. Enable Pages once under **Settings → Pages → Source: GitHub Actions**.

## Credits & licensing

The bundled default image is **“Anime girl” by oksmith** (Open Clipart),
released under the [CC0 1.0 Public Domain Dedication](https://commons.wikimedia.org/wiki/File:Anime_girl_publicdomainq.png)
— free to use, including commercially.

Images you load yourself are processed **locally in your browser** and are never
uploaded or published by this project. Do not load images you don't have the
right to use. Questions: [github.com/tiennm99](https://github.com/tiennm99).
