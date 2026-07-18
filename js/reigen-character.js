// Procedural Reigen Arataka (Mob Psycho 100) — detailed, cel-shaded build.
//
// Instead of stacking plain primitives, the head is a high-res sphere sculpted
// with anatomical bumps (brow ridge, cheekbones, eye sockets, jaw, chin), then
// dressed with layered anime features and inked outlines. Everything returns
// inside one THREE.Group so the camera shots can frame it.

import * as THREE from "three";
import { makeToon, addOutline, sculptBumps } from "./toon-materials.js";

// --- Palette matching Reigen's anime look -----------------------------------
const COLORS = {
  skin: 0xf3cba6,
  skinShadow: 0xd6a074,
  hair: 0xc79350, // light gingery brown, slicked back
  hairMid: 0xa9772f,
  hairDark: 0x7d551f,
  eyeWhite: 0xf9f6ef,
  iris: 0x5f4a30,
  irisLight: 0x8a6a41,
  eyeLine: 0x241a12, // the thick anime upper-lash line
  brow: 0x7d551f,
  lipUpper: 0xc98d76,
  lipLower: 0xd89a83,
  mouthLine: 0x6e3f38,
  suit: 0x30303a,
  suitDark: 0x24242c,
  lapel: 0x393943,
  shirt: 0xf5f2eb,
  tie: 0x9c2b2b,
  tieDark: 0x7a1f1f,
  button: 0x1a1a20,
};

// ============================================================================
// HEAD — a sculpted sphere, not a plain ball.
// ============================================================================
function buildHead() {
  const geo = new THREE.SphereGeometry(1.0, 96, 96);

  // Basic face proportions: slightly narrow, a touch longer than wide, with a
  // flatter back. Applied as a non-uniform pre-scale on the raw vertices so the
  // sculpt bumps act on the real head shape.
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    x *= 0.9; // narrower
    y *= 1.12; // taller
    z *= 0.95;
    if (z < 0) z *= 0.9; // flatten the back of the skull a little
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();

  // Anatomical sculpt. Directions point roughly where the feature sits on the
  // unit sphere (face looks toward +Z). Negative amp = carved indentation.
  sculptBumps(geo, [
    { dir: [0, -0.85, 0.55], amp: 0.14, spread: 0.35 }, // chin point
    { dir: [0.5, -0.55, 0.55], amp: 0.06, spread: 0.4 }, // jaw L
    { dir: [-0.5, -0.55, 0.55], amp: 0.06, spread: 0.4 }, // jaw R
    { dir: [0.46, -0.05, 0.72], amp: 0.07, spread: 0.4 }, // cheekbone L
    { dir: [-0.46, -0.05, 0.72], amp: 0.07, spread: 0.4 }, // cheekbone R
    { dir: [0, 0.24, 0.92], amp: 0.05, spread: 0.45 }, // brow ridge
    { dir: [0.34, 0.1, 0.86], amp: -0.07, spread: 0.22 }, // eye socket L
    { dir: [-0.34, 0.1, 0.86], amp: -0.07, spread: 0.22 }, // eye socket R
    { dir: [0.72, 0.32, 0.42], amp: -0.05, spread: 0.3 }, // temple L
    { dir: [-0.72, 0.32, 0.42], amp: -0.05, spread: 0.3 }, // temple R
    { dir: [0, 0.55, 0.7], amp: 0.03, spread: 0.5 }, // forehead
    { dir: [0, 0.15, -0.95], amp: 0.06, spread: 0.5 }, // back skull
    { dir: [0, -0.2, 0.98], amp: -0.02, spread: 0.3 }, // philtrum dip
  ]);

  const head = new THREE.Mesh(geo, makeToon(COLORS.skin));
  head.name = "head";
  head.castShadow = true;
  addOutline(head, 0.022);
  return head;
}

// ============================================================================
// NOSE — bridge + tip + wings, angled off the brow.
// ============================================================================
function buildNose() {
  const nose = new THREE.Group();
  const skin = makeToon(COLORS.skin);

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.18), skin);
  bridge.position.set(0, 0.02, 0.92);
  bridge.rotation.x = 0.18;
  nose.add(bridge);

  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), skin);
  tip.position.set(0, -0.2, 1.02);
  tip.scale.set(1, 0.85, 1);
  nose.add(tip);

  [-1, 1].forEach((s) => {
    const wing = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), skin);
    wing.position.set(0.09 * s, -0.22, 0.97);
    wing.scale.set(0.9, 0.8, 0.9);
    nose.add(wing);

    const nostril = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 10, 10),
      makeToon(COLORS.skinShadow)
    );
    nostril.position.set(0.07 * s, -0.27, 1.02);
    nose.add(nostril);
  });

  return nose;
}

// ============================================================================
// EYE — almond eyeball + iris + catchlight, heavy anime eye-line and lids.
// side: "left" is Reigen's left (screen right when facing us).
// ============================================================================
function buildEye(side) {
  const eye = new THREE.Group();
  const dir = side === "left" ? 1 : -1;

  // Eyeball, sunk into the socket.
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 28, 28),
    makeToon(COLORS.eyeWhite, { emissive: 0x201c16, emissiveIntensity: 0.15 })
  );
  ball.scale.set(1.5, 0.82, 0.7);
  eye.add(ball);

  const iris = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 24, 24),
    makeToon(COLORS.iris)
  );
  iris.position.set(0.02 * dir, -0.01, 0.1);
  iris.scale.set(0.9, 1.3, 0.5);
  eye.add(iris);

  const irisRing = new THREE.Mesh(
    new THREE.SphereGeometry(0.052, 20, 20),
    makeToon(COLORS.irisLight)
  );
  irisRing.position.set(0.02 * dir, 0.0, 0.12);
  irisRing.scale.set(0.9, 1.25, 0.4);
  eye.add(irisRing);

  const pupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x100c0a })
  );
  pupil.position.set(0.02 * dir, -0.01, 0.14);
  pupil.scale.set(1, 1.3, 0.4);
  eye.add(pupil);

  // Catchlight — the tiny glint that makes eyes feel alive.
  const glint = new THREE.Mesh(
    new THREE.SphereGeometry(0.022, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  glint.position.set(0.06 * dir, 0.05, 0.16);
  eye.add(glint);

  // The signature Reigen upper eye-line: a flat, sharp dark bar. He's got
  // narrow, unimpressed eyes, so it sits low and angles down toward the nose.
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.06, 0.05),
    new THREE.MeshBasicMaterial({ color: COLORS.eyeLine })
  );
  line.position.set(0, 0.11, 0.13);
  line.rotation.z = 0.14 * dir; // outer corner slightly up
  eye.add(line);

  // Outer-corner tick (lash) for that sharp anime eye.
  const lash = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.05, 0.04),
    new THREE.MeshBasicMaterial({ color: COLORS.eyeLine })
  );
  lash.position.set(0.24 * dir, 0.14, 0.12);
  lash.rotation.z = 0.5 * dir;
  eye.add(lash);

  // Heavy upper lid skin fold over the top of the eye.
  const lid = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
    makeToon(COLORS.skin)
  );
  lid.scale.set(1.6, 1.0, 0.72);
  lid.position.set(0, 0.13, -0.02);
  lid.rotation.z = -0.1 * dir;
  eye.add(lid);

  // Lower lid line, subtle and short.
  const lower = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.025, 0.03),
    new THREE.MeshBasicMaterial({ color: COLORS.skinShadow })
  );
  lower.position.set(0, -0.09, 0.12);
  eye.add(lower);

  return eye;
}

// ============================================================================
// EYEBROW — tapered, slightly arched bar with a bit of thickness.
// ============================================================================
function buildBrow(side) {
  const dir = side === "left" ? 1 : -1;
  const brow = new THREE.Group();
  const mat = makeToon(COLORS.brow);
  // Two segments so it can taper toward the outer end.
  const inner = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.07), mat);
  inner.position.x = -0.08 * dir;
  brow.add(inner);
  const outer = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.045, 0.06), mat);
  outer.position.set(0.12 * dir, 0.02, 0);
  outer.rotation.z = 0.18 * dir;
  brow.add(outer);
  return brow;
}

// ============================================================================
// MOUTH — upper + lower lip and a confident flat line.
// ============================================================================
function buildMouth() {
  const mouth = new THREE.Group();

  const line = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.055, 0.07),
    new THREE.MeshBasicMaterial({ color: COLORS.mouthLine })
  );
  line.rotation.z = -0.04; // faint smirk
  line.position.z = 0.04;
  mouth.add(line);

  const upper = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    makeToon(COLORS.lipUpper)
  );
  upper.scale.set(1.0, 0.3, 0.4);
  upper.position.y = 0.06;
  upper.rotation.x = Math.PI;
  mouth.add(upper);

  const lower = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    makeToon(COLORS.lipLower)
  );
  lower.scale.set(1.0, 0.36, 0.45);
  lower.position.y = -0.08;
  mouth.add(lower);

  return mouth;
}

// ============================================================================
// EAR — simple helix + lobe.
// ============================================================================
function buildEar(side) {
  const dir = side === "left" ? 1 : -1;
  const ear = new THREE.Group();
  const skin = makeToon(COLORS.skin);

  const outer = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 18), skin);
  outer.scale.set(0.42, 0.95, 0.62);
  ear.add(outer);

  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    makeToon(COLORS.skinShadow)
  );
  bowl.scale.set(0.4, 0.85, 0.5);
  bowl.position.set(0.04 * dir, 0, 0.06);
  ear.add(bowl);

  return ear;
}

// ============================================================================
// HAIR — slicked straight back. A dark scalp shell hugs the skull; on top of it
// lie long curved strand-tubes running from the forehead hairline up over the
// crown and down the nape, so it reads as combed-back hair, not a hat.
// ============================================================================
function buildHair() {
  const hair = new THREE.Group();
  const light = makeToon(COLORS.hair);
  const mid = makeToon(COLORS.hairMid);
  const dark = makeToon(COLORS.hairDark);

  // Dark scalp: a full head-hugging sphere with the FACE carved out. The
  // hairline threshold varies by direction — high at the forehead, just above
  // the ears at the sides, low at the nape — so the whole scalp/back/nape is
  // covered while the face stays open. This beats a tilted cap (no bald back).
  const scalpGeo = new THREE.SphereGeometry(1.05, 72, 56);
  scalpGeo.scale(0.99, 1.15, 1.03);
  {
    const p = scalpGeo.attributes.position;
    const idx = scalpGeo.index;
    const n = new THREE.Vector3();
    const hairline = (fz) => (fz >= 0 ? 0.16 + fz * 0.36 : 0.16 + fz * 0.72);
    const keep = new Array(p.count);
    for (let i = 0; i < p.count; i++) {
      n.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
      keep[i] = n.y > hairline(n.z); // above the direction-dependent hairline
    }
    const src = idx.array;
    const out = [];
    for (let t = 0; t < src.length; t += 3) {
      const a = src[t], b = src[t + 1], c = src[t + 2];
      if (keep[a] && keep[b] && keep[c]) out.push(a, b, c);
    }
    scalpGeo.setIndex(out);
    scalpGeo.computeVertexNormals();
  }
  const shell = new THREE.Mesh(scalpGeo, dark);
  shell.position.set(0, 0.02, -0.01);
  addOutline(shell, 0.02);
  hair.add(shell);

  // One slicked strand: a tube following a hairline->crown->nape arc in a
  // vertical plane at lateral offset `xoff`. Side strands are shorter/lower (sf)
  // so the set hugs the ellipsoidal head and lies flat instead of standing up.
  function addStrand(xoff, radius, material, lift = 0) {
    const sf = Math.max(0.25, Math.sqrt(Math.max(0, 1 - (xoff / 1.02) ** 2)));
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xoff, 0.62, 0.84 * sf + 0.04), // hairline (forehead)
      new THREE.Vector3(xoff * 1.02, 1.06 + lift, 0.68 * sf),
      new THREE.Vector3(xoff * 1.02, 1.24 * (0.82 + 0.18 * sf) + lift, 0.06 * sf), // crown
      new THREE.Vector3(xoff * 1.02, 1.02, -0.7 * sf),
      new THREE.Vector3(xoff, 0.5, -1.02 * sf),
      new THREE.Vector3(xoff, 0.1, -0.94 * sf), // sweep down the back of the head
    ]);
    const geo = new THREE.TubeGeometry(curve, 40, radius, 8, false);
    const s = new THREE.Mesh(geo, material);
    addOutline(s, 0.012);
    hair.add(s);
    return s;
  }

  // The part sits slightly to his left; strands fan across the head from it.
  const partX = 0.16;
  const N = 15;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1); // 0..1
    const xoff = partX + (t - 0.5) * 1.7;
    // Alternate tones for visible strand grooves; darker right next to the part.
    const nearPart = Math.abs(xoff - partX) < 0.14;
    const m = nearPart ? dark : i % 3 === 0 ? light : i % 3 === 1 ? mid : light;
    // Slight extra height on the front strands closest to the part (his little
    // front lift before it slicks back).
    const lift = nearPart ? 0.06 : 0.0;
    addStrand(xoff, 0.072, m, lift);
  }

  // A couple of finer highlight strands on top for definition.
  addStrand(partX - 0.45, 0.03, light, 0.02);
  addStrand(partX + 0.45, 0.03, light, 0.02);

  // Short sideburns just in front of the ears (kept clear of the eyes).
  [-1, 1].forEach((sd) => {
    const sb = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.34), mid);
    sb.position.set(0.86 * sd, 0.2, -0.08);
    sb.rotation.z = 0.08 * sd;
    addOutline(sb, 0.012);
    hair.add(sb);
  });

  return hair;
}

// ============================================================================
// BUST — suit jacket with lapels, dress shirt, knotted red tie.
// ============================================================================
function buildBust() {
  const bust = new THREE.Group();
  bust.position.y = -1.7;

  // Neck.
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 0.6, 24),
    makeToon(COLORS.skin)
  );
  neck.position.y = 0.25;
  bust.add(neck);

  // Shoulders / torso block of the jacket.
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.7, 1.3, 40, 1),
    makeToon(COLORS.suit)
  );
  torso.position.y = -0.7;
  torso.scale.set(1, 1, 0.75);
  addOutline(torso, 0.02);
  bust.add(torso);

  const shoulderCap = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5),
    makeToon(COLORS.suit)
  );
  shoulderCap.position.y = -0.4;
  shoulderCap.scale.set(1.05, 0.5, 0.78);
  bust.add(shoulderCap);

  // Dress shirt V.
  const shirt = new THREE.Mesh(
    new THREE.ConeGeometry(0.55, 1.1, 3),
    makeToon(COLORS.shirt)
  );
  shirt.rotation.y = Math.PI / 4;
  shirt.position.set(0, -0.35, 0.5);
  shirt.scale.set(1, 1, 0.5);
  bust.add(shirt);

  // Shirt collar (two folded flaps).
  [-1, 1].forEach((s) => {
    const flap = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.32, 0.06),
      makeToon(COLORS.shirt)
    );
    flap.position.set(0.16 * s, 0.05, 0.55);
    flap.rotation.z = 0.5 * s;
    flap.rotation.y = -0.3 * s;
    bust.add(flap);
  });

  // Jacket lapels over the shirt.
  [-1, 1].forEach((s) => {
    const lapel = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 1.0, 0.08),
      makeToon(COLORS.lapel)
    );
    lapel.position.set(0.42 * s, -0.55, 0.48);
    lapel.rotation.z = 0.22 * s;
    lapel.rotation.y = -0.25 * s;
    addOutline(lapel, 0.012);
    bust.add(lapel);
  });

  // Red tie: knot + tapered blade.
  const knot = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.22, 0.12),
    makeToon(COLORS.tieDark)
  );
  knot.position.set(0, 0.02, 0.6);
  knot.rotation.z = Math.PI / 4;
  bust.add(knot);

  const blade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.16, 1.0, 4),
    makeToon(COLORS.tie)
  );
  blade.position.set(0, -0.55, 0.6);
  blade.rotation.y = Math.PI / 4;
  addOutline(blade, 0.012);
  bust.add(blade);

  // A single jacket button.
  const button = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 12, 12),
    makeToon(COLORS.button)
  );
  button.position.set(0, -1.15, 0.62);
  button.scale.set(1, 1, 0.5);
  bust.add(button);

  return bust;
}

/**
 * Build the whole detailed Reigen figure.
 * @returns {THREE.Group} centered roughly on the face, +Z is forward.
 */
export function createReigen() {
  const reigen = new THREE.Group();
  reigen.name = "Reigen";

  reigen.add(buildHead());

  const nose = buildNose();
  reigen.add(nose);

  // Eyes + brows, sitting proud on the face surface and angled to wrap it.
  const eyeY = 0.1;
  const eyeZ = 0.82;
  const eyeX = 0.4;

  const leftEye = buildEye("left");
  leftEye.position.set(eyeX, eyeY, eyeZ);
  leftEye.rotation.y = -0.4;
  reigen.add(leftEye);

  const rightEye = buildEye("right");
  rightEye.position.set(-eyeX, eyeY, eyeZ);
  rightEye.rotation.y = 0.4;
  reigen.add(rightEye);

  const leftBrow = buildBrow("left");
  leftBrow.position.set(eyeX, eyeY + 0.36, eyeZ + 0.04);
  leftBrow.rotation.y = -0.4;
  reigen.add(leftBrow);

  const rightBrow = buildBrow("right");
  rightBrow.position.set(-eyeX, eyeY + 0.36, eyeZ + 0.04);
  rightBrow.rotation.y = 0.4;
  reigen.add(rightBrow);

  const mouth = buildMouth();
  mouth.position.set(0, -0.5, 0.99);
  reigen.add(mouth);

  const leftEar = buildEar("left");
  leftEar.position.set(0.95, -0.02, 0.0);
  reigen.add(leftEar);

  const rightEar = buildEar("right");
  rightEar.position.set(-0.95, -0.02, 0.0);
  reigen.add(rightEar);

  reigen.add(buildHair());
  reigen.add(buildBust());

  return reigen;
}
