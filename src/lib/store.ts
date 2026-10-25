// Penyimpanan LOKAL (AsyncStorage) — pengganti Supabase/API di versi web. Tidak ada jaringan sama sekali.
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  emptySave, migrate, startSession, serveNext, answer as eAnswer, useHint as eHint, quit as eQuit, starterFor, statList, totalPoints,
  type Save, type Session, type Payload, type Feedback, type HintResult, type Profile, type FxMode,
} from "./engine";
import { currentTitle, earnedDevBadges, activeMaster, ownedTitles, STARTERS, isMasterSel, type Lang } from "./config";
import { useLang } from "./i18n";

const KEY = "kt_save_v1";
let timer: ReturnType<typeof setTimeout> | null = null;
// Simpan ditunda 900 ms (digabung bila beruntun) agar tidak men-serialisasi seluruh simpanan di tiap jawaban; flushSave() dipanggil saat app ke latar belakang.
const persist = (s: Save) => { if (timer) clearTimeout(timer); timer = setTimeout(() => { timer = null; AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {}); }, 900); };
export const flushSave = () => { const s = useStore.getState().save; if (timer) clearTimeout(timer); return AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {}); };
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
/** Salinan Save untuk diubah: semua dicopy kecuali foto profil (string base64 hingga ~260 KB) yang cukup disalin referensinya. */
const cloneSave = (s: Save): Save => { const { profile, ...rest } = s; return { ...clone(rest), profile: profile ? { ...profile } : null } as Save; };
const lang = (): Lang => useLang.getState().lang;

type St = {
  ready: boolean; save: Save; session: Session | null;
  init: () => Promise<void>;
  /** Jalankan perubahan pada salinan save, lalu simpan. */
  mutate: <T>(fn: (s: Save) => T) => T;
  createProfile: (p: Omit<Profile, "starter" | "selectedTitle" | "selectedMaster" | "createdAt" | "avatar"> & { avatar?: string | null }) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setTitle: (key: string | null) => boolean;
  setMaster: (key: string | null) => boolean;
  setOnboardingDone: () => void;
  setSetting: (k: "haptics" | "sound", v: boolean) => void;
  setFx: (m: FxMode) => void;
  resetAll: () => Promise<void>;
  // ── permainan ──
  startGame: (level: string, mode: string) => { error: string } | { payload: Payload };
  nextQuestion: () => Payload;
  answer: (choice: number | null, elapsedSec: number) => Feedback;
  hint: () => HintResult;
  quitGame: () => number;
};

export const useStore = create<St>((set, get) => ({
  ready: false, save: emptySave(), session: null,
  async init() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ save: migrate(JSON.parse(raw)) });
      const l = await AsyncStorage.getItem("kt_lang");
      if (l === "id" || l === "en") useLang.setState({ lang: l });
      else { let loc = "id"; try { loc = Intl.DateTimeFormat().resolvedOptions().locale || "id"; } catch {} useLang.setState({ lang: loc.toLowerCase().startsWith("id") ? "id" : "en" }); }
    } catch { /* simpanan rusak: mulai baru */ }
    set({ ready: true });
  },
  mutate(fn) { const draft = cloneSave(get().save); const r = fn(draft); set({ save: draft }); persist(draft); return r; },
  createProfile(p) {
    get().mutate((s) => { s.profile = { avatar: null, ...p, starter: starterFor(p.skillLevel), selectedTitle: null, selectedMaster: null, createdAt: new Date().toISOString() }; });
  },
  updateProfile(patch) {
    get().mutate((s) => { if (s.profile) { s.profile = { ...s.profile, ...patch }; if (patch.skillLevel) s.profile.starter = starterFor(patch.skillLevel); } });
  },
  setTitle(key) {
    return get().mutate((s) => {
      if (key === null) { if (s.profile) s.profile.selectedTitle = null; return true; }
      if (key !== "starter" && !ownedTitles(statList(s)).some((o) => o.key === key)) return false;
      if (s.profile) s.profile.selectedTitle = key; return true;
    });
  },
  setMaster(key) {
    return get().mutate((s) => {
      if (key !== null && !isMasterSel(key)) return false;
      if (key && key !== "none" && !earnedDevBadges(statList(s)).some((b) => b.role === key)) return false;
      if (s.profile) s.profile.selectedMaster = key; return true;
    });
  },
  setOnboardingDone() { get().mutate((s) => { s.meta.onboardingDone = true; }); },
  setSetting(k, v) { get().mutate((s) => { s.settings[k] = v; }); },
  setFx(m) { get().mutate((s) => { s.settings.fx = m; }); },
  async resetAll() { if (timer) clearTimeout(timer); await AsyncStorage.multiRemove([KEY, "kt_title"]).catch(() => {}); set({ save: emptySave(), session: null }); },

  startGame(level, mode) {
    const save = clone(get().save);
    const r = startSession(save, level, mode);
    if ("error" in r) return r;
    const session = r.session, payload = serveNext(save, session, lang());
    set({ save, session }); persist(save);
    return { payload };
  },
  nextQuestion() {
    if (!get().session) throw new Error("NO_SESSION");
    const save = cloneSave(get().save), session = clone(get().session!);
    const p = serveNext(save, session, lang());
    set({ save, session }); persist(save); return p;
  },
  answer(choice, elapsedSec) {
    if (!get().session) throw new Error("NO_SESSION");
    const save = cloneSave(get().save), session = clone(get().session!);
    const fb = eAnswer(save, session, choice, lang(), elapsedSec);
    set({ save, session }); persist(save); return fb;
  },
  hint() {
    if (!get().session) return { error: "QUESTION_INACTIVE" };
    const save = cloneSave(get().save), session = clone(get().session!);
    const r = eHint(save, session, lang());
    set({ save, session }); persist(save); return r;
  },
  quitGame() {
    if (!get().session) return 0;
    const save = cloneSave(get().save), session = clone(get().session!);
    const score = eQuit(save, session);
    set({ save, session }); persist(save); return score;
  },
}));

/** Data turunan (setara /api/me): statistik, gelar aktif, gelar milik, lencana Master, bingkai aktif, total poin. */
export function useDerived() {
  const save = useStore((s) => s.save);
  const stats = statList(save), p = save.profile;
  const title = currentTitle(p?.starter ?? "hello_world_graduate", stats, p?.selectedTitle);
  const badges = earnedDevBadges(stats);
  return { save, profile: p, stats, title, owned: ownedTitles(stats), badges, master: activeMaster(badges, p?.selectedMaster), total: totalPoints(save), meta: save.meta, starters: STARTERS };
}
