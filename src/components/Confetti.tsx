import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Dimensions as Dim, Easing, StyleSheet, Text as Txt, View } from "react-native";
import { anyTheme, isGodLevel, type AnyLevel } from "../lib/config";
import type { Fx } from "../lib/fx";

const COLORS = ["#f5c451", "#6ee7c8", "#ff5c8a", "#3da5ff", "#a855f7", "#ff8a3d", "#ffffff"];
/** Konfeti ringan (native driver) — pengganti canvas-confetti. Dimainkan sekali saat dipasang. */
export default function Confetti({ count = 46 }: { count?: number }) {
  const { width, height } = Dimensions.get("window");
  const items = useMemo(() => Array.from({ length: count }, (_, i) => ({ x: width * (0.15 + 0.7 * Math.random()), dx: (Math.random() - 0.5) * width * 0.9, up: height * (0.18 + Math.random() * 0.3), fall: height * 0.5, rot: (Math.random() - 0.5) * 900, c: COLORS[i % COLORS.length], w: 6 + Math.random() * 5, h: 9 + Math.random() * 6, d: Math.random() * 250 })), [count, width, height]);
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{items.map((p, i) => <Piece key={i} p={p} top={height * 0.62} />)}</View>;
}
function Piece({ p, top }: { p: { x: number; dx: number; up: number; fall: number; rot: number; c: string; w: number; h: number; d: number }; top: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(t, { toValue: 1, duration: 2300, delay: p.d, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, [t, p.d]);
  return <Animated.View style={{ position: "absolute", left: p.x, top, width: p.w, height: p.h, backgroundColor: p.c, borderRadius: 2, opacity: t.interpolate({ inputRange: [0, 0.05, 0.8, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }) }, { translateY: t.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, -p.up, p.fall] }) }, { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${p.rot}deg`] }) }] }} />;
}

// ════════ v2.5: konfeti khas tiap tingkat (setara badge-fx.ts di web) ════════

type Style = { colors: string[]; glyphs: string[]; n: number; up: [number, number]; fall: number; ring: number; size: [number, number] };
const GOLD = ["#f5c451", "#ffe9a8", "#fff6d6"];
const GOD_STYLE: Record<string, Style> = {
  demi_god: { colors: [...GOLD, "#d9c177"], glyphs: ["✦", "★", "✦"], n: 40, up: [0.12, 0.3], fall: 0.45, ring: 0, size: [14, 24] },                 // hujan emas
  god: { colors: [...GOLD, "#ffd24a"], glyphs: ["⚡", "●", "✦"], n: 46, up: [0.15, 0.36], fall: 0.4, ring: 1, size: [13, 24] },                      // cincin cahaya + kilatan
  true_god: { colors: ["#ffffff", "#e8eefc", "#cfd8ea", "#9fb4d8"], glyphs: ["◆", "✦", "◆"], n: 44, up: [0.14, 0.34], fall: 0.5, ring: 0, size: [13, 24] }, // pecahan platina
  primordial_god: { colors: ["#a855f7", "#d8b4fe", "#f5c451", "#ffffff"], glyphs: ["★", "☄", "★"], n: 54, up: [0.18, 0.42], fall: 0.45, ring: 2, size: [14, 28] }, // ledakan kosmik
};
type P = { dx: number; up: number; fall: number; rot: number; c: string; g: string | null; sz: number; d: number };

function Spark({ p, ox, oy }: { p: P; ox: number; oy: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(t, { toValue: 1, duration: 2200, delay: p.d, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, [t, p.d]);
  const style = { position: "absolute" as const, left: ox, top: oy, opacity: t.interpolate({ inputRange: [0, 0.05, 0.75, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }) }, { translateY: t.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, -p.up, p.fall] }) }, { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${p.rot}deg`] }) }] };
  return p.g
    ? <Animated.View style={style}><Txt style={{ color: p.c, fontSize: p.sz, textShadowColor: p.c, textShadowRadius: 6 }}>{p.g}</Txt></Animated.View>
    : <Animated.View style={[style, { width: p.sz * 0.5, height: p.sz * 0.75, backgroundColor: p.c, borderRadius: 2 }]} />;
}
function Ring({ ox, oy, color, delay }: { ox: number; oy: number; color: string; delay: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(t, { toValue: 1, duration: 900, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(); }, [t, delay]);
  const R = 70;
  return <Animated.View style={{ position: "absolute", left: ox - R, top: oy - R, width: R * 2, height: R * 2, borderRadius: R, borderWidth: 3, borderColor: color, opacity: t.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.9, 0] }), transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.2, 3] }) }] }} />;
}

/** Ledakan konfeti dari titik (x, y) layar. `fx` "lite" = jumlah kecil. Dimainkan sekali. */
export function BurstConfetti({ level, x, y, fx }: { level: AnyLevel; x: number; y: number; fx: Fx }) {
  const { width, height } = Dim.get("window"), god = isGodLevel(level), th = anyTheme(level), k = fx === "lite" ? 0.4 : 1;
  const st: Style = god ? GOD_STYLE[level] : { colors: level === "hell" ? ["#ff3b3b", "#f5c451", "#ff8a3d"] : [th.main, th.accent, "#ffffff"], glyphs: [], n: level === "hell" ? 60 : 36, up: [0.12, 0.3], fall: 0.45, ring: 0, size: [10, 16] };
  const items = useMemo<P[]>(() => Array.from({ length: Math.max(8, Math.round(st.n * k)) }, (_, i) => ({
    dx: (Math.random() - 0.5) * width * 0.95, up: height * (st.up[0] + Math.random() * (st.up[1] - st.up[0])), fall: height * st.fall, rot: (Math.random() - 0.5) * 720,
    c: st.colors[i % st.colors.length], g: st.glyphs.length ? st.glyphs[i % st.glyphs.length] : null, sz: st.size[0] + Math.random() * (st.size[1] - st.size[0]), d: Math.random() * 280,
  })), [level, k, width, height]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: fx === "lite" ? Math.min(1, st.ring) : st.ring }, (_, i) => <Ring key={"r" + i} ox={x} oy={y} color={st.colors[i % st.colors.length]} delay={i * 160} />)}
      {items.map((p, i) => <Spark key={i} p={p} ox={x} oy={y} />)}
    </View>
  );
}
