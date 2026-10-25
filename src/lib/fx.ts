// Anggaran efek visual (setara src/lib/fx.ts di web v2.5), versi React Native.
//   off  — tanpa animasi/partikel/konfeti (pengaturan "Mati", atau "Otomatis" + Reduce Motion di iOS).
//   lite — hanya animasi native ringan: tanpa partikel, bingkai orbit, dan konfeti besar.
//   full — efek penuh.
// Catatan Android: "Hapus animasi"/Hemat baterai sering menyalakan Reduce Motion tanpa disadari sehingga SEMUA animasi mati dan tampak rusak,
// sedangkan efek penuh berat di HP kelas menengah/bawah. Karena itu di Android mode "Otomatis" = Hemat; pilih Penuh di Pengaturan bila HP kuat.
import { useContext, useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import { NavigationContext } from "@react-navigation/native";
import { create } from "zustand";
import { useStore } from "./store";

export type Fx = "off" | "lite" | "full";
const useReduce = create<{ on: boolean }>(() => ({ on: false }));
let started = false;
/** Panggil sekali saat aplikasi mulai: membaca & mengikuti pengaturan "Kurangi gerakan" dari sistem (hanya dipakai di iOS). */
export function initFx() {
  if (started || Platform.OS !== "ios") return; started = true;
  AccessibilityInfo.isReduceMotionEnabled().then((v) => useReduce.setState({ on: !!v })).catch(() => {});
  try { AccessibilityInfo.addEventListener("reduceMotionChanged", (v) => useReduce.setState({ on: !!v })); } catch { /* abaikan */ }
}
/** true bila layar pemilik komponen sedang terlihat (di luar navigator selalu true). Animasi layar yang tertutup dihentikan. */
function useScreenFocused(): boolean {
  const nav = useContext(NavigationContext);
  const [f, setF] = useState(() => (nav ? nav.isFocused() : true));
  useEffect(() => {
    if (!nav) return;
    setF(nav.isFocused());
    const a = nav.addListener("focus", () => setF(true)), b = nav.addListener("blur", () => setF(false));
    return () => { a(); b(); };
  }, [nav]);
  return f;
}
export function useFx(): Fx {
  const mode = useStore((s) => s.save.settings.fx), reduce = useReduce((s) => s.on), focused = useScreenFocused();
  if (!focused || mode === "off") return "off";
  if (mode === "lite") return "lite";
  if (mode === "full") return "full";
  // Otomatis: Android → Hemat (animasi inti saja, tanpa partikel/konfeti besar); iOS → Penuh kecuali "Kurangi gerakan".
  if (Platform.OS === "android") return "lite";
  return reduce ? "off" : "full";
}
