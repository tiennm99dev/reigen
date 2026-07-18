// Scene bootstrap for the flat 2D Reigen: orthographic camera, no lights
// (unlit flat shapes), shot framings tweened on button press, wheel zoom.
import * as THREE from "three";
import { createReigen2D } from "./reigen-2d.js";
import { SHOTS, getShot } from "./camera-shots.js";

const canvas = document.getElementById("scene");

// --- Renderer ---------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// --- Scene ------------------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe9e3d6);

const reigen = createReigen2D();
scene.add(reigen);

// --- Orthographic camera (true 2D) ------------------------------------------
const FRUSTUM_H = 4; // world units visible vertically at zoom 1
let camera;
function makeCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(
    (-FRUSTUM_H * aspect) / 2,
    (FRUSTUM_H * aspect) / 2,
    FRUSTUM_H / 2,
    -FRUSTUM_H / 2,
    0.1,
    100
  );
  camera.position.set(SHOTS[0].cx, SHOTS[0].cy, 10);
  camera.zoom = SHOTS[0].zoom;
  camera.updateProjectionMatrix();
}
makeCamera();

// --- Shot tween -------------------------------------------------------------
let tween = null; // { from:{x,y,zoom}, to:{x,y,zoom}, t }
let userZoom = SHOTS[0].zoom; // wheel-adjusted zoom multiplier baseline

function goToShot(id) {
  const s = getShot(id);
  tween = {
    from: { x: camera.position.x, y: camera.position.y, zoom: camera.zoom },
    to: { x: s.cx, y: s.cy, zoom: s.zoom },
    t: 0,
  };
  userZoom = s.zoom;
  document
    .querySelectorAll(".shot-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.shot === id));
}

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

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
canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    if (tween) return;
    userZoom = THREE.MathUtils.clamp(userZoom * (e.deltaY < 0 ? 1.1 : 0.9), 0.6, 6);
    camera.zoom = userZoom;
    camera.updateProjectionMatrix();
  },
  { passive: false }
);

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

// --- Render loop ------------------------------------------------------------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  if (tween) {
    tween.t = Math.min(1, tween.t + dt / 0.9);
    const e = easeInOut(tween.t);
    camera.position.x = THREE.MathUtils.lerp(tween.from.x, tween.to.x, e);
    camera.position.y = THREE.MathUtils.lerp(tween.from.y, tween.to.y, e);
    camera.zoom = THREE.MathUtils.lerp(tween.from.zoom, tween.to.zoom, e);
    camera.updateProjectionMatrix();
    if (tween.t >= 1) tween = null;
  }

  // Subtle idle bob so it feels alive.
  reigen.position.y = Math.sin(clock.elapsedTime * 1.1) * 0.012;

  renderer.render(scene, camera);
}
animate();
