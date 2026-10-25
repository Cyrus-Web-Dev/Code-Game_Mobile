// Piringan konik "foil" sebagai string SVG (dipakai scripts/render-badges.ts untuk membuat PNG, dan sebagai cadangan di Foil.tsx).
const hx = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixc = (a: string, b: string, t: number) => "#" + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
const cache = new Map<string, string>();
/** Piringan konik "foil": warna tema → putih → tema → aksen (sama dengan .foil di web v2.5). */
export function foilXml(main: string, accent: string, size: number): string {
  const key = `${main}${accent}${size}`; const hit = cache.get(key); if (hit) return hit;
  const stops: [number, string][] = [[0, accent], [0.22, main], [0.34, "#ffffff"], [0.46, main], [0.7, accent], [0.84, main], [1, accent]];
  const color = (f: number) => { for (let i = 1; i < stops.length; i++) if (f <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i]; return mixc(ca, cb, (f - a) / Math.max(b - a, 1e-6)); } return accent; };
  const N = 72, c = size / 2; let d = "";
  for (let i = 0; i < N; i++) {
    const p = (deg: number) => { const a = ((deg - 90) * Math.PI) / 180; return [c + c * Math.cos(a), c + c * Math.sin(a)]; };
    const [x0, y0] = p((i / N) * 360), [x1, y1] = p(((i + 1) / N) * 360 + 0.8);
    d += `<path d="M${c} ${c}L${x0.toFixed(1)} ${y0.toFixed(1)}A${c} ${c} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z" fill="${color((i + 0.5) / N)}"/>`;
  }
  const x = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${d}</svg>`; cache.set(key, x); return x;
}

