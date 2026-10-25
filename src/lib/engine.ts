// Mesin permainan OFFLINE — port dari route /api/game/* di versi web (skor, streak, hint, waktu, pencapaian, gelar).
// Semua fungsi memodifikasi `save` di tempat (store membungkusnya dengan salinan) dan tidak menyentuh jaringan/React,
// sehingga bisa diuji langsung di Node (lihat scripts/test-engine.ts).
import {
  LEVEL_IDS, LEVELS, SESSION_LEN, MARATHON_LEN, SPEEDRUN_LEN, SPEEDRUN_TIME, DAILY_LEN, isPlayable, isGodLevel, isDevRole,
  anyLevelConfig, type PlayableLevel, type Lang,
} from "./config";
import { bankOf, qKey, questionByKey, type RawQ } from "./bank";

export type Mode = "normal" | "maraton" | "speedrun" | "daily";
export type StatRow = { games_played: number; questions_answered: number; correct_answers: number; points: number };
export type HistoryRow = { difficulty: string; mode: string; score: number; correct: number; total: number; length: number; status: "finished" | "quit"; started_at: string; secs: number };
export type Profile = {
  username: string; avatar: string | null; favoriteLanguage: string; favoriteFramework: string;
  skillLevel: "newbie" | "intermediate" | "advanced"; role: "frontend" | "backend" | "fullstack";
  starter: string; selectedTitle: string | null; selectedMaster: string | null; createdAt: string;
};
export type Meta = { streak: number; bestStreak: number; lastPlayDate: string | null; achievements: string[]; dailyDoneDate: string | null; dailyScore: number; dailyCount: number; onboardingDone: boolean };
export type FxMode = "auto" | "full" | "lite" | "off";
export type Save = {
  v: 2;
  profile: Profile | null;
  stats: Record<string, StatRow>;
  meta: Meta;
  hints: Record<string, { remaining: number; date: string }>;
  wrong: Record<string, { difficulty: string; chosen: number | null; at: string }>;
  /** v2.4: indeks soal yang SUDAH dijawab per peran Developer Mode (agar soal baru diprioritaskan; bank 800/peran). */
  seen: Record<string, number[]>;
  history: HistoryRow[];
  settings: { haptics: boolean; sound: boolean; fx: FxMode };
};
export const emptySave = (): Save => ({
  v: 2, profile: null, stats: {},
  meta: { streak: 0, bestStreak: 0, lastPlayDate: null, achievements: [], dailyDoneDate: null, dailyScore: 0, dailyCount: 0, onboardingDone: false },
  hints: {}, wrong: {}, seen: {}, history: [], settings: { haptics: true, sound: true, fx: "auto" },
});

/** Memuat simpanan dari penyimpanan (bentuk apa pun) menjadi Save v2 yang valid. Aman terhadap data rusak/lama:
 *  - v1 → v2: soal Developer Mode diganti total di v2.4 (250 → 800 soal/peran), jadi daftar "salah" lama milik peran itu dibuang
 *    (indeksnya kini menunjuk soal lain). Statistik/poin tetap dipertahankan. */
export function migrate(raw: unknown): Save {
  const base = emptySave();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<Save> & { v?: number };
  const obj = <T extends object>(x: unknown, d: T): T => (x && typeof x === "object" && !Array.isArray(x) ? (x as T) : d);
  const out: Save = {
    v: 2,
    profile: p.profile && typeof p.profile === "object" && typeof (p.profile as Profile).username === "string" ? (p.profile as Profile) : null,
    stats: obj(p.stats, base.stats), meta: { ...base.meta, ...obj(p.meta, {}) }, hints: obj(p.hints, base.hints),
    wrong: obj(p.wrong, base.wrong), seen: obj(p.seen, base.seen), history: Array.isArray(p.history) ? p.history.slice(0, 100) : [],
    settings: { ...base.settings, ...obj(p.settings, {}) },
  };
  if (!Array.isArray(out.meta.achievements)) out.meta.achievements = [];
  if (!["auto", "full", "lite", "off"].includes(out.settings.fx)) out.settings.fx = "auto";
  if ((p.v ?? 1) < 2) {
    for (const k of Object.keys(out.wrong)) if (isDevRole(k.slice(0, Math.max(0, k.lastIndexOf(":"))))) delete out.wrong[k];
  }
  return out;
}

export type Session = {
  level: PlayableLevel; mode: Mode; length: number; score: number; correct: number; total: number; streak: number; hintsUsed: number;
  used: string[]; currentKey: string | null; hintStage: number; startedAt: number; status: "active" | "finished" | "quit";
};

/** Tanggal lokal perangkat (YYYY-MM-DD) — dipakai untuk hint harian, daily challenge, dan streak hari beruntun. */
export const todayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayNumber = (s: string) => { const [y, m, d] = s.split("-").map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); };
export const starterFor = (skill: string) => (skill === "newbie" ? "hello_world_graduate" : "junior_copas");

export type QView = { key: string; type: string; code: string; language: string; prompt: string; options: string[] };
export type Payload = {
  question: QView | null; finished?: boolean; newAchievements?: string[];
  hints: number; hintsUnlimited: boolean; answered: number; total: number; score: number; timeLimit: number; mode: Mode; level: PlayableLevel;
  correct: number; streak: number; streakMin: number; streakBonus: number; pureClear: boolean; hintsUsed: number;
};
export type Feedback = { correct: boolean; late: boolean; correctIndex: number; explanation: string; gained: number; gainedBase: number; gainedBonus: number; streak: number; streakActive: boolean; score: number; newAchievements: string[] };

const pickLang = (lang: Lang, id?: string, en?: string) => (lang === "en" ? en ?? id : id);
export const viewOf = (key: string, lang: Lang): QView | null => {
  const q = questionByKey(key); if (!q) return null;
  return { key, type: "guess", code: q.c, language: q.l, prompt: (pickLang(lang, q.p, q.pe) as string) ?? "", options: (lang === "en" ? q.oe ?? q.o : q.o) };
};
const timeLimitOf = (s: Session) => (s.mode === "speedrun" ? SPEEDRUN_TIME : anyLevelConfig(s.level).timeLimit);

function hintsLeft(save: Save, s: Session): number {
  const cfg = anyLevelConfig(s.level);
  if (cfg.hintsUnlimited) return -1;
  if (s.mode === "speedrun") return 0;
  const q = save.hints[s.level];
  return !q || q.date < todayStr() ? cfg.hints || LEVELS[s.level as keyof typeof LEVELS].hints : q.remaining;
}

/** Sisa hint harian untuk tingkat biasa (reset tiap hari). -1 = tanpa batas (God/Developer Mode). */
export function hintsFor(save: Save, level: string): number {
  const cfg = anyLevelConfig(level as PlayableLevel);
  if (cfg.hintsUnlimited) return -1;
  const q = save.hints[level];
  return !q || q.date < todayStr() ? cfg.hints : q.remaining;
}

export function payload(save: Save, s: Session, lang: Lang, extra: Partial<Payload> = {}): Payload {
  const cfg = anyLevelConfig(s.level);
  return {
    question: s.currentKey ? viewOf(s.currentKey, lang) : null,
    hints: hintsLeft(save, s), hintsUnlimited: cfg.hintsUnlimited, answered: s.total, total: s.length, score: s.score,
    timeLimit: timeLimitOf(s), mode: s.mode, level: s.level, correct: s.correct, streak: s.streak,
    streakMin: cfg.streak?.min ?? 0, streakBonus: cfg.streak?.bonus ?? 0, pureClear: s.hintsUsed === 0, hintsUsed: s.hintsUsed, ...extra,
  };
}

/** Soal acak yang belum dipakai di sesi ini (setara serve_question). null = bank habis. */
export function pickQuestion(level: string, used: string[], rng: () => number = Math.random, answered?: number[]): string | null {
  const n = bankOf(level).length, inSession = new Set(used), free: number[] = [];
  for (let i = 0; i < n; i++) if (!inSession.has(qKey(level, i))) free.push(i);
  if (!free.length) return null;
  // Developer Mode (v2.4): utamakan soal yang BELUM pernah dijawab pemain; baru ulangi bila semuanya sudah pernah dijawab.
  let pool = free;
  if (answered && answered.length) { const done = new Set(answered), fresh = free.filter((i) => !done.has(i)); if (fresh.length) pool = fresh; }
  return qKey(level, pool[Math.floor(rng() * pool.length)]);
}

export type StartResult = { error: string } | { session: Session };
export function startSession(save: Save, level: string, modeRaw: string, now = new Date()): StartResult {
  const mode = (["normal", "maraton", "speedrun", "daily"].includes(modeRaw) ? modeRaw : "normal") as Mode;
  let length = SESSION_LEN;
  if (mode === "maraton") length = MARATHON_LEN; else if (mode === "speedrun") length = SPEEDRUN_LEN; else if (mode === "daily") length = DAILY_LEN;
  let diff = level;
  if (mode === "daily") {
    const today = todayStr(now);
    if (save.meta.dailyDoneDate === today) return { error: "DAILY_DONE" };
    diff = LEVEL_IDS[dayNumber(today) % LEVEL_IDS.length];
  }
  if (!isPlayable(diff)) return { error: "INVALID_LEVEL" };
  if ((isGodLevel(diff) || isDevRole(diff)) && mode !== "normal" && mode !== "maraton") return { error: "INVALID_LEVEL" };
  return { session: { level: diff, mode, length, score: 0, correct: 0, total: 0, streak: 0, hintsUsed: 0, used: [], currentKey: null, hintStage: 0, startedAt: now.getTime(), status: "active" } };
}

/** Menyiapkan soal berikutnya; bila sesi sudah selesai (jumlah soal tercapai / bank habis) kembalikan finished. */
export function serveNext(save: Save, s: Session, lang: Lang, rng: () => number = Math.random, now = new Date()): Payload {
  if (s.status !== "active") return payload(save, s, lang, { question: null, finished: true });
  if (s.total >= s.length) return finish(save, s, lang, now);
  const key = pickQuestion(s.level, s.used, rng, isDevRole(s.level) ? save.seen[s.level] : undefined);
  if (!key) return finish(save, s, lang, now);
  s.used.push(key); s.currentKey = key; s.hintStage = 0;
  return payload(save, s, lang);
}

const bump = (save: Save, level: string, d: { games?: number; answered?: number; correct?: number; points?: number }) => {
  const r = (save.stats[level] ??= { games_played: 0, questions_answered: 0, correct_answers: 0, points: 0 });
  r.games_played += d.games ?? 0; r.questions_answered += d.answered ?? 0; r.correct_answers += d.correct ?? 0; r.points += d.points ?? 0;
  return r;
};
export const totalPoints = (save: Save) => Object.values(save.stats).reduce((a, s) => a + s.points, 0);
export const statList = (save: Save) => Object.entries(save.stats).map(([difficulty, s]) => ({ difficulty, ...s }));

function grant(save: Save, ids: string[]): string[] {
  const fresh = ids.filter((id) => !save.meta.achievements.includes(id));
  save.meta.achievements.push(...fresh);
  return fresh;
}
function updateStreak(save: Save, now: Date): string[] {
  const today = todayStr(now), m = save.meta;
  if (m.lastPlayDate !== today) m.streak = m.lastPlayDate && dayNumber(today) - dayNumber(m.lastPlayDate) === 1 ? m.streak + 1 : 1;
  m.bestStreak = Math.max(m.bestStreak, m.streak); m.lastPlayDate = today;
  const ids: string[] = [];
  if (m.streak >= 3) ids.push("streak_3"); if (m.streak >= 7) ids.push("streak_7"); if (m.streak >= 30) ids.push("streak_30");
  return grant(save, ids);
}

/** Menutup sesi (selesai/keluar): hitung game, streak hari, riwayat, daily, dan pencapaian sesi. Aman dipanggil dua kali. */
export function closeSession(save: Save, s: Session, status: "finished" | "quit", now = new Date()): string[] {
  if (s.status !== "active") return [];
  s.status = status;
  bump(save, s.level, { games: 1 });
  const out: string[] = [];
  if (status === "finished") {
    out.push(...updateStreak(save, now));
    const ach: string[] = [];
    if (s.length === 10 && s.correct === 10) ach.push("perfect_10");
    if (s.mode === "maraton") ach.push("marathon_finisher");
    if (s.mode === "speedrun") ach.push("speed_demon");
    if (s.mode === "daily") { save.meta.dailyDoneDate = todayStr(now); save.meta.dailyScore = s.score; save.meta.dailyCount += 1; if (save.meta.dailyCount >= 5) ach.push("daily_warrior"); }
    out.push(...grant(save, ach));
  }
  save.history.unshift({ difficulty: s.level, mode: s.mode, score: s.score, correct: s.correct, total: s.total, length: s.length, status, started_at: new Date(s.startedAt).toISOString(), secs: Math.max(0, Math.round((now.getTime() - s.startedAt) / 1000)) });
  save.history.length = Math.min(save.history.length, 100);
  return out;
}
export function finish(save: Save, s: Session, lang: Lang, now = new Date()): Payload {
  const ach = closeSession(save, s, "finished", now);
  return payload(save, s, lang, { question: null, finished: true, newAchievements: ach });
}
export const quit = (save: Save, s: Session, now = new Date()) => { closeSession(save, s, "quit", now); return s.score; };

/** Menjawab soal aktif. `choice` null = waktu habis. `elapsedSec` (dari UI) dipakai menentukan "terlambat". */
export function answer(save: Save, s: Session, choice: number | null, lang: Lang, elapsedSec = 0): Feedback {
  const q = s.currentKey ? questionByKey(s.currentKey) : null;
  if (!q || !s.currentKey) throw new Error("NO_QUESTION");
  const cfg = anyLevelConfig(s.level), limit = timeLimitOf(s);
  const late = elapsedSec > limit + 1;
  const isRight = typeof choice === "number" && choice === q.a;
  const ok = isRight && !late;
  const newStreak = ok ? s.streak + 1 : 0;
  const streakActive = !!cfg.streak && newStreak >= cfg.streak.min;
  const base = ok ? cfg.points : 0, bonus = ok && streakActive ? cfg.streak!.bonus : 0, pts = base + bonus;
  s.score += pts; s.correct += ok ? 1 : 0; s.total += 1; s.streak = newStreak;
  const stats = bump(save, s.level, { answered: 1, correct: ok ? 1 : 0, points: pts });
  const key = s.currentKey; s.currentKey = null;
  if (isDevRole(s.level)) { const idx = Number(key.slice(key.lastIndexOf(":") + 1)), arr = (save.seen[s.level] ??= []); if (Number.isInteger(idx) && !arr.includes(idx)) arr.push(idx); }
  if (ok || isRight) delete save.wrong[key];
  else save.wrong[key] = { difficulty: s.level, chosen: choice, at: new Date().toISOString() };
  const cand: string[] = [];
  if (ok) {
    if (stats.correct_answers <= 1) cand.push("first_blood");
    if (s.level === "hell" && stats.questions_answered >= 10) cand.push("hell_survivor");
    if (LEVEL_IDS.every((l) => (save.stats[l]?.correct_answers ?? 0) > 0)) cand.push("polyglot");
  }
  const newAch = grant(save, cand);
  return {
    correct: ok, late, correctIndex: q.a, explanation: (pickLang(lang, q.x, q.xe) as string) ?? "", gained: pts, gainedBase: base, gainedBonus: bonus,
    streak: newStreak, streakActive, score: s.score, newAchievements: newAch,
  };
}

export type HintResult = { error: string } | { hint: string; hints: number; stage?: number; hintsUsedTotal?: number };
export function useHint(save: Save, s: Session, lang: Lang): HintResult {
  const q = s.currentKey ? questionByKey(s.currentKey) : null;
  if (!q) return { error: "QUESTION_INACTIVE" };
  const en = lang === "en", h = (a?: string, b?: string) => (en ? b ?? a : a);
  if (isDevRole(s.level)) return { hint: h(q.h, q.he) ?? "-", hints: -1 };
  if (isGodLevel(s.level)) {
    const stage = Math.min(s.hintStage + 1, 3);
    const text = stage === 1 ? h(q.h, q.he) : stage === 2 ? h(q.h2, q.h2e) ?? h(q.h, q.he) : h(q.h3, q.h3e) ?? h(q.h, q.he);
    if (stage > s.hintStage) s.hintsUsed += 1;
    s.hintStage = stage;
    return { hint: text ?? "-", hints: -1, stage, hintsUsedTotal: s.hintsUsed };
  }
  const remaining = hintsLeft(save, s);
  if (remaining <= 0) return { error: "NO_HINTS" };
  save.hints[s.level] = { remaining: remaining - 1, date: todayStr() };
  s.hintsUsed += 1;
  return { hint: h(q.h, q.he) ?? "-", hints: remaining - 1 };
}
export type { RawQ };
