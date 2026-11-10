# Canon: Relevant Open Source Architecture & GitHub Technical Projects

This canon curates production-tested open source repositories and architectural patterns directly applicable to accelerating the wAIbi-sabi Kintsugi Terrarium, WebGL shaders, agent utility decision models, and diegetic editorial systems.

---

## 1. Geometric Fracture & Mesh Topography

### `d3/d3-delaunay` (Mikola Lysenko, Mike Bostock)
- **Repository**: `https://github.com/d3/d3-delaunay`
- **Core Technology**: High-performance 2D Delaunay triangulation (via `delaunator`) and Voronoi tessellation in pure JavaScript/TypeScript.
- **Direct Application to Kintsugi Engine**:
  - Replaces or augments custom stochastic Voronoi heuristics with mathematical Delaunay relaxation (Lloyd's algorithm).
  - Enables true dual-graph traversal: nodes represent ceramic shard polygons, edges represent fracture seams with analytical distance fields.
  - Allows variable density seeds clustered at the impact epicenter $\vec{p}_0 = (x_0, y_0)$ to generate realistic microscopic crazing lines (*kannyu*) near the strike point while maintaining broad tectonic fractures further out.

### `mapbox/delaunator` (Vladimir Agafonkin)
- **Repository**: `https://github.com/mapbox/delaunator`
- **Core Technology**: Incredibly fast (100k points in ~50ms), robust 2D Delaunay triangulation using fast sweep algorithms.
- **Direct Application**:
  - Ultra-lightweight (under 3KB gzipped), zero-dependency library ideal for mobile WebGL and SVG fracture path computation on low-power devices.

---

## 2. Ceramic Glaze & Gold Leaf WebGL Shaders

### `mrdoob/three.js` & Ceramic PBR Materials
- **Repository**: `https://github.com/mrdoob/three.js`
- **Core Technology**: WebGL/WebGPU physically based rendering engine.
- **Direct Application to Ceramic Plate**:
  - **Subsurface Scattering (SSS)**: Fine porcelain and earthenware exhibit translucent internal scattering of incident light.
  - **Clearcoat & Roughness Maps**: The plate requires a dual-layer specular model—a rough, tactile clay substrate under an ultra-smooth, vitreous glass clearcoat.
  - **Anisotropic Metallic Gold Leaf (*Maki-e*)**: Gold powder particles (*kinpun*) have microscopic planar facets that reflect light with anisotropic sheen rather than isotropic specular highlights. Integrating custom GLSL shaders with an anisotropic microfacet distribution ($GGX$) gives the painted veins genuine 24-karat luster under mouse movement.

### `daisy1754/Kintsugi-Shader` & Shadertoy Procedural Shaders
- **Core Technology**: Signed Distance Field (SDF) fracture carving with dynamic lacquer fill uniforms (`uGoldProgress`, `uLacquerCure`).
- **Direct Application**:
  - Distance field modeling $d(\vec{p}) = \min_{e \in E} \text{dist}(\vec{p}, e)$ rendered directly in the fragment shader.
  - Enables smooth anti-aliased gold vein boundaries without requiring high-polygon vertex meshes.

---

## 3. Autonomous Agent Action Selection & Utility AI

### `Dave Mark / Behavioral Mathematics for Game AI` (Utility AI Paradigm)
- **Core Technology**: Multi-Attribute Utility Theory (MAUT) with response curves (linear, quadratic, logistic, exponential).
- **Direct Application to `crew-brain.ts`**:
  - Replaces binary if/else rules with continuous utility evaluations $U(a) = \sum w_i \cdot f_i(x_i)$.
  - **Inertia / Commitment Dampeners**: Prevents action thrashing (rapidly switching between idle, gaze, and speech) by adding a hysteresis penalty to changing current behavior.
  - **Dignified Silence Curve**: Utility of remaining silent scales logarithmically with reader dwell time, ensuring that the longer a human reads an article calmly, the less frequently the mascots speak.

### `behavior3/behavior3js` (Behavior Trees for Autonomous Synthetic Agents)
- **Repository**: `https://github.com/behavior3/behavior3js`
- **Core Technology**: Lightweight, modular Behavior Tree runtime in JavaScript.
- **Direct Application**:
  - Composes complex multi-actor choreographies (e.g., Oops breaks the plate -> Kiki startles -> Tsugi retrieves lacquer brush -> Fude logs incident) into declarative sequence and fallback nodes.

---

## 4. Diegetic Editorial Architecture & Marginalia

### `hypothesis/client` (Open Source Web Annotation Engine)
- **Repository**: `https://github.com/hypothesis/client`
- **Core Technology**: Anchor-based text annotation, range position tracking, and non-intrusive marginal commentary.
- **Direct Application to `wAIbi-sabi`**:
  - Text anchoring algorithms (`DOM TextQuoteAnchor`) that attach mascot notes and Kintsugi seals to exact text passages even across responsive typography, screen sizes, and font zooms.
  - Side-panel and margin-docking mechanisms that guarantee zero layout shift on the primary editorial prose.

### `edwardtufte/tufte-css` & Sidenote Architecture
- **Repository**: `https://github.com/edwardtufte/tufte-css`
- **Core Technology**: Pure CSS sidenotes, margin figures, and epigraph typography.
- **Direct Application**:
  - Responsive column geometry: on wide desktop screens (>=1200px), a generous 320px right margin hosts Fude's scribe notes, Kiki's climbing path, and interactive postmortem code snippets.
  - On tablet and mobile (<1024px), marginalia seamlessly collapse into toggleable inline badges or bottom drawer cards without breaking reading momentum.
