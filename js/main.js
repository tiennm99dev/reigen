// Scene bootstrap on PixiJS v8 (2D-native). The active image is sampled into a
// ParticleContainer point cloud; framing is done by transforming a parent
// "world" container (zoom/pan), and a tiled render exports a ~100 MP PNG.
import { Application, Container, RenderTexture } from "pixi.js";
import { sampleImage } from "./sample-image.js";
import { buildParticleCloud } from "./pixi-points.js";
import { loadImageFromFile, loadImageFromURL } from "./image-loaders.js";
import { SHOTS, getShot } from "./camera-shots.js";

const BG_HEX = 0xe9e3d6;
const BG_CSS = "#e9e3d6";
const canvas = document.getElementById("scene");

const app = new Application();
try {
  await app.init({
    canvas,
    background: BG_HEX,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 3),
    autoDensity: true,
    resizeTo: window,
    preference: "webgl",
  });
} catch (err) {
  document.body.innerHTML =
    `<p style="color:#fff;font-family:sans-serif;padding:2rem">` +
    `Could not start WebGL renderer: ${err}</p>`;
  throw err;
}

const world = new Container();
app.stage.addChild(world);

let cloud = null;
let currentShotId = SHOTS[0].id;
let userZoom = 1; // wheel multiplier on top of the shot zoom
let tween = null;

const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function contentSize() {
  return cloud ? { w: cloud.sw * cloud.cell, h: cloud.sh * cloud.cell } : { w: 1, h: 1 };
}
function fitScale() {
  const { w, h } = contentSize();
  return Math.min(app.screen.width / w, app.screen.height / h) * 0.92;
}
function targetTransform(shot) {
  const { w, h } = contentSize();
  const scale = fitScale() * shot.zoom * userZoom;
  return {
    scale,
    x: app.screen.width / 2 - shot.cx * w * scale,
    y: app.screen.height / 2 - shot.cy * h * scale,
  };
}
function applyTransform(t) {
  world.scale.set(t.scale);
  world.position.set(t.x, t.y);
}

function goToShot(id, instant = false) {
  currentShotId = id;
  userZoom = 1;
  const t = targetTransform(getShot(id));
  if (instant) { applyTransform(t); tween = null; }
  else tween = { from: { scale: world.scale.x, x: world.x, y: world.y }, to: t, t: 0 };
  document.querySelectorAll(".shot-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.shot === id));
}

function setImage(img) {
  const sample = sampleImage(img, { maxSample: 900 });
  const pc = buildParticleCloud(app.renderer, sample, { cell: 1, coverage: 1.45 });
  if (cloud) {
    world.removeChild(cloud);
    const oldTex = cloud._dotTex;
    cloud.destroy();
    oldTex?.destroy(true);
  }
  cloud = pc;
  world.addChild(cloud);
  goToShot(currentShotId, true);
  return pc.count;
}

// --- Shot buttons -----------------------------------------------------------
const shotBar = document.getElementById("shot-bar");
SHOTS.forEach((shot, i) => {
  const btn = document.createElement("button");
  btn.className = "shot-btn" + (i === 0 ? " active" : "");
  btn.textContent = shot.label;
  btn.dataset.shot = shot.id;
  btn.addEventListener("click", () => goToShot(shot.id));
  shotBar.appendChild(btn);
});

// --- Wheel zoom -------------------------------------------------------------
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  if (tween) return;
  userZoom = clamp(userZoom * (e.deltaY < 0 ? 1.1 : 0.9), 0.4, 12);
  applyTransform(targetTransform(getShot(currentShotId)));
}, { passive: false });

window.addEventListener("resize", () => applyTransform(targetTransform(getShot(currentShotId))));

// --- Image loading (file / drag-drop / URL / bundled default) ---------------
const loadStatus = document.getElementById("load-status");
function useImage(img) {
  const n = setImage(img);
  if (loadStatus) loadStatus.textContent = `Loaded (${n.toLocaleString()} pts)`;
}
async function useImageFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  if (loadStatus) loadStatus.textContent = "Loading image…";
  try { useImage(await loadImageFromFile(file)); }
  catch { if (loadStatus) loadStatus.textContent = "Could not read that image."; }
}

const fileInput = document.getElementById("image-input");
document.getElementById("load-btn").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => useImageFile(fileInput.files[0]));

const urlInput = document.getElementById("url-input");
async function useImageURL() {
  const url = urlInput.value.trim();
  if (!url) return;
  if (loadStatus) loadStatus.textContent = "Loading URL…";
  try { useImage(await loadImageFromURL(url)); }
  catch { if (loadStatus) loadStatus.textContent = "Could not load that URL (CORS blocked, or not an image)."; }
}
document.getElementById("url-btn").addEventListener("click", useImageURL);
urlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") useImageURL(); });

canvas.addEventListener("dragover", (e) => e.preventDefault());
canvas.addEventListener("drop", (e) => { e.preventDefault(); useImageFile(e.dataTransfer.files[0]); });

// --- Tiled ~100 MP PNG export ----------------------------------------------
let exporting = false;
const SS = 2; // supersample per tile then downscale for anti-aliasing
async function exportHighRes(targetMP = 100) {
  if (exporting || !cloud) return;
  exporting = true;
  const statusEl = document.getElementById("export-status");

  // Content rect currently visible (in content units).
  const s = world.scale.x;
  const cl = (0 - world.x) / s, ct = (0 - world.y) / s;
  const rectW = app.screen.width / s, rectH = app.screen.height / s;
  const aspect = rectW / rectH;

  let bigW = Math.min(16000, Math.round(Math.sqrt(targetMP * 1e6 * aspect)));
  let bigH = Math.min(16000, Math.round(bigW / aspect));
  const TILE = 2000;
  const tilesX = Math.ceil(bigW / TILE), tilesY = Math.ceil(bigH / TILE);
  const tileW = Math.ceil(bigW / tilesX), tileH = Math.ceil(bigH / tilesY);

  const big = document.createElement("canvas");
  big.width = tileW * tilesX;
  big.height = tileH * tilesY;
  const ctx = big.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = BG_CSS;
  ctx.fillRect(0, 0, big.width, big.height);

  const saved = { scale: world.scale.x, x: world.x, y: world.y };
  const subW = rectW / tilesX, subH = rectH / tilesY;

  for (let iy = 0; iy < tilesY; iy++) {
    for (let ix = 0; ix < tilesX; ix++) {
      const subL = cl + subW * ix;
      const subT = ct + subH * iy;
      const tileScale = (tileW * SS) / subW;
      world.scale.set(tileScale);
      world.position.set(-subL * tileScale, -subT * tileScale);
      const rt = RenderTexture.create({ width: tileW * SS, height: tileH * SS });
      app.renderer.render({ container: world, target: rt });
      const tileCanvas = app.renderer.extract.canvas(rt);
      ctx.drawImage(tileCanvas, ix * tileW, iy * tileH, tileW, tileH);
      rt.destroy(true);
    }
    if (statusEl) {
      statusEl.textContent = `Rendering ${Math.round(((iy + 1) / tilesY) * 100)}%…`;
      await new Promise((r) => setTimeout(r));
    }
  }

  world.scale.set(saved.scale);
  world.position.set(saved.x, saved.y);

  big.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `points-${big.width}x${big.height}.png`;
    a.click();
    URL.revokeObjectURL(url);
    if (statusEl) statusEl.textContent = `Saved ${big.width}×${big.height}px`;
    exporting = false;
  }, "image/png");
}
document.getElementById("export-btn").addEventListener("click", () => {
  const el = document.getElementById("export-status");
  if (el) el.textContent = "Preparing…";
  setTimeout(() => exportHighRes(100), 30);
});

// --- Tween loop -------------------------------------------------------------
app.ticker.add((ticker) => {
  if (!tween) return;
  tween.t = Math.min(1, tween.t + ticker.deltaMS / 900);
  const e = easeInOut(tween.t);
  world.scale.set(lerp(tween.from.scale, tween.to.scale, e));
  world.position.set(lerp(tween.from.x, tween.to.x, e), lerp(tween.from.y, tween.to.y, e));
  if (tween.t >= 1) tween = null;
});

// --- Load the bundled CC0 default (falls back to ./reference.png) -----------
(async () => {
  for (const src of ["./assets/anime-portrait-cc0.png", "./reference.png"]) {
    try { useImage(await loadImageFromURL(src)); return; }
    catch { /* try next */ }
  }
  if (loadStatus) loadStatus.textContent = "Load an image to begin.";
})();
