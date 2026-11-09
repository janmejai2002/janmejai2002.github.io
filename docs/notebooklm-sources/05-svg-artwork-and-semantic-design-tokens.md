# Geometric SVG Artwork & Semantic Design Tokens

## 1. The wAIbi-sabi Visual Philosophy
Every article hero plate is a minimalist, technical, geometric artwork inspired by traditional Japanese printmaking (wAIbi-sabi) and engineering schematics.
- Clean hairline grids, concentric radar rings, data matrices, and waveform pulses.
- The Wabi-Sabi Imperfection: Every plate carries one deliberate imperfection — a severed arc, an offset column, an interrupted rule, or an asymmetrical focal point representing real-world entropy.

## 2. Invariant SVG Technical Specifications
- ViewBox: MUST be exactly `viewBox="0 0 1600 900" width="1600" height="900" role="img"`.
- Valid XML: Must close all tags (`</circle>`, `</rect>`, `</path>`, `</svg>`).
- No Empty Lines Inside SVG: A blank line inside raw HTML terminates markdown parsing in Astro and will break the build.

## 3. Mandatory Semantic Color Tokens (ZERO Hex Codes)
The Astro build pipeline uses Sharp to compile each SVG into dual Light and Dark WebP assets.
The source SVG MUST use semantic placeholder tokens, NEVER hardcoded hex colors (#ffffff, #000000, etc.). Any hardcoded hex color fails `check-build.mjs`.

### The Global Tokens
- `{{paper}}`: Canvas background (Light: warm off-white #f7f5f0, Dark: deep ink-black #131415).
- `{{ink}}`: Primary drawing strokes, dark nodes, and heavy text (Light: near black #1b1c1d, Dark: light cream #e5e3dc).
- `{{border}}`: Subtle background grid lines, hairline frames, and secondary ticks.

### The Five Track Accents
1. Technical: `{{mizu}}` (#457b9d / crisp water blue)
2. Business: `{{ochre}}` (#c97a3e / golden earth ochre)
3. Basics: `{{plum}}` (#8b4f7a / deep contemplative plum)
4. Case Studies: `{{moss}}` (#52694a / weathered forest moss green)
5. Talks: `{{hanko}}` (#b83b26 / traditional cinnabar seal stamp red)

## 4. Reusable SVG Starter Template
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" role="img">
  <title>Article Visual Synthesis</title>
  <desc>Minimalist geometric diagram illustrating the architectural breakdown.</desc>
  <defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
    </filter>
  </defs>
  <!-- Canvas Background -->
  <rect width="1600" height="900" fill="{{paper}}"/>
  <!-- Hairline Grid Frame -->
  <path d="M80,80h1440v740h-1440zM80,450h1440M800,80v740" fill="none" stroke="{{border}}" stroke-width="1"/>
  <!-- Primary Geometric Elements -->
  <circle cx="800" cy="450" r="160" fill="none" stroke="{{ink}}" stroke-width="2"/>
  <circle cx="800" cy="450" r="60" fill="none" stroke="{{ink}}" stroke-width="1.5"/>
  <!-- Track Accent Feature with Deliberate Imperfection -->
  <circle cx="800" cy="450" r="240" fill="none" stroke="{{moss}}" stroke-width="2.5" stroke-dasharray="8,12"/>
  <rect x="790" y="320" width="20" height="260" fill="{{moss}}" fill-opacity="0.15" stroke="{{moss}}" stroke-width="2"/>
  <!-- Wabi-sabi Grain Texture -->
  <rect width="1600" height="900" filter="url(#grain)" opacity="0.05"/>
</svg>
```
