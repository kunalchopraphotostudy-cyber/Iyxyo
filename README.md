# PRISM ONE — headphone launch site

Vibrant, premium single-page site for a fictional headphone brand. A procedurally built
3D headphone (Three.js) lives on a fixed canvas and is choreographed by scroll: it floats in
the hero, explodes layer-by-layer in the pinned "Inside" section with projected part labels,
re-colours in the Colourways section, and peeks behind the pre-order card.

## Stack

- [Vite](https://vite.dev) · vanilla JS · CSS
- [Three.js](https://threejs.org) — procedural headphone model, RoomEnvironment lighting
- [GSAP](https://gsap.com) — colour tweens and counters

## Run

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # outputs dist/
pnpm preview
```

## Structure

- `index.html` — page sections (hero, exploded view, features, colourways, specs, pre-order)
- `src/styles.css` — design tokens, layout, CSS animations
- `src/headphone.js` — Three.js scene, model parts, explode offsets, label anchors
- `src/main.js` — scroll keyframes, label projection, reveals, colourway switching
