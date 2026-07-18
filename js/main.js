// Scene bootstrap: renderer, lights, Reigen, OrbitControls and shot switching.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createReigen } from "./reigen-character.js";
import { SHOTS, getShot } from "./camera-shots.js";

const canvas = document.getElementById("scene");

// --- Renderer ---------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// --- Scene ------------------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1d26);
scene.fog = new THREE.Fog(0x1b1d26, 12, 26);

// Soft radial studio backdrop so the cel-shaded figure pops.
const backdrop = new THREE.Mesh(
  new THREE.SphereGeometry(40, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x262a38, side: THREE.BackSide })
);
scene.add(backdrop);

// --- Camera -----------------------------------------------------------------
const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.copy(SHOTS[0].position);

// --- Lighting: flat-ish ambient so toon bands read + warm key + cool rim ----
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xfff2d6, 2.1);
key.position.set(4, 6, 6);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0005;
scene.add(key);

const rim = new THREE.DirectionalLight(0x7fb0ff, 1.1);
rim.position.set(-5, 2, -4);
scene.add(rim);

const fill = new THREE.PointLight(0xffd9a0, 0.5, 30);
fill.position.set(-3, -2, 4);
scene.add(fill);

// --- Floor: subtle disc so shadows have somewhere to land -------------------
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(9, 64),
  new THREE.MeshStandardMaterial({ color: 0x1d1d26, roughness: 1 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -3.4;
floor.receiveShadow = true;
scene.add(floor);

// --- Reigen -----------------------------------------------------------------
const reigen = createReigen();
scene.add(reigen);

// --- Controls ---------------------------------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2;
controls.maxDistance = 14;
controls.target.copy(SHOTS[0].target);

// --- Shot switching with a smooth tween -------------------------------------
let tween = null; // { fromPos, toPos, fromTarget, toTarget, t }

function goToShot(id) {
  const shot = getShot(id);
  tween = {
    fromPos: camera.position.clone(),
    toPos: shot.position.clone(),
    fromTarget: controls.target.clone(),
    toTarget: shot.target.clone(),
    t: 0,
  };
  document.querySelectorAll(".shot-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.shot === id)
  );
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// --- Build shot buttons -----------------------------------------------------
const shotBar = document.getElementById("shot-bar");
SHOTS.forEach((shot, i) => {
  const btn = document.createElement("button");
  btn.className = "shot-btn" + (i === 0 ? " active" : "");
  btn.textContent = shot.label;
  btn.dataset.shot = shot.id;
  btn.addEventListener("click", () => goToShot(shot.id));
  shotBar.appendChild(btn);
});

// --- Auto-rotate toggle -----------------------------------------------------
const autoRotateEl = document.getElementById("auto-rotate");
autoRotateEl.addEventListener("change", () => {
  controls.autoRotate = autoRotateEl.checked;
  controls.autoRotateSpeed = 1.4;
});

// --- Resize -----------------------------------------------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Render loop ------------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  if (tween) {
    tween.t = Math.min(1, tween.t + dt / 1.1); // ~1.1s transition
    const e = easeInOut(tween.t);
    camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
    if (tween.t >= 1) tween = null;
  }

  // Gentle idle breathing so the portrait feels alive when still.
  const idle = Math.sin(clock.elapsedTime * 1.1) * 0.015;
  reigen.position.y = idle;
  reigen.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.04;

  controls.update();
  renderer.render(scene, camera);
}

animate();
