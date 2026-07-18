// Anime / cel-shaded look helpers for the Reigen model.
//   - makeToon(color)  -> MeshToonMaterial with a banded gradient map
//   - addOutline(mesh) -> inverted-hull black outline (the "ink line")
//   - sculptBumps(geo)  -> push vertices along normals to sculpt a shape
// Keeping this separate lets the character file focus on anatomy.

import * as THREE from "three";

// A 1-D gradient map gives MeshToonMaterial its hard light/shadow bands,
// which is what sells the Mob Psycho 100 cel-shaded feel.
function makeGradientMap(steps = [0x55, 0x88, 0xbb, 0xff]) {
  const data = new Uint8Array(steps);
  const tex = new THREE.DataTexture(data, steps.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

const GRADIENT = makeGradientMap();

/**
 * Cel-shaded material.
 * @param {number} color
 * @param {object} [opts] extra MeshToonMaterial options
 */
export function makeToon(color, opts = {}) {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: GRADIENT,
    ...opts,
  });
}

const OUTLINE_INK = 0x140f0c;

/**
 * Add an inverted-hull outline as a child of `mesh`.
 * Vertices are pushed outward along their normals so it works for any pivot,
 * unlike a plain uniform scale.
 * @param {THREE.Mesh} mesh
 * @param {number} [thickness]
 * @param {number} [ink]
 * @returns {THREE.Mesh} the mesh (for chaining)
 */
export function addOutline(mesh, thickness = 0.02, ink = OUTLINE_INK) {
  const geo = mesh.geometry.clone();
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  if (!nor) geo.computeVertexNormals();
  const n = geo.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) + n.getX(i) * thickness,
      pos.getY(i) + n.getY(i) * thickness,
      pos.getZ(i) + n.getZ(i) * thickness
    );
  }
  pos.needsUpdate = true;

  const outline = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ color: ink, side: THREE.BackSide })
  );
  outline.name = "outline";
  outline.renderOrder = -1;
  mesh.add(outline);
  return mesh;
}

/**
 * Sculpt a geometry by pushing each vertex along its normal by the sum of
 * smooth radial "bumps". Each bump is aimed at a direction on the unit sphere.
 * Negative amp carves an indentation (eye sockets, temples).
 *
 * @param {THREE.BufferGeometry} geo  (should have normals; sphere does)
 * @param {Array<{dir:number[], amp:number, spread:number}>} bumps
 */
export function sculptBumps(geo, bumps) {
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const v = new THREE.Vector3();
  const dir = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
    const len = v.length();
    const unit = v.clone().normalize();

    let disp = 0;
    for (const b of bumps) {
      dir.set(b.dir[0], b.dir[1], b.dir[2]).normalize();
      const d = unit.dot(dir); // 1 == same direction
      // Gaussian falloff on angular closeness.
      const t = Math.max(0, (d - (1 - b.spread)) / b.spread);
      disp += b.amp * t * t * (3 - 2 * t); // smoothstep-weighted
    }

    v.addScaledVector(nor ? new THREE.Vector3(nor.getX(i), nor.getY(i), nor.getZ(i)) : unit, disp);
    // keep it from collapsing through the center
    if (v.length() < len * 0.3) v.setLength(len * 0.3);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}
