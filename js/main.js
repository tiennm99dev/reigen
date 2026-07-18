// Scene bootstrap: renders Reigen as a point cloud through an orthographic
// camera (true 2D). Shot framings tween on button press, wheel zooms, and a
// "Download ~100 MP" button renders the cloud in tiles into a huge PNG.
import * as THREE from "three";
import { buildReigenPoints, updatePointSize } from "./reigen-points.js";
import { SHOTS, getShot } from "./camera-shots.js";

const canvas = document.getElementById("scene");

// preserveDrawingBuffer lets the export copy each rendered tile off the canvas.
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe9e3d6);

const reigen = buildReigenPoints({ fillDensity: 60000, edgeDensity: 2600, size: 0.011 });
scene.add(reigen);

// --- Orthographic camera (true 2D) ------------------------------------------
const FRUSTUM_H = 4;
let camera;
function makeCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(
    (-FRUSTUM_H * aspect) / 2, (FRUSTUM_H * aspect) / 2,
    FRUSTUM_H / 2, -FRUSTUM_H / 2, 0.1, 100
  );
  camera.position.set(SHOTS[0].cx, SHOTS[0].cy, 10);
  camera.zoom = SHOTS[0].zoom;
  camera.updateProjectionMatrix();
}
makeCamera();

// --- Shot tween -------------------------------------------------------------
let tween = null;
let userZoom = SHOTS[0].zoom;

function goToShot(id) {
  const s = getShot(id);
  tween = {
    from: { x: camera.position.x, y: camera.position.y, zoom: camera.zoom },
    to: { x: s.cx, y: s.cy, zoom: s.zoom },
    t: 0,
  };
  userZoom = s.zoom;
  document.querySelectorAll(".shot-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.shot === id));
}
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

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
  userZoom = THREE.MathUtils.clamp(userZoom * (e.deltaY < 0 ? 1.1 : 0.9), 0.5, 8);
  camera.zoom = userZoom;
  camera.updateProjectionMatrix();
}, { passive: false });

// --- Resize -----------------------------------------------------------------
window.addEventListener("resize", () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = (-FRUSTUM_H * aspect) / 2;
  camera.right = (FRUSTUM_H * aspect) / 2;
  camera.top = FRUSTUM_H / 2;
  camera.bottom = -FRUSTUM_H / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Tiled ~100 MP PNG export ----------------------------------------------
// A single 100 MP framebuffer is not feasible in WebGL, so the current framing
// is rendered as a grid of tiles into one big 2D canvas, then downloaded.
let exporting = false;
async function exportHighRes(targetMP = 100) {
  if (exporting) return;
  exporting = true;
  const statusEl = document.getElementById("export-status");
  const aspect = window.innerWidth / window.innerHeight;
  let bigW = Math.round(Math.sqrt(targetMP * 1e6 * aspect));
  let bigH = Math.round(bigW / aspect);
  bigW = Math.min(bigW, 16000);
  bigH = Math.min(bigH, 16000);

  // Full world rect visible in the current framing.
  const halfW = (camera.right - camera.left) / 2 / camera.zoom;
  const halfH = (camera.top - camera.bottom) / 2 / camera.zoom;
  const wl = camera.position.x - halfW, wr = camera.position.x + halfW;
  const wb = camera.position.y - halfH, wt = camera.position.y + halfH;

  const TILE = 2048;
  const tilesX = Math.ceil(bigW / TILE);
  const tilesY = Math.ceil(bigH / TILE);
  const tileW = Math.ceil(bigW / tilesX);
  const tileH = Math.ceil(bigH / tilesY);

  const big = document.createElement("canvas");
  big.width = tileW * tilesX;
  big.height = tileH * tilesY;
  const ctx = big.getContext("2d");

  const savedRatio = renderer.getPixelRatio();
  renderer.setPixelRatio(1);
  renderer.setSize(tileW, tileH, false);

  const expCam = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 100);
  expCam.position.set(0, 0, 10);

  for (let iy = 0; iy < tilesY; iy++) {
    for (let ix = 0; ix < tilesX; ix++) {
      expCam.left = wl + ((wr - wl) * ix) / tilesX;
      expCam.right = wl + ((wr - wl) * (ix + 1)) / tilesX;
      expCam.top = wt - ((wt - wb) * iy) / tilesY;
      expCam.bottom = wt - ((wt - wb) * (iy + 1)) / tilesY;
      expCam.zoom = 1;
      expCam.updateProjectionMatrix();
      updatePointSize(reigen, expCam, tileH);
      renderer.render(scene, expCam);
      ctx.drawImage(renderer.domElement, ix * tileW, iy * tileH, tileW, tileH);
    }
    if (statusEl) {
      statusEl.textContent = `Rendering ${Math.round(((iy + 1) / tilesY) * 100)}%…`;
      await new Promise((r) => setTimeout(r)); // let the UI paint
    }
  }

  // Restore live rendering.
  renderer.setPixelRatio(savedRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  big.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reigen-${big.width}x${big.height}.png`;
    a.click();
    URL.revokeObjectURL(url);
    if (statusEl) statusEl.textContent = `Saved ${big.width}×${big.height}px`;
    exporting = false;
  }, "image/png");
}

document.getElementById("export-btn").addEventListener("click", () => {
  const el = document.getElementById("export-status");
  if (el) el.textContent = "Preparing…";
  // Defer so the label shows before the heavy work starts.
  setTimeout(() => exportHighRes(100), 30);
});

// --- Render loop ------------------------------------------------------------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  if (exporting) return; // export drives its own tiled renders

  if (tween) {
    tween.t = Math.min(1, tween.t + dt / 0.9);
    const e = easeInOut(tween.t);
    camera.position.x = THREE.MathUtils.lerp(tween.from.x, tween.to.x, e);
    camera.position.y = THREE.MathUtils.lerp(tween.from.y, tween.to.y, e);
    camera.zoom = THREE.MathUtils.lerp(tween.from.zoom, tween.to.zoom, e);
    camera.updateProjectionMatrix();
    if (tween.t >= 1) tween = null;
  }

  reigen.position.y = Math.sin(clock.elapsedTime * 1.1) * 0.012;

  updatePointSize(reigen, camera, renderer.domElement.height);
  renderer.render(scene, camera);
}
animate();
