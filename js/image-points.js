// Turn a RAW raster image into a THREE.Points cloud: sample its pixels into
// coloured points that render with the same round-point shader as the vector
// cloud. This code is image-agnostic — it works on whatever image the user
// loads (file picker / drag-drop) or supplies as ./reference.png. No image is
// bundled or published by the project itself.

import * as THREE from "three";
import { makePointMaterial } from "./reigen-points.js";

// Load an <img> from a File (drag-drop / picker). Object URL is revoked on load.
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

// Load an <img> from a URL (./reference.png or a pasted remote URL). Requests
// CORS so the pixels can be read; the load rejects if the host denies it.
export function loadImageFromURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Sample an image into a point cloud.
 * @param {HTMLImageElement} img
 * @param {object} [opts]
 * @param {number} [opts.worldH] world height the image is fit into
 * @param {number} [opts.maxSample] max sampled pixels on the long side
 * @param {number} [opts.cx] @param {number} [opts.cy] world centre
 * @param {boolean} [opts.skipAlpha] drop near-transparent pixels (PNG cut-outs)
 * @returns {THREE.Points}
 */
export function buildPointsFromImage(img, opts = {}) {
  const worldH = opts.worldH ?? 3.6;
  const maxSample = opts.maxSample ?? 1200;
  const cx = opts.cx ?? 0;
  const cy = opts.cy ?? -0.1;
  const skipAlpha = opts.skipAlpha ?? true;

  const ar = img.width / img.height;
  // Sampling grid, capped on the long side, preserving aspect.
  let sh = Math.min(maxSample, img.height || maxSample);
  let sw = Math.round(sh * ar);
  if (sw > maxSample) { sw = maxSample; sh = Math.round(sw / ar); }

  const cv = document.createElement("canvas");
  cv.width = sw;
  cv.height = sh;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, sw, sh);
  const data = ctx.getImageData(0, 0, sw, sh).data;

  const worldW = worldH * ar;
  const left = cx - worldW / 2;
  const top = cy + worldH / 2;
  const dx = worldW / sw;
  const dy = worldH / sh;

  const pos = [];
  const col = [];
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      if (skipAlpha && data[i + 3] < 16) continue;
      pos.push(left + (x + 0.5) * dx, top - (y + 0.5) * dy, 0);
      col.push(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
  geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(col), 3));
  const size = (worldH / sh) * 1.5; // points slightly overlap → solid fill
  const points = new THREE.Points(geo, makePointMaterial(size));
  points.name = "ImagePoints";
  points.userData.count = pos.length / 3;
  return points;
}
