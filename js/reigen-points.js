// Renders Reigen "using points": every region is sampled into many coloured
// points (uniform interior fill + dense dark boundary), drawn as one THREE.Points
// cloud. A small custom shader keeps the points ROUND and sized in world units,
// so the cloud stays solid and crisp at any zoom or export resolution.

import * as THREE from "three";
import { getRegions } from "./reigen-regions.js";

function rgb(hex) {
  return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}

// Uniformly sample `n` points inside a triangle (a,b,c are [x,y]).
// `shade(y)` returns a per-point brightness multiplier for form shading.
function sampleTri(a, b, c, n, out, r, g, b2, z, shade) {
  for (let i = 0; i < n; i++) {
    let u = Math.random();
    let v = Math.random();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const x = a[0] + u * (b[0] - a[0]) + v * (c[0] - a[0]);
    const y = a[1] + u * (b[1] - a[1]) + v * (c[1] - a[1]);
    const m = shade ? shade(y) : 1;
    out.pos.push(x, y, z);
    out.col.push(Math.min(1, r * m), Math.min(1, g * m), Math.min(1, b2 * m));
  }
}

/**
 * Sample all regions into interleaved position/colour arrays.
 * @param {object} [opts]
 * @param {number} [opts.fillDensity] points per world unit^2 of fill
 * @param {number} [opts.edgeDensity] points per world unit of outline length
 * @returns {{positions:Float32Array, colors:Float32Array, count:number}}
 */
export function samplePoints(opts = {}) {
  const fillDensity = opts.fillDensity ?? 60000;
  const edgeDensity = opts.edgeDensity ?? 2600;
  const out = { pos: [], col: [] };
  const va = [0, 0], vb = [0, 0], vc = [0, 0];

  for (const reg of getRegions()) {
    const [r, g, b] = rgb(reg.color);
    const geo = new THREE.ShapeGeometry(reg.shape, 40);
    const p = geo.attributes.position;
    const idx = geo.index.array;
    const tf = (i, v) => {
      v[0] = reg.x + reg.sx * p.getX(i);
      v[1] = reg.y + p.getY(i);
    };

    // Vertical gradient range (for lit-from-above form shading).
    let gy0 = 0, gy1 = 1, glo = 1, ghi = 1;
    if (reg.grad) {
      geo.computeBoundingBox();
      gy0 = reg.y + geo.boundingBox.min.y;
      gy1 = reg.y + geo.boundingBox.max.y;
      glo = reg.grad.lo;
      ghi = reg.grad.hi;
    }
    const shade = (y) => {
      if (!reg.grad || gy1 <= gy0) return 1;
      const t = Math.min(1, Math.max(0, (y - gy0) / (gy1 - gy0)));
      return glo + (ghi - glo) * t;
    };

    // Interior fill, one triangle at a time so density is uniform.
    for (let t = 0; t < idx.length; t += 3) {
      tf(idx[t], va); tf(idx[t + 1], vb); tf(idx[t + 2], vc);
      const area = Math.abs(
        (vb[0] - va[0]) * (vc[1] - va[1]) - (vc[0] - va[0]) * (vb[1] - va[1])
      ) * 0.5;
      const n = Math.round(area * fillDensity);
      if (n > 0) sampleTri(va, vb, vc, n, out, r, g, b, reg.z, shade);
    }
    geo.dispose();

    // Dark outline: dense points along the boundary, slightly in front.
    if (reg.outline) {
      const [orr, org, orb] = rgb(0x241c15);
      const pts = reg.shape.getPoints(96).map((v) => [reg.x + reg.sx * v.x, reg.y + v.y]);
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const bb = pts[(i + 1) % pts.length];
        const len = Math.hypot(bb[0] - a[0], bb[1] - a[1]);
        const m = Math.max(1, Math.round(len * edgeDensity));
        for (let k = 0; k < m; k++) {
          const s = k / m;
          out.pos.push(a[0] + s * (bb[0] - a[0]), a[1] + s * (bb[1] - a[1]), reg.z + 0.06);
          out.col.push(orr, org, orb);
        }
      }
    }
  }

  return {
    positions: new Float32Array(out.pos),
    colors: new Float32Array(out.col),
    count: out.pos.length / 3,
  };
}

// Round-point shader: gl_PointSize is set from a world size × pixels-per-unit
// uniform, so points scale with zoom and render resolution (solid everywhere).
// RawShaderMaterial so we declare built-ins ourselves (no injected color/vColor
// conflicts).
function pointMaterial(worldSize) {
  return new THREE.RawShaderMaterial({
    uniforms: {
      uPixPerUnit: { value: 300 },
      uSize: { value: worldSize },
    },
    vertexShader: /* glsl */ `
      precision highp float;
      uniform mat4 projectionMatrix;
      uniform mat4 modelViewMatrix;
      attribute vec3 position;
      attribute vec3 color;
      uniform float uPixPerUnit;
      uniform float uSize;
      varying vec3 vColor;
      void main() {
        vColor = color;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(1.0, uSize * uPixPerUnit);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec3 vColor;
      void main() {
        vec2 d = gl_PointCoord - vec2(0.5);
        if (dot(d, d) > 0.25) discard; // round mask
        gl_FragColor = vec4(vColor, 1.0);
      }
    `,
  });
}

/**
 * Build the Reigen point cloud.
 * @param {object} [opts] forwarded to samplePoints, plus {size} world point size
 * @returns {THREE.Points}
 */
export function buildReigenPoints(opts = {}) {
  const { positions, colors, count } = samplePoints(opts);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(geo, pointMaterial(opts.size ?? 0.01));
  points.name = "ReigenPoints";
  points.userData.count = count;
  return points;
}

// Update the point-size uniform for the given camera + viewport height (px).
export function updatePointSize(points, camera, viewportHeightPx) {
  const worldH = (camera.top - camera.bottom) / camera.zoom;
  points.material.uniforms.uPixPerUnit.value = viewportHeightPx / worldH;
}
