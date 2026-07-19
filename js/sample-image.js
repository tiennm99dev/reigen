// Framework-agnostic image sampler: read a raster image's pixels into parallel
// arrays of point positions (in sample-grid units) and packed RGB colours.
// Used to "reproduce an image with points". Skips (near-)transparent pixels so
// PNG cut-outs keep their shape.

/**
 * @param {HTMLImageElement} img
 * @param {object} [opts]
 * @param {number} [opts.maxSample] max sampled pixels on the long side
 * @param {boolean} [opts.skipAlpha] drop near-transparent pixels
 * @returns {{xs:Int16Array, ys:Int16Array, colors:Uint32Array, sw:number, sh:number, count:number}}
 */
export function sampleImage(img, opts = {}) {
  const maxSample = opts.maxSample ?? 900;
  const skipAlpha = opts.skipAlpha ?? true;

  const ar = img.width / img.height;
  let sh = Math.min(maxSample, img.height || maxSample);
  let sw = Math.round(sh * ar);
  if (sw > maxSample) { sw = maxSample; sh = Math.round(sw / ar); }

  const cv = document.createElement("canvas");
  cv.width = sw;
  cv.height = sh;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, sw, sh);
  const data = ctx.getImageData(0, 0, sw, sh).data;

  const xs = [], ys = [], colors = [];
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y * sw + x) * 4;
      if (skipAlpha && data[i + 3] < 16) continue;
      xs.push(x);
      ys.push(y);
      colors.push((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
    }
  }
  return {
    xs: Int16Array.from(xs),
    ys: Int16Array.from(ys),
    colors: Uint32Array.from(colors),
    sw,
    sh,
    count: xs.length,
  };
}
