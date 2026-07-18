// Procedural Reigen Arataka (Mob Psycho 100).
// Builds his head, face and slicked-back parted hair from Three.js primitives.
// Everything is returned inside a single THREE.Group so shots can frame it.

import * as THREE from "three";

// --- Palette matching Reigen's anime look -----------------------------------
const COLORS = {
  skin: 0xf0c9a4,
  skinShadow: 0xd9a97f,
  hair: 0xb98a4a, // light gingery brown, slicked back
  hairDark: 0x8a6330,
  eyeWhite: 0xf7f4ee,
  iris: 0x5a4632, // narrow, unimpressed brown eyes
  brow: 0x8a6330,
  mouth: 0x8a4b45,
  suit: 0x2c2c34,
  shirt: 0xf4f1ea,
  tie: 0x9a2f2f,
};

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.75,
    metalness: opts.metalness ?? 0.05,
    ...opts,
  });
}

// Build one eye assembly (white + iris + upper lid) facing +Z.
// Reigen's signature is half-lidded, narrow eyes, so the lid covers the top.
function buildEye(side) {
  const eye = new THREE.Group();
  const dir = side === "left" ? 1 : -1;

  const white = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 24, 24),
    mat(COLORS.eyeWhite, { roughness: 0.35 })
  );
  white.scale.set(1.35, 0.85, 0.6);
  eye.add(white);

  const iris = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 20, 20),
    mat(COLORS.iris, { roughness: 0.3 })
  );
  iris.position.set(0.02 * dir, -0.01, 0.11);
  iris.scale.set(1, 1.15, 0.5);
  eye.add(iris);

  const pupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 16, 16),
    mat(0x161210, { roughness: 0.2 })
  );
  pupil.position.set(0.02 * dir, -0.01, 0.15);
  pupil.scale.set(1, 1.2, 0.4);
  eye.add(pupil);

  // Heavy upper lid — the "done with your nonsense" Reigen stare.
  const lid = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    mat(COLORS.skin)
  );
  lid.scale.set(1.35, 0.9, 0.7);
  lid.position.set(0, 0.05, 0.02);
  lid.rotation.z = -0.12 * dir;
  eye.add(lid);

  return eye;
}

// A gently curved eyebrow made from a thin, slightly rotated box.
function buildBrow(side) {
  const dir = side === "left" ? 1 : -1;
  const brow = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.045, 0.08),
    mat(COLORS.brow, { roughness: 0.6 })
  );
  brow.rotation.z = 0.14 * dir; // slight confident arch
  return brow;
}

// Slicked-back, side-parted hair. Reigen keeps it tidy and swept up/back.
function buildHair() {
  const hair = new THREE.Group();
  const hairMat = mat(COLORS.hair, { roughness: 0.55 });
  const hairDarkMat = mat(COLORS.hairDark, { roughness: 0.6 });

  // Main dome cap covering the crown and back of the head.
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(1.06, 40, 40, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairMat
  );
  cap.scale.set(1.02, 1.05, 1.06);
  cap.position.y = 0.08;
  hair.add(cap);

  // Back-of-head volume so the crown isn't flat.
  const back = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 32, 32, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.55),
    hairMat
  );
  back.position.set(0, 0.02, -0.18);
  back.scale.set(1.0, 1.0, 1.05);
  hair.add(back);

  // Swept-back strands rendered as slim, tapered boxes fanning from the part.
  // The part sits slightly to his left; strands sweep up and toward the back.
  const strandGeo = new THREE.BoxGeometry(0.14, 0.9, 0.1);
  const partX = 0.18;
  for (let i = 0; i < 9; i++) {
    const t = i / 8; // 0..1 across the forehead
    const strand = new THREE.Mesh(strandGeo, i % 2 ? hairDarkMat : hairMat);
    const x = partX + (t - 0.5) * 1.7;
    strand.position.set(x, 0.86, 0.72 - Math.abs(x) * 0.25);
    // Sweep back: tilt tops backward, fan outward from the part.
    strand.rotation.x = -0.62;
    strand.rotation.z = (x - partX) * 0.32;
    strand.scale.y = 1 - Math.abs(x) * 0.12;
    hair.add(strand);
  }

  // A couple of short front tufts near the part for that neat framed forehead.
  for (let i = 0; i < 3; i++) {
    const tuft = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.5, 8),
      hairMat
    );
    tuft.position.set(partX - 0.05 + i * 0.16, 0.98, 0.62);
    tuft.rotation.x = -0.5;
    tuft.rotation.z = -0.2 + i * 0.15;
    hair.add(tuft);
  }

  // Sideburns / temple hair edges.
  [-1, 1].forEach((s) => {
    const side = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.55, 0.5),
      hairMat
    );
    side.position.set(0.95 * s, 0.25, 0.05);
    side.rotation.z = 0.1 * s;
    hair.add(side);
  });

  return hair;
}

// Suit shoulders + shirt + red tie so head shots read as a portrait.
function buildBust() {
  const bust = new THREE.Group();

  const shoulders = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.55, 0.9, 32, 1, true),
    mat(COLORS.suit, { roughness: 0.85, side: THREE.DoubleSide })
  );
  shoulders.position.y = -2.05;
  bust.add(shoulders);

  const chest = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.5),
    mat(COLORS.suit, { roughness: 0.85 })
  );
  chest.position.y = -2.5;
  chest.scale.set(1.2, 0.7, 0.9);
  bust.add(chest);

  // Shirt V + collar.
  const shirt = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.9, 3),
    mat(COLORS.shirt, { roughness: 0.6 })
  );
  shirt.rotation.y = Math.PI / 4;
  shirt.position.set(0, -1.85, 0.55);
  bust.add(shirt);

  const tie = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.8, 4),
    mat(COLORS.tie, { roughness: 0.5 })
  );
  tie.rotation.y = Math.PI / 4;
  tie.position.set(0, -2.0, 0.62);
  bust.add(tie);

  const knot = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 0.12),
    mat(COLORS.tie, { roughness: 0.5 })
  );
  knot.rotation.z = Math.PI / 4;
  knot.position.set(0, -1.6, 0.6);
  bust.add(knot);

  return bust;
}

/**
 * Build the whole Reigen figure.
 * @returns {THREE.Group} centered roughly on the face, +Z is forward.
 */
export function createReigen() {
  const reigen = new THREE.Group();
  reigen.name = "Reigen";

  // --- Head: a softened, slightly long face shape ---------------------------
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 48, 48),
    mat(COLORS.skin, { roughness: 0.68 })
  );
  head.scale.set(0.92, 1.08, 0.95);
  head.castShadow = true;
  reigen.add(head);

  // Jaw / chin taper for a more masculine, defined lower face.
  const jaw = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 32, 32),
    mat(COLORS.skin, { roughness: 0.68 })
  );
  jaw.position.set(0, -0.62, 0.06);
  jaw.scale.set(0.95, 0.85, 0.9);
  reigen.add(jaw);

  // --- Nose ---------------------------------------------------------------
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.42, 12),
    mat(COLORS.skin, { roughness: 0.7 })
  );
  nose.rotation.x = Math.PI / 2.05;
  nose.position.set(0, -0.12, 0.96);
  reigen.add(nose);

  // --- Eyes ---------------------------------------------------------------
  const eyeY = 0.14;
  const eyeZ = 0.82;
  const eyeX = 0.38;

  const leftEye = buildEye("left");
  leftEye.position.set(eyeX, eyeY, eyeZ);
  leftEye.rotation.y = -0.28;
  reigen.add(leftEye);

  const rightEye = buildEye("right");
  rightEye.position.set(-eyeX, eyeY, eyeZ);
  rightEye.rotation.y = 0.28;
  reigen.add(rightEye);

  // --- Brows --------------------------------------------------------------
  const leftBrow = buildBrow("left");
  leftBrow.position.set(eyeX, eyeY + 0.32, eyeZ + 0.12);
  leftBrow.rotation.y = -0.28;
  reigen.add(leftBrow);

  const rightBrow = buildBrow("right");
  rightBrow.position.set(-eyeX, eyeY + 0.32, eyeZ + 0.12);
  rightBrow.rotation.y = 0.28;
  reigen.add(rightBrow);

  // --- Mouth: a flat, slightly smug line ----------------------------------
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.04, 0.06),
    mat(COLORS.mouth, { roughness: 0.5 })
  );
  mouth.position.set(0, -0.58, 0.86);
  mouth.rotation.z = -0.04; // faint confident smirk
  reigen.add(mouth);

  // Subtle cheek/nasolabial hint via small darker spheres.
  [-1, 1].forEach((s) => {
    const cheek = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      mat(COLORS.skinShadow, { roughness: 0.8, transparent: true, opacity: 0.35 })
    );
    cheek.position.set(0.42 * s, -0.3, 0.82);
    cheek.scale.set(1, 1.3, 0.4);
    reigen.add(cheek);
  });

  // --- Ears ---------------------------------------------------------------
  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      mat(COLORS.skin, { roughness: 0.7 })
    );
    ear.position.set(0.92 * s, -0.05, 0.02);
    ear.scale.set(0.45, 0.9, 0.6);
    reigen.add(ear);
  });

  // --- Hair + bust --------------------------------------------------------
  reigen.add(buildHair());
  reigen.add(buildBust());

  return reigen;
}
