// Reigen Arataka (Mob Psycho 100) as a flat 2D illustration, drawn with
// Three.js THREE.Shape fills on the XY plane and viewed with an orthographic
// camera. Each part is a filled polygon with a dark outline behind it, giving
// clean anime line-art. No lights needed — MeshBasicMaterial is unlit/flat.

import * as THREE from "three";

// --- Palette (Reigen: light ash-tan slicked hair, light suit, dark shirt) ---
const C = {
  outline: 0x241c15,
  skin: 0xf4cfa6,
  skinShade: 0xe4b487,
  hair: 0xb59a6b,
  hairShade: 0x8f7647,
  white: 0xfbf8f1,
  iris: 0x6d5636,
  dark: 0x241c15,
  brow: 0x6b5433,
  mouth: 0x9a5b4c,
  jacket: 0xcabfae,
  jacketShade: 0xb2a691,
  shirt: 0x33333c,
  tie: 0x8f2f2f,
};

// Add a filled part with an even dark outline behind it.
// The shape should be authored roughly around its own local origin; the outline
// is grown by `ow` world-units on every side around the shape's centroid.
function addPart(group, shape, opts) {
  const { fill, x = 0, y = 0, z = 0, sx = 1, outline = true, ow = 0.045, seg = 24 } = opts;
  const geo = new THREE.ShapeGeometry(shape, seg);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: fill }));
  mesh.position.set(x, y, z);
  mesh.scale.x = sx;
  group.add(mesh);

  if (outline) {
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const cx = (bb.min.x + bb.max.x) / 2;
    const cy = (bb.min.y + bb.max.y) / 2;
    const w = Math.max(1e-3, bb.max.x - bb.min.x);
    const h = Math.max(1e-3, bb.max.y - bb.min.y);
    const og = geo.clone();
    og.translate(-cx, -cy, 0);
    og.scale((w + 2 * ow) / w, (h + 2 * ow) / h, 1);
    og.translate(cx, cy, 0);
    const om = new THREE.Mesh(og, new THREE.MeshBasicMaterial({ color: C.outline }));
    om.position.set(x, y, z - 0.02);
    om.scale.x = sx;
    group.add(om);
  }
  return mesh;
}

// Helpers to author shapes concisely.
function poly(points) {
  const s = new THREE.Shape();
  points.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])));
  s.closePath();
  return s;
}

// ---------------------------------------------------------------------------
function buildFace() {
  const s = new THREE.Shape();
  // Angular male anime face: wide forehead, flat-ish cheeks, tapered jaw,
  // slightly pointed chin.
  s.moveTo(0, -1.28); // chin
  s.bezierCurveTo(0.34, -1.24, 0.6, -1.02, 0.74, -0.62); // right jaw
  s.bezierCurveTo(0.85, -0.32, 0.9, 0.02, 0.88, 0.34); // right cheek
  s.bezierCurveTo(0.86, 0.66, 0.74, 0.92, 0.5, 1.04); // right brow/forehead
  s.quadraticCurveTo(0, 1.16, -0.5, 1.04); // top forehead
  s.bezierCurveTo(-0.74, 0.92, -0.86, 0.66, -0.88, 0.34);
  s.bezierCurveTo(-0.9, 0.02, -0.85, -0.32, -0.74, -0.62);
  s.bezierCurveTo(-0.6, -1.02, -0.34, -1.24, 0, -1.28);
  return s;
}

function buildEar() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.2);
  s.bezierCurveTo(0.16, 0.16, 0.18, -0.06, 0.08, -0.2);
  s.bezierCurveTo(0.0, -0.28, -0.08, -0.18, -0.06, -0.02);
  s.bezierCurveTo(-0.05, 0.1, -0.06, 0.18, 0, 0.2);
  return s;
}

// Front hair: slicked STRAIGHT BACK. A band across the top of the head — short
// at the sides (above the ears), swept up over the crown, with a high forehead
// hairline and a side part on his left (+x). No long side-locks.
function buildHairFront() {
  const s = new THREE.Shape();
  s.moveTo(0.84, 0.2); // right temple (short side, above the ear)
  // up the right side and over the crown, with a little swept-up volume
  s.bezierCurveTo(0.98, 0.6, 0.96, 1.0, 0.82, 1.28);
  s.bezierCurveTo(0.6, 1.6, 0.2, 1.66, -0.12, 1.62);
  s.bezierCurveTo(-0.46, 1.58, -0.74, 1.34, -0.86, 1.0);
  s.bezierCurveTo(-0.96, 0.66, -0.92, 0.5, -0.84, 0.2); // down to left temple
  // hairline back across the forehead: high, with a peak at the side part
  s.bezierCurveTo(-0.66, 0.44, -0.4, 0.6, -0.12, 0.58); // left sweep up
  s.bezierCurveTo(0.06, 0.57, 0.16, 0.7, 0.24, 0.6); // the part peak (~x=0.2)
  s.bezierCurveTo(0.34, 0.46, 0.5, 0.34, 0.66, 0.28);
  s.bezierCurveTo(0.74, 0.25, 0.8, 0.22, 0.84, 0.2);
  s.closePath();
  return s;
}

// Strand grooves + the part, drawn as thin dark shapes sweeping BACK/up from
// near the part, so the hair reads as combed straight back.
function buildHairStrands() {
  const g = new THREE.Group();
  // Part line: a wedge at the part point sweeping up and slightly back.
  const part = poly([
    [0.2, 0.58],
    [0.12, 1.4],
    [0.24, 1.42],
    [0.32, 0.56],
  ]);
  addPart(g, part, { fill: C.hairShade, z: 0.02, outline: false });

  // Swept-back strand lines fanning from around the part toward the crown/sides.
  const strokes = [
    [[-0.1, 0.6], [-0.4, 1.42], [-0.3, 1.46], [0.0, 0.6]],
    [[-0.5, 0.55], [-0.72, 1.24], [-0.62, 1.28], [-0.4, 0.55]],
    [[0.34, 0.5], [0.5, 1.34], [0.6, 1.32], [0.44, 0.48]],
    [[0.6, 0.34], [0.82, 1.06], [0.9, 1.02], [0.68, 0.3]],
    [[-0.76, 0.5], [-0.9, 1.0], [-0.82, 1.04], [-0.68, 0.5]],
  ];
  strokes.forEach((pts) =>
    addPart(g, poly(pts), { fill: C.hairShade, z: 0.02, outline: false })
  );
  return g;
}

// A sharp, narrow Reigen eye. Local origin at the eye center.
// dir = +1 for his right eye (screen left), -1 for his left eye (screen right).
function buildEye(dir) {
  const g = new THREE.Group();

  // Eye white — a narrow almond, outer corner (toward dir) a touch lower/sharper.
  const white = new THREE.Shape();
  white.moveTo(-0.24 * dir, 0.0);
  white.quadraticCurveTo(0, 0.14, 0.24 * dir, 0.03);
  white.quadraticCurveTo(0, -0.11, -0.24 * dir, 0.0);
  addPart(g, white, { fill: C.white, z: 0.0, ow: 0.02 });

  // Iris + pupil (clipped feel by the narrow white).
  const iris = new THREE.Shape();
  iris.absellipse(0.02 * dir, -0.01, 0.1, 0.13, 0, Math.PI * 2);
  addPart(g, iris, { fill: C.iris, z: 0.02, outline: false });
  const pupil = new THREE.Shape();
  pupil.absellipse(0.02 * dir, -0.01, 0.05, 0.08, 0, Math.PI * 2);
  addPart(g, pupil, { fill: C.dark, z: 0.03, outline: false });
  const glint = new THREE.Shape();
  glint.absellipse(0.06 * dir, 0.05, 0.025, 0.03, 0, Math.PI * 2);
  addPart(g, glint, { fill: C.white, z: 0.04, outline: false });

  // The signature thick upper eye-line, angled down toward the nose.
  const line = new THREE.Shape();
  line.moveTo(-0.28 * dir, 0.02);
  line.quadraticCurveTo(0, 0.2, 0.3 * dir, 0.08);
  line.quadraticCurveTo(0.28 * dir, 0.0, 0.26 * dir, -0.02);
  line.quadraticCurveTo(0, 0.1, -0.26 * dir, -0.04);
  line.closePath();
  addPart(g, line, { fill: C.dark, z: 0.05, outline: false });

  return g;
}

function buildBrow(dir) {
  // Thin, fairly straight brow angled down toward the center (serious look).
  const s = new THREE.Shape();
  s.moveTo(-0.26 * dir, 0.02);
  s.lineTo(0.26 * dir, 0.1);
  s.lineTo(0.26 * dir, 0.04);
  s.lineTo(-0.26 * dir, -0.05);
  s.closePath();
  return s;
}

function buildNose() {
  // Subtle: a soft shadow line down the right of the bridge + a small tip.
  const g = new THREE.Group();
  const bridge = poly([
    [0.02, 0.16],
    [0.08, -0.16],
    [0.02, -0.2],
    [-0.02, 0.14],
  ]);
  addPart(g, bridge, { fill: C.skinShade, z: 0.01, outline: false });
  const tip = new THREE.Shape();
  tip.absellipse(0.0, -0.2, 0.06, 0.045, 0, Math.PI * 2);
  addPart(g, tip, { fill: C.skinShade, z: 0.01, outline: false });
  return g;
}

function buildMouth() {
  // Confident closed smirk: a thin line, slightly upturned on his left (+x).
  const s = new THREE.Shape();
  s.moveTo(-0.28, -0.02);
  s.quadraticCurveTo(0.05, -0.06, 0.3, 0.06); // slight upturn to the right
  s.quadraticCurveTo(0.05, -0.02, -0.28, 0.02);
  s.closePath();
  return s;
}

function buildBust() {
  const g = new THREE.Group();

  // Neck.
  addPart(g, poly([
    [-0.3, 0.15], [0.3, 0.15], [0.42, -0.55], [-0.42, -0.55],
  ]), { fill: C.skin, x: 0, y: -1.5, z: -0.1 });

  // Jacket shoulders (wide trapezoid).
  addPart(g, poly([
    [-1.7, -1.1], [1.7, -1.1], [1.4, 0.1], [-1.4, 0.1],
  ]), { fill: C.jacket, x: 0, y: -2.5, z: -0.2, ow: 0.05 });

  // Dark shirt triangle in the collar V.
  addPart(g, poly([
    [-0.32, 0.2], [0.32, 0.2], [0, -0.7],
  ]), { fill: C.shirt, x: 0, y: -2.15, z: -0.05, outline: false });

  // Jacket lapels (two angled panels over the shirt).
  addPart(g, poly([
    [-0.05, 0.28], [-0.62, 0.22], [-0.5, -0.75],
  ]), { fill: C.jacketShade, x: 0, y: -2.15, z: -0.02, ow: 0.03 });
  addPart(g, poly([
    [0.05, 0.28], [0.62, 0.22], [0.5, -0.75],
  ]), { fill: C.jacketShade, x: 0, y: -2.15, z: -0.02, ow: 0.03 });

  // Red tie: knot + blade.
  addPart(g, poly([
    [-0.1, 0.05], [0.1, 0.05], [0.09, -0.12], [-0.09, -0.12],
  ]), { fill: C.tie, x: 0, y: -2.02, z: 0.0, ow: 0.02 });
  addPart(g, poly([
    [-0.09, -0.12], [0.09, -0.12], [0.16, -0.9], [0, -1.02], [-0.16, -0.9],
  ]), { fill: C.tie, x: 0, y: -2.02, z: 0.0, ow: 0.02 });

  return g;
}

/**
 * Build the flat 2D Reigen portrait.
 * @returns {THREE.Group} centered near the face; +Y up, drawn on the XY plane.
 */
export function createReigen2D() {
  const g = new THREE.Group();
  g.name = "Reigen2D";

  // Back-to-front by z.
  g.add(buildBust());

  // Ears (behind the face edges); the left one is mirrored.
  addPart(g, buildEar(), { fill: C.skin, x: 0.88, y: -0.08, z: -0.05 });
  addPart(g, buildEar(), { fill: C.skin, x: -0.88, y: -0.08, z: -0.05, sx: -1 });

  // Face.
  addPart(g, buildFace(), { fill: C.skin, x: 0, y: 0, z: 0, ow: 0.05 });

  // Brows.
  addPart(g, buildBrow(1), { fill: C.brow, x: 0.44, y: 0.34, z: 0.5, outline: false });
  addPart(g, buildBrow(-1), { fill: C.brow, x: -0.44, y: 0.34, z: 0.5, outline: false });

  // Eyes.
  const rEye = buildEye(1);
  rEye.position.set(0.44, 0.06, 0.5);
  g.add(rEye);
  const lEye = buildEye(-1);
  lEye.position.set(-0.44, 0.06, 0.5);
  g.add(lEye);

  // Nose + mouth.
  const nose = buildNose();
  nose.position.set(0.0, -0.28, 0.5);
  g.add(nose);
  addPart(g, buildMouth(), { fill: C.mouth, x: 0, y: -0.72, z: 0.5, outline: false });

  // Hair (front, over the forehead) + strand detail on top.
  addPart(g, buildHairFront(), { fill: C.hair, x: 0, y: 0, z: 0.3, ow: 0.05 });
  const strands = buildHairStrands();
  strands.position.z = 0.32;
  g.add(strands);

  return g;
}
