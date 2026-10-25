import React, { memo } from "react";
import { Animated, View } from "react-native";
import { useNativeLoop } from "../lib/loop";

const rng = (seed: number) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** Satu partikel yang naik dan memudar, berulang: satu loop native; jeda awal (delay) dibuat lewat interpolasi. */
function Rise({ x, y, dx, dist, color, r, dur, delay, glow }: { x: number; y: number; dx: number; dist: number; color: string; r: number; dur: number; delay: number; glow?: boolean }) {
  const t = useNativeLoop(dur + delay), f = delay / (dur + delay), up = f + (1 - f) * 0.12;
  return (
    <Animated.View pointerEvents="none" style={{
      position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, backgroundColor: color,
      opacity: t.interpolate({ inputRange: [0, f, up, 1], outputRange: [0, 0, 1, 0] }),
      transform: [{ translateX: t.interpolate({ inputRange: [0, f, 1], outputRange: [0, 0, dx] }) }, { translateY: t.interpolate({ inputRange: [0, f, 1], outputRange: [0, 0, -dist] }) }, { scale: t.interpolate({ inputRange: [0, f, 1], outputRange: [1, 1, 0.2] }) }],
    }} />
  );
}

/** Kumpulan partikel naik di dalam kotak w×h (titik awal acak di sekitar `baseY`). */
export const RiseField = memo(function RiseField({ w, h, count, colors, seed = 1, dist, size = 2.4, baseY, spread, glow = true }: { w: number; h: number; count: number; colors: string[]; seed?: number; dist: number; size?: number; baseY?: number; spread?: number; glow?: boolean }) {
  const r = rng(seed), items = Array.from({ length: count }, (_, i) => ({
    x: w / 2 + (r() - 0.5) * (spread ?? w * 0.8), y: (baseY ?? h * 0.8) - r() * h * 0.1, dx: (r() - 0.5) * w * 0.2,
    color: colors[i % colors.length], rr: size * (0.5 + r() * 0.8), dur: 2200 + r() * 2200, delay: r() * 3500,
  }));
  return <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: w, height: h }}>{items.map((p, i) => <Rise key={i} x={p.x} y={p.y} dx={p.dx} dist={dist} color={p.color} r={p.rr} dur={p.dur} delay={p.delay} glow={glow} />)}</View>;
});
