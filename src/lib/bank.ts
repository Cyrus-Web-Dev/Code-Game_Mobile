// Bank soal OFFLINE. Dihasilkan dari supabase/seed/*.sql oleh scripts/sql_to_json.py (jangan diedit tangan).
// Format ringkas: p=prompt, c=kode, l=bahasa sorot, o=opsi, a=indeks benar, x=penjelasan, h/h2/h3=hint; akhiran "e" = Inggris.
// PERFORMA: tiap bank dimuat LAZY (require saat pertama dipakai) — membuka aplikasi tidak lagi mem-parse ±2,8 MB JSON sekaligus.
import type { PlayableLevel } from "./config";

export type RawQ = { p: string; pe?: string; c: string; l: string; o: string[]; oe?: string[]; a: number; x?: string; xe?: string; h?: string; he?: string; h2?: string; h2e?: string; h3?: string; h3e?: string };

declare const require: (id: string) => unknown;
// Metro hanya mengenali require() dengan string literal, jadi setiap bank ditulis eksplisit.
const LOADERS: Record<PlayableLevel, () => unknown> = {
  easy: () => require("../data/q/easy.json"),
  normal: () => require("../data/q/normal.json"),
  hard: () => require("../data/q/hard.json"),
  extreme: () => require("../data/q/extreme.json"),
  hell: () => require("../data/q/hell.json"),
  demi_god: () => require("../data/q/demi_god.json"),
  god: () => require("../data/q/god.json"),
  true_god: () => require("../data/q/true_god.json"),
  primordial_god: () => require("../data/q/primordial_god.json"),
  frontend: () => require("../data/q/frontend.json"),
  backend: () => require("../data/q/backend.json"),
  fullstack: () => require("../data/q/fullstack.json"),
};
const CACHE: Record<string, RawQ[]> = {};
export const bankOf = (lv: string): RawQ[] => {
  const hit = CACHE[lv]; if (hit) return hit;
  const load = (LOADERS as Record<string, (() => unknown) | undefined>)[lv]; if (!load) return [];
  const raw = load() as RawQ[] | { default: RawQ[] }, list = Array.isArray(raw) ? raw : raw.default;
  return (CACHE[lv] = list);
};
export const qKey = (lv: string, idx: number) => `${lv}:${idx}`;
export const parseKey = (k: string) => { const i = k.lastIndexOf(":"); return { level: k.slice(0, i), idx: Number(k.slice(i + 1)) }; };
export const questionByKey = (k: string): RawQ | null => { const { level, idx } = parseKey(k); return bankOf(level)[idx] ?? null; };
