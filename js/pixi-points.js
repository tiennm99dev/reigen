// Build a PixiJS v8 ParticleContainer point cloud from sampled image pixels.
// Each pixel becomes one round, per-point-tinted particle. Positions/scales are
// static (framing is done by transforming the parent world container), so the
// container uses the fastest static-particle path.

import { ParticleContainer, Particle, Graphics } from "pixi.js";

// A soft round white dot texture, tinted per particle. `r` is its pixel radius.
export function makeDotTexture(renderer, r = 8) {
  const g = new Graphics().circle(0, 0, r).fill(0xffffff);
  const tex = renderer.generateTexture(g);
  g.destroy();
  return tex;
}

/**
 * @param {import("pixi.js").Renderer} renderer
 * @param {{xs:Int16Array, ys:Int16Array, colors:Uint32Array, sw:number, sh:number}} sample
 * @param {object} [opts] { cell: world units per sample cell, coverage }
 * @returns {ParticleContainer} with .sw/.sh/.cell/.count attached
 */
export function buildParticleCloud(renderer, sample, opts = {}) {
  const cell = opts.cell ?? 1;
  const coverage = opts.coverage ?? 1.4;
  const dotR = 8;
  const dotTex = makeDotTexture(renderer, dotR);
  // dot world size = (2*dotR) * scale; we want it ~= cell*coverage.
  const scale = (cell * coverage) / (2 * dotR);

  const pc = new ParticleContainer({
    dynamicProperties: { position: false, scale: false, rotation: false, color: false },
  });

  const { xs, ys, colors } = sample;
  for (let i = 0; i < xs.length; i++) {
    pc.addParticle(new Particle({
      texture: dotTex,
      x: xs[i] * cell,
      y: ys[i] * cell,
      scaleX: scale,
      scaleY: scale,
      tint: colors[i],
      anchorX: 0.5,
      anchorY: 0.5,
    }));
  }

  pc.sw = sample.sw;
  pc.sh = sample.sh;
  pc.cell = cell;
  pc.count = xs.length;
  pc._dotTex = dotTex; // keep a handle so we can free it on destroy
  return pc;
}
