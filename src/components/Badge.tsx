import React, { memo, useCallback, useMemo, useRef } from "react";
import { Animated, Image, Pressable, View } from "react-native";
import Svg, { Circle, SvgXml } from "react-native-svg";
import { badgeLayers, type BadgeLayers, type Tier } from "../lib/badge-svg";
import { BADGE_IMG } from "../lib/badge-images";
import { anyTheme, isGodLevel, type AnyLevel } from "../lib/config";
import { useBurst } from "../lib/burst";
import { useFx } from "../lib/fx";
import { swing, turn, useAnimSlot, useNativeLoop } from "../lib/loop";
import { haptic } from "../lib/feedback";
import { RiseField } from "./Particles";

// Partikel naik khas tiap tingkat God Mode (v2.5; versi web memakai three.js saat hover).
const GOD_FIELD: Record<string, { colors: string[]; count: number }> = {
  demi_god: { colors: ["#f5c451", "#ffe9a8"], count: 8 },
  god: { colors: ["#fff6c9", "#f5c451", "#ffd24a"], count: 10 },
  true_god: { colors: ["#ffffff", "#cfd8ea", "#9fb4d8"], count: 10 },
  primordial_god: { colors: ["#a855f7", "#d8b4fe", "#f5c451"], count: 12 },
};

// PERFORMA: lapisan lencana (latar + badan) adalah PNG hasil render sekali (scripts/render-badges.ts) — bukan SVG vektor.
// Dulu tiap lencana = ratusan view native (1 per elemen SVG) → layar Game/Gelar freeze. Kini 2 gambar + 1 SVG kecil (teks singkatan bahasa).
const LAYERS = new Map<string, BadgeLayers>();
function layersFor(tier: Tier, level: AnyLevel, tech: string | null | undefined, big: boolean): BadgeLayers {
  const key = `${tier}|${level}|${tech ?? ""}|${big ? 1 : 0}`; let L = LAYERS.get(key);
  if (!L) { L = badgeLayers({ uid: "c", tier, level, tech, size: big ? 320 : 100 }); if (LAYERS.size > 200) LAYERS.clear(); LAYERS.set(key, L); }
  return L;
}
/** Lencana gelar. Legendaris: lapisan latar berputar + denyut aura, lapisan depan melayang, partikel (Hell/Primordial/Easy).
 *  Semuanya animasi native (transform/opacity) — ringan. `still` mematikan animasi (mis. daftar panjang). */
function TitleBadge({ tier, level, tech, size = 220, still = false }: { tier: Tier; level: AnyLevel; tech?: string | null; size?: number; still?: boolean }) {
  const h = size * 0.875, k = size / 320, fx = useFx(), god = isGodLevel(level);
  const L = useMemo(() => layersFor(tier, level, tech, size > 100), [tier, level, tech, size]), imgKey = `${tier}_${tier === "starter" ? "easy" : level}`, back = BADGE_IMG[imgKey + "_back"], front = BADGE_IMG[imgKey + "_front"];
  const L0 = L.leg && !still && fx !== "off", animate = useAnimSlot(L0);
  const ref = useRef<View>(null), wig = useRef(new Animated.Value(0)).current, last = useRef(0);
  const tappable = L0;
  const orbiting = animate && god && fx === "full" && size >= 100;
  // satu loop native untuk putaran latar, satu untuk melayang+denyut (bob/pulse memakai nilai yang sama dengan fase berbeda)
  const spinV = useNativeLoop(26000, animate), bobV = useNativeLoop(4200, animate), pulseV = useNativeLoop(3200, animate), orbitV = useNativeLoop(9000, orbiting);
  const spin = turn(spinV), bob = swing(bobV, 0, 1), pulse = swing(pulseV, 0, 1), orbit = orbitV;
  // Ketuk lencana legendaris: goyang 3D singkat + konfeti khas tingkat (jeda 2,5 dtk agar tidak membanjiri).
  const tap = useCallback(() => {
    const now = Date.now(); if (now - last.current < 2500) return; last.current = now;
    haptic("win");
    wig.setValue(0); Animated.sequence([Animated.timing(wig, { toValue: 1, duration: 140, useNativeDriver: true }), Animated.timing(wig, { toValue: -1, duration: 220, useNativeDriver: true }), Animated.spring(wig, { toValue: 0, useNativeDriver: true, friction: 5 })]).start();
    ref.current?.measureInWindow((x, y, w, hh) => useBurst.getState().fire(level, x + w / 2, y + hh / 2));
  }, [level, wig]);
  const pad = 24 * k, W = (size * 368) / 320, H = (h * 328) / 280; // viewBox diperlebar (lihat badge-svg.ts)
  const abs = { position: "absolute" as const, left: -pad, top: -pad, width: W, height: H };
  const embers = animate && fx === "full" && size > 100 && (god ? GOD_FIELD[level] : L.hell ? { colors: ["#ffb43a", "#ff3b3b"], count: 12 } : L.effLv === "easy" ? { colors: ["#e5e7eb"], count: 6 } : null);
  const th = anyTheme(level), OR = size * 0.56;
  const body = (
    <Animated.View style={{ width: size, height: h, transform: [{ perspective: 700 }, { rotateY: wig.interpolate({ inputRange: [-1, 0, 1], outputRange: ["-18deg", "0deg", "18deg"] }) }, { scale: wig.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.04, 1, 1.04] }) }] }}>
      {orbiting && (
        <Animated.View pointerEvents="none" style={{ position: "absolute", left: size / 2 - OR, top: h / 2 - OR, width: OR * 2, height: OR * 2, transform: [{ rotate: orbit.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }}>
          <Svg width={OR * 2} height={OR * 2}><Circle cx={OR} cy={OR} r={OR - 2} stroke={th.accent} strokeWidth={1.6} strokeDasharray="3 10" fill="none" opacity={0.7} /></Svg>
        </Animated.View>
      )}
      {animate ? (
        <Animated.View renderToHardwareTextureAndroid style={[abs, { transform: [{ rotate: spin }, { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.05] }) }] }]}>
          {back ? <Image source={back} style={{ width: W, height: H }} fadeDuration={0} /> : <SvgXml xml={L.back} width={W} height={H} />}
        </Animated.View>
      ) : <View style={abs}>{back ? <Image source={back} style={{ width: W, height: H }} fadeDuration={0} /> : <SvgXml xml={L.back} width={W} height={H} />}</View>}
      <Animated.View renderToHardwareTextureAndroid={animate} style={[abs, animate ? { transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4 * k * 1.4] }) }] } : null]}>
        {front ? <Image source={front} style={{ width: W, height: H }} fadeDuration={0} /> : <SvgXml xml={L.front} width={W} height={H} />}
        <SvgXml xml={L.text} width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} />
      </Animated.View>
      {embers && <RiseField w={size} h={h} count={embers.count} colors={embers.colors} seed={5} dist={135 * k} size={2.2 * k + 0.6} baseY={205 * k} spread={200 * k} />}
    </Animated.View>
  );
  return tappable
    ? <Pressable ref={ref} onPress={tap} accessibilityRole="image" style={{ width: size, height: h }}>{body}</Pressable>
    : <View ref={ref} pointerEvents="none" style={{ width: size, height: h }}>{body}</View>;
}
export default memo(TitleBadge);
