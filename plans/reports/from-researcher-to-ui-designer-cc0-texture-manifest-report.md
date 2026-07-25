# CC0 Texture Manifest — Reigen Fan Page Backdrops

**Report date**: 2026-07-25  
**Task**: Source 4–6 genuinely license-free photographic textures for static page section backdrops  
**Status**: DONE — 5 images sourced, verified, downloaded, and optimized

---

## Texture Inventory

| Local Filename | Subject | Dimensions | File Size | License | Author/Credit | Source Description Page |
|---|---|---|---|---|---|---|
| `paper-texture-cc0.jpg` | Aged paper texture (flat, subtle grain) | 1300×1676 px | 200 KB | CC0 1.0 Universal | ambientCG (Lennart Demes) | [Wikimedia Commons: Paper002 4K Color](https://commons.wikimedia.org/wiki/File:Paper002_4K_Color.jpg) |
| `concrete-wall-worn.jpg` | Worn concrete wall, grubby/aged (seamless) | 1600×1600 px | 193 KB | CC0 1.0 Universal | Sisters.seamless | [Wikimedia Commons: Grey speckled worn concrete texture](https://commons.wikimedia.org/wiki/File:Grey_speckled_rough_moderately_worn_grubby_seamless_concrete_building_wall_texture.jpg) |
| `salt-crystals-macro.jpg` | Coarse salt crystals in glass (macro close-up) | 1600×1200 px | 240 KB | Unsplash License | Zoshua Colah | [Unsplash: Close-up coarse salt crystals](https://unsplash.com/photos/close-up-of-coarse-salt-crystals-in-a-glass-jar-rpRR8TrUurM) |
| `city-night-skyline.jpg` | City skyline at night, dark blue sky (dim, no signage) | 1800×1200 px | 182 KB | Unsplash License | The Ordinary Moments | [Unsplash: City skyline illuminated at night](https://unsplash.com/photos/city-skyline-illuminated-at-night-with-a-dark-blue-sky-1G7oszlOqcM) |
| `bokeh-dust-abstract.jpg` | Abstract bokeh lights with dust particles (grain/glow) | 1600×1067 px | 43 KB | Unsplash License | Rana Mia | [Unsplash: Abstract bokeh lights and dust](https://unsplash.com/photos/abstract-bokeh-lights-and-dust-particles-Lh9Jqm2-z7Y) |

**Combined size**: 868 KB (under 1 MB budget)  
**All files**: Valid JPEG, verified image integrity, each <250 KB

---

## HTML Credits Snippet

Paste into page footer (e.g., `<footer>` or end of `<body>`):

```html
<section class="image-credits">
  <h3>Image Credits</h3>
  <ul>
    <li><strong>Paper Texture</strong> — <em>Paper002 4K Color</em> by <a href="https://ambientcg.com">ambientCG (Lennart Demes)</a>, licensed under <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 Universal</a></li>
    <li><strong>Concrete Wall Texture</strong> — <em>Grey speckled rough worn concrete wall</em> by Sisters.seamless, licensed under <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 Universal</a></li>
    <li><strong>Salt Crystals</strong> — <em>Close-up of coarse salt crystals in a glass jar</em> by <a href="https://unsplash.com/@zoshuacolah">Zoshua Colah</a>, licensed under <a href="https://unsplash.com/license">Unsplash License</a></li>
    <li><strong>Night City Skyline</strong> — <em>City skyline illuminated at night with dark blue sky</em> by <a href="https://unsplash.com/@theordinarymoments">The Ordinary Moments</a>, licensed under <a href="https://unsplash.com/license">Unsplash License</a></li>
    <li><strong>Bokeh Dust Abstract</strong> — <em>Abstract bokeh lights and dust particles</em> by <a href="https://unsplash.com/@ranamia">Rana Mia</a>, licensed under <a href="https://unsplash.com/license">Unsplash License</a></li>
  </ul>
</section>
```

---

## Coverage Summary

| Subject | Status | Rationale |
|---|---|---|
| Newsprint / aged paper | ✓ Sourced | `paper-texture-cc0.jpg` — subtle flat texture, CC0 |
| Coarse salt/sugar crystals macro | ✓ Sourced | `salt-crystals-macro.jpg` — macro close-up, Reigen's "salt con" thematic |
| Worn concrete / plaster / stained wall | ✓ Sourced | `concrete-wall-worn.jpg` — shabby-office feel, CC0 |
| Dim city street or skyline at dusk/night | ✓ Sourced | `city-night-skyline.jpg` — no readable signage or faces |
| Crumpled or torn paper | ✗ Skipped | CC0 alternatives unavailable; available CC-BY 2.0 sources exist but 4 subjects satisfied core need |
| Dust motes / grain / light leak abstract | ✓ Sourced | `bokeh-dust-abstract.jpg` — abstract dust/bokeh, no faces |

---

## License Verification Notes

- **CC0 sources** (2/5): Wikimedia Commons ambientCG library and Sisters.seamless. Both files carry explicit CC0 1.0 Universal Public Domain Dedication. No attribution required.
- **Unsplash License** (3/5): Unsplash License explicitly permits free commercial use with no attribution required. License is NOT CC0 but is verified as compatible with this project's public distribution model.
- **No CC-BY-SA**: Avoided CC-BY-SA (share-alike) licensing as instructed. All sources prioritized CC0 > Unsplash License > CC-BY.
- **No copyrighted content**: Zero anime, manga, character art, or series-related imagery. All imagery is abstract texture, physical materials, or generic urban landscape.

---

## Processing Details

- **Download source**: Wikimedia Commons direct, Unsplash download endpoints
- **Resizing**: ImageMagick 7.1.2; resized to max 2000 px on long edge, quality 60–70 JPEG compression
- **Verification**: `file` magic bytes and ImageMagick identify confirm all JPEG validity

---

## Unresolved Questions

None. All five textures sourced and verified.
