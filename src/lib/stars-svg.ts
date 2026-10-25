// Bintang latar statis sebagai string SVG (dirender jadi PNG oleh scripts/render-badges.ts).
const rng = (seed: number) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const r = rng(42);
export const STARS_SVG = (() => {
  let c = ""; for (let i = 0; i < 40; i++) { const x = (r() * 100).toFixed(1), y = (r() * 100).toFixed(1), s = (0.5 + r() * 0.8).toFixed(2), o = (0.25 + r() * 0.5).toFixed(2); c += `<circle cx="${x}" cy="${y}" r="${s}" fill="#fff" fill-opacity="${o}"/>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${c}</svg>`;
})();
export const TWINKLE_SEED = r;
