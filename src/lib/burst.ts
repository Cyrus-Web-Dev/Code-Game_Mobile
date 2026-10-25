import { create } from "zustand";
import type { AnyLevel } from "./config";

/** Ledakan konfeti khas tiap tingkat (v2.5). Dipicu dari lencana legendaris; digambar oleh <BurstHost /> di akar aplikasi. */
type B = { id: number; level: AnyLevel | null; x: number; y: number; fire: (level: AnyLevel, x: number, y: number) => void };
export const useBurst = create<B>((set) => ({ id: 0, level: null, x: 0, y: 0, fire: (level, x, y) => set((s) => ({ id: s.id + 1, level, x, y })) }));
