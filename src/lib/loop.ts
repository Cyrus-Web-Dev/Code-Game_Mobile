// Mesin animasi berulang yang HEMAT:
//  • Semua loop 100% native: satu timing linear yang di-loop oleh sisi native (tidak ada "sequence" yang dijalankan ulang dari JS
//    tiap siklus). Gerak bolak-balik dibuat lewat interpolasi (swing), bukan dua timing berurutan.
//  • Ada "gerbang" global: semua animasi dekoratif dihentikan saat layar permainan (Play) terbuka dan saat aplikasi di latar belakang.
//    Ini PENTING: layar yang dibekukan (freezeOnBlur) tetap menjalankan efek animasinya, sehingga tab di belakang layar Play dulu
//    terus menganimasikan lencana/partikel sambil kamu menjawab soal → patah-patah.
import { useEffect, useRef, useState } from "react";
import { AppState, Animated, Easing } from "react-native";

let playing = 0, active = AppState.currentState !== "background" && AppState.currentState !== "inactive";
const subs = new Set<(run: boolean) => void>();
export const gateOn = () => playing === 0 && active;
const emit = () => { const r = gateOn(); subs.forEach((f) => f(r)); };
try { AppState.addEventListener("change", (s) => { const a = s === "active"; if (a !== active) { active = a; emit(); } }); } catch { /* abaikan */ }
/** Dipanggil layar permainan: true saat dibuka, false saat ditutup. */
export const setPlaying = (on: boolean) => { const before = gateOn(); playing = Math.max(0, playing + (on ? 1 : -1)); if (gateOn() !== before) emit(); };
export const subscribeGate = (f: (run: boolean) => void) => { subs.add(f); return () => { subs.delete(f); }; };

/** Nilai 0→1 yang berulang tanpa henti secara native selama `enabled` dan gerbang terbuka. */
export function useNativeLoop(ms: number, enabled = true): Animated.Value {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) { v.setValue(0); return; }
    let anim: Animated.CompositeAnimation | null = null;
    const start = () => { if (anim) return; v.setValue(0); anim = Animated.loop(Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: true, isInteraction: false })); anim.start(); };
    const stop = () => { if (anim) { anim.stop(); anim = null; } };
    if (gateOn()) start();
    const off = subscribeGate((run) => (run ? start() : stop()));
    return () => { off(); stop(); };
  }, [ms, enabled, v]);
  return v;
}
const SINE = [0, 0.383, 0.707, 0.924, 1, 0.924, 0.707, 0.383, 0], AT = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
/** Gerak bolak-balik halus (from → to → from) dari nilai loop 0→1. */
export const swing = (v: Animated.Value, from = 0, to = 1) => v.interpolate({ inputRange: AT, outputRange: SINE.map((k) => from + (to - from) * k) });
/** Putaran penuh 0→360° (atau berlawanan arah). */
export const turn = (v: Animated.Value, reverse = false) => v.interpolate({ inputRange: [0, 1], outputRange: reverse ? ["360deg", "0deg"] : ["0deg", "360deg"] });

// ── Batas jumlah lencana yang beranimasi bersamaan (halaman Gelar bisa memuat puluhan lencana) ──
const MAX_ANIMATED_BADGES = 5; let slots = 0;
/** true bila komponen ini mendapat jatah animasi. Lencana yang tidak kebagian tampil statis (tanpa beban). */
export function useAnimSlot(want: boolean): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!want || slots >= MAX_ANIMATED_BADGES) { setOk(false); return; }
    slots++; setOk(true);
    return () => { slots--; };
  }, [want]);
  return ok;
}
