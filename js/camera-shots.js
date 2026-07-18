// Named camera shots for framing Reigen. Each shot defines where the camera
// sits and where it looks. main.js tweens between them when a button is pressed.
import * as THREE from "three";

/**
 * @typedef {Object} Shot
 * @property {string} id
 * @property {string} label
 * @property {THREE.Vector3} position - camera position
 * @property {THREE.Vector3} target   - orbit/look-at target
 */

/** @type {Shot[]} */
export const SHOTS = [
  {
    id: "front",
    label: "① Front",
    position: new THREE.Vector3(0, 0.2, 6.2),
    target: new THREE.Vector3(0, 0, 0),
  },
  {
    id: "three-quarter",
    label: "② 3/4 View",
    position: new THREE.Vector3(3.8, 0.6, 4.8),
    target: new THREE.Vector3(0, 0, 0),
  },
  {
    id: "profile",
    label: "③ Side Profile",
    position: new THREE.Vector3(6.0, 0.1, 0.4),
    target: new THREE.Vector3(0, -0.1, 0),
  },
  {
    id: "face-closeup",
    label: "④ Face Close-up",
    position: new THREE.Vector3(0, 0.25, 3.2),
    target: new THREE.Vector3(0, 0.15, 0.4),
  },
  {
    id: "eyes",
    label: "⑤ The Stare",
    position: new THREE.Vector3(1.1, 0.3, 2.6),
    target: new THREE.Vector3(0, 0.2, 0.6),
  },
  {
    id: "hair-top",
    label: "⑥ Hair / Top",
    position: new THREE.Vector3(0.2, 4.6, 3.2),
    target: new THREE.Vector3(0, 0.7, 0),
  },
  {
    id: "low-hero",
    label: "⑦ Low Hero",
    position: new THREE.Vector3(-2.6, -2.2, 5.0),
    target: new THREE.Vector3(0, 0.1, 0),
  },
];

export function getShot(id) {
  return SHOTS.find((s) => s.id === id) ?? SHOTS[0];
}
