// 2D framing presets, expressed relative to the sampled content: `zoom` is a
// multiplier over the fit-to-screen scale; `cx`/`cy` are the focus point in
// normalised content coordinates (0..1). Upper region ≈ face/hair for portraits.
/** @typedef {{id:string,label:string,zoom:number,cx:number,cy:number}} Shot */

/** @type {Shot[]} */
export const SHOTS = [
  { id: "full", label: "① Full", zoom: 1.0, cx: 0.5, cy: 0.5 },
  { id: "portrait", label: "② Portrait", zoom: 1.3, cx: 0.5, cy: 0.4 },
  { id: "face", label: "③ Face", zoom: 2.1, cx: 0.5, cy: 0.3 },
  { id: "eyes", label: "④ Eyes", zoom: 3.2, cx: 0.5, cy: 0.28 },
  { id: "top", label: "⑤ Top", zoom: 2.0, cx: 0.5, cy: 0.12 },
  { id: "detail", label: "⑥ Detail", zoom: 4.0, cx: 0.5, cy: 0.3 },
];

export function getShot(id) {
  return SHOTS.find((s) => s.id === id) ?? SHOTS[0];
}
