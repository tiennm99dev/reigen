// Reigen Arataka (Mob Psycho 100) as flat 2D vector regions — an ORIGINAL
// interpretation of the character (not a traced official image). Each region is
// a THREE.Shape plus a placement + colour. This is the single source of truth;
// both the mesh view and the point-cloud view are built from getRegions().

import * as THREE from "three";

// --- Palette (light ash-tan slicked hair, light suit, dark shirt, red tie) --
export const C = {
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
  s.moveTo(0, -1.28);
  s.bezierCurveTo(0.34, -1.24, 0.6, -1.02, 0.74, -0.62);
  s.bezierCurveTo(0.85, -0.32, 0.9, 0.02, 0.88, 0.34);
  s.bezierCurveTo(0.86, 0.66, 0.74, 0.92, 0.5, 1.04);
  s.quadraticCurveTo(0, 1.16, -0.5, 1.04);
  s.bezierCurveTo(-0.74, 0.92, -0.86, 0.66, -0.88, 0.34);
  s.bezierCurveTo(-0.9, 0.02, -0.85, -0.32, -0.74, -0.62);
  s.bezierCurveTo(-0.6, -1.02, -0.34, -1.24, 0, -1.28);
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

// Slicked-straight-back hair: a band across the top, short at the sides, high
// forehead hairline, side part on his left (+x).
function hairShape() {
  const s = new THREE.Shape();
  s.moveTo(0.84, 0.2);
  s.bezierCurveTo(0.98, 0.6, 0.96, 1.0, 0.82, 1.28);
  s.bezierCurveTo(0.6, 1.6, 0.2, 1.66, -0.12, 1.62);
  s.bezierCurveTo(-0.46, 1.58, -0.74, 1.34, -0.86, 1.0);
  s.bezierCurveTo(-0.96, 0.66, -0.92, 0.5, -0.84, 0.2);
  s.bezierCurveTo(-0.66, 0.44, -0.4, 0.6, -0.12, 0.58);
  s.bezierCurveTo(0.06, 0.57, 0.16, 0.7, 0.24, 0.6);
  s.bezierCurveTo(0.34, 0.46, 0.5, 0.34, 0.66, 0.28);
  s.bezierCurveTo(0.74, 0.25, 0.8, 0.22, 0.84, 0.2);
  s.closePath();
  return s;
}

const HAIR_STROKES = [
  [[0.2, 0.58], [0.12, 1.4], [0.24, 1.42], [0.32, 0.56]], // part
  [[-0.1, 0.6], [-0.4, 1.42], [-0.3, 1.46], [0.0, 0.6]],
  [[-0.5, 0.55], [-0.72, 1.24], [-0.62, 1.28], [-0.4, 0.55]],
  [[0.34, 0.5], [0.5, 1.34], [0.6, 1.32], [0.44, 0.48]],
  [[0.6, 0.34], [0.82, 1.06], [0.9, 1.02], [0.68, 0.3]],
  [[-0.76, 0.5], [-0.9, 1.0], [-0.82, 1.04], [-0.68, 0.5]],
];

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

const DEFAULT = { x: 0, y: 0, z: 0, sx: 1, outline: true, ow: 0.045 };

/**
 * Flat list of placed regions, back-to-front by z.
 * @returns {Array<{shape:THREE.Shape,color:number,x:number,y:number,z:number,sx:number,outline:boolean,ow:number}>}
 */
export function getRegions() {
  const R = [];
  const add = (shape, o) => R.push({ shape, ...DEFAULT, ...o });

  // --- Bust (suit / shirt / tie) ---
  add(poly([[-1.7, -1.1], [1.7, -1.1], [1.4, 0.1], [-1.4, 0.1]]),
    { color: C.jacket, y: -2.5, z: -0.2, ow: 0.05 });
  add(poly([[-0.3, 0.15], [0.3, 0.15], [0.42, -0.55], [-0.42, -0.55]]),
    { color: C.skin, y: -1.5, z: -0.1 });
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

  // --- Face ---
  add(faceShape(), { color: C.skin, z: 0, ow: 0.05 });

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
  add(mouthShape(), { color: C.mouth, y: -0.72, z: 0.5, outline: false });

  // --- Hair ---
  add(hairShape(), { color: C.hair, z: 0.3, ow: 0.05 });
  HAIR_STROKES.forEach((pts) =>
    add(poly(pts), { color: C.hairShade, z: 0.32, outline: false })
  );

  return R;
}
