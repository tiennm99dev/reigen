// 2D framing presets for the flat Reigen portrait. Each "shot" is an
// orthographic zoom + pan (screen-space center), tweened when selected.
/**
 * @typedef {Object} Shot
 * @property {string} id
 * @property {string} label
 * @property {number} zoom     - orthographic zoom (higher = closer)
 * @property {number} cx       - camera center x (world units)
 * @property {number} cy       - camera center y (world units)
 */

/** @type {Shot[]} */
export const SHOTS = [
  { id: "full", label: "① Full", zoom: 1.0, cx: 0, cy: -0.3 },
  { id: "portrait", label: "② Portrait", zoom: 1.35, cx: 0, cy: 0.05 },
  { id: "face", label: "③ Face", zoom: 1.9, cx: 0, cy: 0.15 },
  { id: "eyes", label: "④ The Stare", zoom: 3.0, cx: 0, cy: 0.15 },
  { id: "hair", label: "⑤ Hair", zoom: 1.6, cx: 0, cy: 0.9 },
  { id: "smirk", label: "⑥ Smirk", zoom: 3.0, cx: 0, cy: -0.55 },
];

export function getShot(id) {
  return SHOTS.find((s) => s.id === id) ?? SHOTS[0];
}
