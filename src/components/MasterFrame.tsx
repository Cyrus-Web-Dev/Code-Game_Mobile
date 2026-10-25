import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, SvgXml } from "react-native-svg";
import { DEV_TITLE_DEFS, MASTER_TEXT, type DevRole } from "../lib/config";
import { RiseField } from "./Particles";
import { LinearGradient } from "expo-linear-gradient";
import { useFx } from "../lib/fx";
import { swing, turn, useNativeLoop } from "../lib/loop";
import { F, al } from "../theme";

// ── Palet konik (sama dengan conic-gradient di versi web) ──
type Stop2 = [number, string];
const SMOOTH: Partial<Record<DevRole, Stop2[]>> = {
  frontend: [[0, "#ff2a00"], [.16, "#ff7a00"], [.28, "#ffe27a"], [.40, "#ff7a00"], [.54, "#ff2a00"], [.72, "#7a0000"], [1, "#ff2a00"]],
  backend: [[0, "#000000"], [.09, "#1c1c24"], [.20, "#000000"], [.27, "#a3a3b8"], [.33, "#15151b"], [.52, "#000000"], [.64, "#4d4d5d"], [.76, "#000000"], [.90, "#1c1c24"], [1, "#000000"]],
};
const HARD: Stop2[] = [[.20, "#b026ff"], [.27, "#000000"], [.46, "#ff2a2a"], [.53, "#000000"], [.76, "#7c1fd1"], [.82, "#000000"], [.91, "#ff2a2a"], [1, "#b026ff"]];
const hx = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixc = (a: string, b: string, t: number) => "#" + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
export function colorAt(role: DevRole, f: number): string {
  const hard = role === "fullstack", st = hard ? HARD : SMOOTH[role]!;
  if (hard) return (st.find(([e]) => f < e) ?? st[st.length - 1])[1];
  for (let i = 1; i < st.length; i++) if (f <= st[i][0]) { const [a, ca] = st[i - 1], [b, cb] = st[i]; return mixc(ca, cb, (f - a) / Math.max(b - a, 1e-6)); }
  return st[st.length - 1][1];
}
const pt = (c: number, r: number, deg: number) => { const a = ((deg - 90) * Math.PI) / 180; return [c + r * Math.cos(a), c + r * Math.sin(a)]; };
const cache = new Map<string, string>();
/** Cincin konik: N busur berwarna (tanpa library konik; dirotasi native). */
export function ringXml(role: DevRole, size: number, width: number): string {
  const key = `r${role}${size}${width}`; const hit = cache.get(key); if (hit) return hit;
  const N = role === "fullstack" ? 60 : 48, c = size / 2, r = c - width / 2; let d = "";
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * 360, a1 = ((i + 1) / N) * 360 + 0.7, [x0, y0] = pt(c, r, a0), [x1, y1] = pt(c, r, a1);
    d += `<path d="M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}" stroke="${colorAt(role, (i + .5) / N)}" stroke-width="${width}" fill="none"/>`;
  }
  const x = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${d}</svg>`; cache.set(key, x); return x;
}
/** Piringan konik penuh — dipakai sebagai border kartu (diputar di belakang panel). */
export function discXml(role: DevRole, size: number): string {
  const key = `d${role}${size}`; const hit = cache.get(key); if (hit) return hit;
  const N = role === "fullstack" ? 60 : 48, c = size / 2; let d = "";
  for (let i = 0; i < N; i++) {
    const [x0, y0] = pt(c, c, (i / N) * 360), [x1, y1] = pt(c, c, ((i + 1) / N) * 360 + 0.7);
    d += `<path d="M${c} ${c}L${x0.toFixed(1)} ${y0.toFixed(1)}A${c} ${c} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z" fill="${colorAt(role, (i + .5) / N)}"/>`;
  }
  const x = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${d}</svg>`; cache.set(key, x); return x;
}

/** Aura radial sebagai string SVG (SvgXml). Sebelumnya memakai <RadialGradient> + .map() yang ditolak tipe react-native-svg (TS2739). */
export function auraXml(role: DevRole, size: number): string {
  const key = `u${role}${size}`; const hit = cache.get(key); if (hit) return hit;
  const A = MASTER_THEME[role].aura, last = A[A.length - 1][0], offs = [0.34, 0.56, 0.74];
  const stops = A.map(([c, a], i) => `<stop offset="${offs[i] ?? 0.74}" stop-color="${c}" stop-opacity="${a}"/>`).join("") + `<stop offset="1" stop-color="${last}" stop-opacity="0"/>`;
  const x = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%">${stops}</radialGradient></defs><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#g)"/></svg>`;
  cache.set(key, x); return x;
}

export const MASTER_THEME: Record<DevRole, { aura: [string, number][]; spark: string[]; edge: string; ring2: string; glow: string; glow2: string; dash: string }> = {
  frontend: { aura: [["#ff3c0a", .7], ["#ff8214", .24], ["#ff8214", 0]], spark: ["#ffae3a", "#ff4a1c"], edge: "rgba(255,190,120,.45)", ring2: "#ff9a1f", glow: "#ff4614", glow2: "#ff7814", dash: "6 11" },
  backend: { aura: [["#000000", .95], ["#1a102c", .7], ["#7860af", 0.2]], spark: ["#8a72c0", "#5c4a88"], edge: "rgba(205,205,228,.42)", ring2: "#9682c8", glow: "#000000", glow2: "#6a50a8", dash: "2 12" },
  fullstack: { aura: [["#a528ff", .66], ["#ff2832", .24], ["#ff2832", 0]], spark: ["#d8b4fe", "#ff3b3b"], edge: "rgba(216,180,254,.5)", ring2: "#e9d5ff", glow: "#b026ff", glow2: "#ff2a2a", dash: "3 9" },
};

function useLoop(ms: number, reverse = false, on = true) { return turn(useNativeLoop(ms, on), reverse); }
function usePulse(ms: number, on = true) { return swing(useNativeLoop(ms * 2, on), 0, 1); }

/** Bingkai avatar Master: aura berdenyut, cincin konik berputar, cincin bergerigi berlawanan arah, tepi tipis, partikel. */
export const MasterAvatarFrame = memo(function MasterAvatarFrame({ role, size, children }: { role: DevRole; size: number; children: React.ReactNode }) {
  const fx = useFx(), th = MASTER_THEME[role], rw = Math.max(3.5, Math.round(size * 0.1)), gap = 2;
  const ringS = size + 2 * (gap + rw), r2w = Math.max(2, rw * 0.55), ring2S = ringS + 2 * (r2w + 2), auraS = Math.round(size + 2 * (rw + gap) * 2.8), foot = Math.max(ring2S, 0) + 2;
  const on = fx === "full", spin = useLoop(role === "backend" ? 8000 : role === "fullstack" ? 4200 : 5500, false, on), spinR = useLoop(role === "backend" ? 12000 : role === "frontend" ? 6000 : 9000, true, on), pulse = usePulse(role === "frontend" ? 850 : 1500, on), orbit = useLoop(3400, false, fx === "full" && size >= 44);
  const ring = useMemo(() => ringXml(role, Math.round(ringS), rw), [role, ringS, rw]);
  const ctr = { position: "absolute" as const, alignItems: "center" as const, justifyContent: "center" as const };
  return (
    <View style={{ width: foot, height: foot, alignItems: "center", justifyContent: "center", overflow: "visible" }}>
      <Animated.View pointerEvents="none" style={[ctr, { width: auraS, height: auraS, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.07] }) }] }]}>
        <SvgXml xml={auraXml(role, Math.round(auraS))} width={auraS} height={auraS} />
      </Animated.View>
      <Animated.View pointerEvents="none" renderToHardwareTextureAndroid style={[ctr, { width: ring2S, height: ring2S, transform: [{ rotate: spinR }] }]}>
        <Svg width={ring2S} height={ring2S}><Circle cx={ring2S / 2} cy={ring2S / 2} r={ring2S / 2 - r2w / 2} stroke={th.ring2} strokeWidth={r2w} strokeDasharray={th.dash} fill="none" opacity={0.85} /></Svg>
      </Animated.View>
      <Animated.View pointerEvents="none" renderToHardwareTextureAndroid style={[ctr, { width: ringS, height: ringS, transform: [{ rotate: spin }] }]}><SvgXml xml={ring} width={ringS} height={ringS} /></Animated.View>
      <View pointerEvents="none" style={[ctr, { width: ringS, height: ringS, borderRadius: ringS / 2, borderWidth: 1, borderColor: th.edge }]} />
      <View style={{ width: size + 2 * gap, height: size + 2 * gap, borderRadius: (size + 2 * gap) / 2, backgroundColor: "#0d0b14", alignItems: "center", justifyContent: "center" }}>{children}</View>
      {fx === "full" && size >= 44 && (
        <Animated.View pointerEvents="none" style={[ctr, { width: ringS + 10, height: ringS + 10, transform: [{ rotate: orbit }] }]}>
          <View style={{ position: "absolute", top: 0, left: (ringS + 10) / 2 - 2, width: 4, height: 4, borderRadius: 2, backgroundColor: th.spark[0], shadowColor: th.spark[0], shadowOpacity: 1, shadowRadius: 5, shadowOffset: { width: 0, height: 0 } }} />
          <View style={{ position: "absolute", bottom: 0, left: (ringS + 10) / 2 - 1.5, width: 3, height: 3, borderRadius: 2, backgroundColor: th.spark[1] }} />
        </Animated.View>
      )}
      {fx === "full" && size >= 44 && <RiseField w={foot} h={foot} count={role === "backend" ? 4 : 6} colors={th.spark} seed={role.length * 7} dist={size * 1.1} size={Math.max(1.6, size * 0.03)} baseY={foot * 0.7} spread={size * 0.7} glow={role !== "backend"} />}
    </View>
  );
});

/** Kartu dengan border Master tebal & berputar (piringan konik di belakang panel) + cahaya luar + partikel. Tanpa `role` = pembungkus biasa. */
export function MasterCard({ role, children, radius = 16, style, bg = "#1f1c2e" }: { role: DevRole | null; children: React.ReactNode; radius?: number; style?: StyleProp<ViewStyle>; bg?: string }) {
  const [sz, setSz] = useState({ w: 0, h: 0 });
  const fx = useFx(), on = fx === "full", spin = useLoop(8000, false, on), pulse = usePulse(1600, on), entry = useRef(new Animated.Value(fx !== "off" ? 0 : 1)).current;
  useEffect(() => { if (fx !== "off") Animated.spring(entry, { toValue: 1, useNativeDriver: true, friction: 8, tension: 60 }).start(); }, [fx, entry]);
  if (!role) return <View style={style}>{children}</View>;
  const th = MASTER_THEME[role], B = 3, D = Math.ceil(Math.hypot(sz.w, sz.h)) + 4;
  const onLay = (e: LayoutChangeEvent) => { const { width, height } = e.nativeEvent.layout; if (Math.abs(width - sz.w) > 1 || Math.abs(height - sz.h) > 1) setSz({ w: width, h: height }); };
  return (
    <Animated.View onLayout={onLay} style={[{ opacity: entry, transform: [{ scale: entry.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }], borderRadius: radius + B, padding: B, shadowColor: th.glow2, shadowOpacity: 0.55, shadowRadius: 22, shadowOffset: { width: 0, height: 0 }, elevation: 14 }, style]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius + B, overflow: "hidden", backgroundColor: "#0a0810" }]}>
        {sz.w > 0 && <Animated.View renderToHardwareTextureAndroid style={{ position: "absolute", width: D, height: D, left: (sz.w - D) / 2, top: (sz.h - D) / 2, transform: [{ rotate: spin }] }}><SvgXml xml={discXml(role, 360)} width={D} height={D} /></Animated.View>}
      </View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius + B, borderWidth: 1, borderColor: th.edge, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }]} />
      <View style={{ borderRadius: radius, overflow: "hidden", backgroundColor: bg }}>
        {children}
        {fx === "full" && sz.w > 0 && role === "fullstack" && <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.28] }) }]}><LinearGradient colors={["#a528ff", "#ff2832", "#00000000"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} /></Animated.View>}
        {fx === "full" && sz.w > 0 && role === "backend" && <Animated.View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, height: 2, backgroundColor: "rgba(150,130,200,.35)", transform: [{ translateY: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, sz.h] }) }] }} />}
        {fx === "full" && sz.w > 0 && <RiseField w={sz.w - B * 2} h={sz.h - B * 2} count={role === "backend" ? 5 : 8} colors={th.spark} seed={11} dist={Math.min(240, sz.h)} size={role === "backend" ? 5 : 2.2} baseY={sz.h - B * 2} spread={sz.w - 24} glow={role !== "backend"} />}
      </View>
    </Animated.View>
  );
}

/** Pil gelar Master (selalu terbaca di latar gelap) dengan kilap yang menyapu berkala (v2.5). */
export function MasterPill({ role, active = false, small = false }: { role: DevRole; active?: boolean; small?: boolean }) {
  const c = MASTER_TEXT[role], fx = useFx(), v = useNativeLoop(4200, fx === "full"), [w, setW] = useState(0);
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ overflow: "hidden", borderRadius: 99, borderWidth: 1, borderColor: al(c, 0.6), backgroundColor: role === "backend" ? "#0a0a10" : al(c, 0.14), paddingHorizontal: small ? 7 : 10, paddingVertical: small ? 2 : 4, shadowColor: c, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, ...(active ? { borderColor: c, borderWidth: 2 } : null) }}>
      <Text style={{ color: c, fontFamily: F.sansB, fontSize: small ? 9 : 11 }}>{DEV_TITLE_DEFS[role].name}</Text>
      {fx === "full" && w > 0 && <Animated.View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, width: 14, backgroundColor: "rgba(255,255,255,.28)", transform: [{ translateX: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [-20, w + 6, w + 6] }) }, { skewX: "-20deg" }] }} />}
    </View>
  );
}
