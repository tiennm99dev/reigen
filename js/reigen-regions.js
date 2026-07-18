// Reigen Arataka (Mob Psycho 100) as flat 2D vector regions — an ORIGINAL
// interpretation of the character (not a traced official image). Each region is
// a THREE.Shape plus a placement + colour. This is the single source of truth;
// both the mesh view and the point-cloud view are built from getRegions().

import * as THREE from "three";

// --- Palette (per the Mob Psycho 100 wiki: reddish-blond hair, dark-brown
// eyes, dark-grey suit, black shirt, pink tie). ------------------------------
export const C = {
  outline: 0x241c15,
  skin: 0xf4cfa6,
  skinShade: 0xe4b487,
  hair: 0xcf9a54, // reddish-blond
  hairLine: 0xbd8640,
  hairShade: 0xa06f2c,
  white: 0xfbf8f1,
  iris: 0x43301f, // dark brown
  dark: 0x241c15,
  brow: 0x5a3f24,
  mouth: 0x9a5b4c,
  jacket: 0x474a54, // dark grey suit
  jacketShade: 0x383b43,
  shirt: 0x201f24, // black shirt
  tie: 0xd05c86, // pink tie
};

// Author a closed polygon from [x,y] pairs.
function poly(points) {
  const s = new THREE.Shape();
  points.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])));
  s.closePath();
  return s;
}

function faceShape() {
  const s = new THREE.Shape();
  // Angular male anime face: wide forehead, tapered jaw, slightly pointed chin.
  s.moveTo(0, -1.14);
  s.bezierCurveTo(0.36, -1.08, 0.62, -0.9, 0.76, -0.56);
  s.bezierCurveTo(0.87, -0.28, 0.91, 0.04, 0.88, 0.36);
  s.bezierCurveTo(0.86, 0.68, 0.74, 0.94, 0.5, 1.06);
  s.quadraticCurveTo(0, 1.18, -0.5, 1.06);
  s.bezierCurveTo(-0.74, 0.94, -0.86, 0.68, -0.88, 0.36);
  s.bezierCurveTo(-0.91, 0.04, -0.87, -0.28, -0.76, -0.56);
  s.bezierCurveTo(-0.62, -0.9, -0.36, -1.08, 0, -1.14);
  return s;
}

function earShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.2);
  s.bezierCurveTo(0.16, 0.16, 0.18, -0.06, 0.08, -0.2);
  s.bezierCurveTo(0.0, -0.28, -0.08, -0.18, -0.06, -0.02);
  s.bezierCurveTo(-0.05, 0.1, -0.06, 0.18, 0, 0.2);
  return s;
}

// Short hair with a side part (his left, +x) and bangs sweeping across the
// forehead in two directions, meeting at the part. Lower crown, short sides —
// closer to Reigen's canonical cut than a slicked-back helmet.
function hairShape() {
  const s = new THREE.Shape();
  // Outer silhouette: right temple -> over the crown -> left temple.
  s.moveTo(0.82, 0.16);
  s.bezierCurveTo(0.94, 0.5, 0.92, 0.92, 0.78, 1.18);
  s.bezierCurveTo(0.54, 1.44, 0.18, 1.5, -0.14, 1.46);
  s.bezierCurveTo(-0.46, 1.42, -0.72, 1.2, -0.84, 0.9);
  s.bezierCurveTo(-0.92, 0.58, -0.9, 0.44, -0.82, 0.16);
  // Bangs edge across the forehead: fringe tips dip down, notch at the part.
  s.bezierCurveTo(-0.72, 0.4, -0.62, 0.44, -0.52, 0.36);
  s.lineTo(-0.44, 0.2); // left fringe tip
  s.bezierCurveTo(-0.38, 0.34, -0.28, 0.42, -0.16, 0.42);
  s.lineTo(-0.08, 0.24); // fringe tip
  s.bezierCurveTo(0.0, 0.4, 0.08, 0.5, 0.15, 0.6); // rise to the part
  s.lineTo(0.22, 0.52); // part notch
  s.bezierCurveTo(0.3, 0.44, 0.4, 0.4, 0.5, 0.36);
  s.lineTo(0.56, 0.22); // right fringe tip (shorter side)
  s.bezierCurveTo(0.64, 0.32, 0.74, 0.24, 0.82, 0.16);
  s.closePath();
  return s;
}

// A thin tapered strand quad from (x0,y0)->(x1,y1) with half-width w.
function strandQuad(x0, y0, x1, y1, w) {
  let dx = x1 - x0, dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * w, py = (dx / len) * w;
  const wt = w * 0.4; // taper toward the tip
  const ptx = (-dy / len) * wt, pty = (dx / len) * wt;
  return poly([
    [x0 + px, y0 + py],
    [x1 + ptx, y1 + pty],
    [x1 - ptx, y1 - pty],
    [x0 - px, y0 - py],
  ]);
}

// Grooves fanning from the side part: bangs sweep down/out across the forehead
// (bigger sweep to his right / viewer-left), plus strands over the crown.
// [x0,y0,x1,y1,halfWidth]; first entry is the darker part groove.
const HAIR_STRANDS = [
  [0.2, 0.5, 0.15, 1.2, 0.03], // part groove (darker)
  [0.08, 0.52, -0.24, 0.36], // left bangs (low)
  [-0.06, 0.54, -0.38, 0.34],
  [-0.24, 0.56, -0.52, 0.4],
  [-0.44, 0.58, -0.68, 0.92], // left side sweep up
  [-0.05, 0.72, -0.34, 1.26], // crown, left
  [-0.42, 0.78, -0.64, 1.12],
  [0.28, 0.5, 0.5, 0.34], // right bangs (shorter side)
  [0.42, 0.54, 0.62, 0.9], // right side sweep up
  [0.28, 0.68, 0.48, 1.18], // crown, right
].map((s) => (s.length === 5 ? s : [...s, 0.025]));

function eyeShapes(dir) {
  // Sharp, narrow Reigen eye at local origin. Returns [{shape,color,dz,outline,ow}].
  const white = new THREE.Shape();
  white.moveTo(-0.24 * dir, 0.0);
  white.quadraticCurveTo(0, 0.14, 0.24 * dir, 0.03);
  white.quadraticCurveTo(0, -0.11, -0.24 * dir, 0.0);

  const iris = new THREE.Shape();
  iris.absellipse(0.02 * dir, -0.01, 0.1, 0.13, 0, Math.PI * 2);
  const pupil = new THREE.Shape();
  pupil.absellipse(0.02 * dir, -0.01, 0.05, 0.08, 0, Math.PI * 2);
  const glint = new THREE.Shape();
  glint.absellipse(0.06 * dir, 0.05, 0.025, 0.03, 0, Math.PI * 2);

  const line = new THREE.Shape(); // thick upper eye-line
  line.moveTo(-0.28 * dir, 0.02);
  line.quadraticCurveTo(0, 0.2, 0.3 * dir, 0.08);
  line.quadraticCurveTo(0.28 * dir, 0.0, 0.26 * dir, -0.02);
  line.quadraticCurveTo(0, 0.1, -0.26 * dir, -0.04);
  line.closePath();

  return [
    { shape: white, color: C.white, dz: 0.0, outline: true, ow: 0.02 },
    { shape: iris, color: C.iris, dz: 0.02, outline: false },
    { shape: pupil, color: C.dark, dz: 0.03, outline: false },
    { shape: glint, color: C.white, dz: 0.04, outline: false },
    { shape: line, color: C.dark, dz: 0.05, outline: false },
  ];
}

function browShape(dir) {
  const s = new THREE.Shape();
  s.moveTo(-0.26 * dir, 0.02);
  s.lineTo(0.26 * dir, 0.1);
  s.lineTo(0.26 * dir, 0.04);
  s.lineTo(-0.26 * dir, -0.05);
  s.closePath();
  return s;
}

function mouthShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.28, -0.02);
  s.quadraticCurveTo(0.05, -0.06, 0.3, 0.06);
  s.quadraticCurveTo(0.05, -0.02, -0.28, 0.02);
  s.closePath();
  return s;
}

// grad (optional): { lo, hi } vertical brightness multipliers applied to the
// fill — `lo` at the region's bottom, `hi` at its top — for lit-from-above form
// shading. Points renderer reads it; outlines are unaffected.
const DEFAULT = { x: 0, y: 0, z: 0, sx: 1, outline: true, ow: 0.045, grad: null };

/**
 * Flat list of placed regions, back-to-front by z.
 * @returns {Array<{shape:THREE.Shape,color:number,x:number,y:number,z:number,sx:number,outline:boolean,ow:number}>}
 */
export function getRegions() {
  const R = [];
  const add = (shape, o) => R.push({ shape, ...DEFAULT, ...o });

  // --- Bust (suit / shirt / tie) ---
  add(poly([[-1.7, -1.1], [1.7, -1.1], [1.4, 0.1], [-1.4, 0.1]]),
    { color: C.jacket, y: -2.5, z: -0.2, ow: 0.05, grad: { lo: 0.85, hi: 1.06 } });
  add(poly([[-0.3, 0.15], [0.3, 0.15], [0.42, -0.55], [-0.42, -0.55]]),
    { color: C.skin, y: -1.5, z: -0.1, grad: { lo: 0.98, hi: 0.82 } }); // shadow under chin
  add(poly([[-0.32, 0.2], [0.32, 0.2], [0, -0.7]]),
    { color: C.shirt, y: -2.15, z: -0.05, outline: false });
  add(poly([[-0.05, 0.28], [-0.62, 0.22], [-0.5, -0.75]]),
    { color: C.jacketShade, y: -2.15, z: -0.02, ow: 0.03 });
  add(poly([[0.05, 0.28], [0.62, 0.22], [0.5, -0.75]]),
    { color: C.jacketShade, y: -2.15, z: -0.02, ow: 0.03 });
  add(poly([[-0.1, 0.05], [0.1, 0.05], [0.09, -0.12], [-0.09, -0.12]]),
    { color: C.tie, y: -2.02, z: 0.0, ow: 0.02 });
  add(poly([[-0.09, -0.12], [0.09, -0.12], [0.16, -0.9], [0, -1.02], [-0.16, -0.9]]),
    { color: C.tie, y: -2.02, z: 0.0, ow: 0.02 });

  // --- Ears (left mirrored) ---
  add(earShape(), { color: C.skin, x: 0.88, y: -0.08, z: -0.05 });
  add(earShape(), { color: C.skin, x: -0.88, y: -0.08, z: -0.05, sx: -1 });

  // --- Face (lit from above) ---
  add(faceShape(), { color: C.skin, z: 0, ow: 0.05, grad: { lo: 0.9, hi: 1.02 } });

  // Soft forehead shadow just under the hairline (fades downward via gradient).
  const fh = new THREE.Shape();
  fh.moveTo(-0.6, 0.28);
  fh.bezierCurveTo(-0.4, 0.5, -0.1, 0.52, 0.24, 0.5);
  fh.bezierCurveTo(0.45, 0.42, 0.55, 0.34, 0.62, 0.28);
  fh.bezierCurveTo(0.3, 0.34, -0.2, 0.34, -0.6, 0.28);
  add(fh, { color: C.skin, z: 0.12, outline: false, grad: { lo: 1.0, hi: 0.84 } });

  // --- Brows ---
  add(browShape(1), { color: C.brow, x: 0.44, y: 0.34, z: 0.5, outline: false });
  add(browShape(-1), { color: C.brow, x: -0.44, y: 0.34, z: 0.5, outline: false });

  // --- Eyes ---
  for (const [dir, ex] of [[1, 0.44], [-1, -0.44]]) {
    for (const p of eyeShapes(dir)) {
      add(p.shape, { color: p.color, x: ex, y: 0.06, z: 0.5 + p.dz, outline: p.outline, ow: p.ow ?? 0.045 });
    }
  }

  // --- Nose ---
  add(poly([[0.02, 0.16], [0.08, -0.16], [0.02, -0.2], [-0.02, 0.14]]),
    { color: C.skinShade, y: -0.28, z: 0.51, outline: false });
  const noseTip = new THREE.Shape();
  noseTip.absellipse(0, -0.2, 0.06, 0.045, 0, Math.PI * 2);
  add(noseTip, { color: C.skinShade, y: -0.28, z: 0.51, outline: false });

  // --- Mouth ---
  add(mouthShape(), { color: C.mouth, y: -0.62, z: 0.5, outline: false });

  // --- Hair (highlight at the crown, darker roots via gradient) ---
  add(hairShape(), { color: C.hair, z: 0.3, ow: 0.05, grad: { lo: 0.82, hi: 1.12 } });
  HAIR_STRANDS.forEach((s, i) =>
    add(strandQuad(s[0], s[1], s[2], s[3], s[4]),
      { color: i === 0 ? C.hairShade : C.hairLine, z: 0.32, outline: false })
  );

  return R;
}
