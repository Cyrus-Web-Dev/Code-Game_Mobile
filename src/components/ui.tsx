import React, { useRef } from "react";
import { Animated, Pressable, ScrollView, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle, type PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F, R, al } from "../theme";
import Backdrop from "./Backdrop";
import { haptic } from "../lib/feedback";

type IconName = keyof typeof Ionicons.glyphMap;
export const Icon = ({ name, size = 18, color = C.paper, style }: { name: IconName; size?: number; color?: string; style?: StyleProp<TextStyle> }) => <Ionicons name={name} size={size} color={color} style={style} />;

/** Teks dasar: font Space Grotesk, warna paper. `m` = monospace, `d` = display (Fraunces), `b` = tebal. */
export function T({ c = C.paper, s = 14, m, d, b, o, style, children, ...rest }: TextProps & { c?: string; s?: number; m?: boolean; d?: boolean; b?: boolean; o?: number }) {
  return <Text {...rest} style={[{ color: o != null ? al(c, o) : c, fontSize: s, fontFamily: d ? F.display : m ? (b ? F.monoB : F.mono) : b ? F.sansB : F.sans }, style]}>{children}</Text>;
}

type Kind = "default" | "primary" | "gold" | "danger";
const KIND: Record<Kind, { bg: string; bd: string; fg: string }> = {
  default: { bg: "transparent", bd: C.line, fg: C.paper },
  primary: { bg: C.mint, bd: C.mint, fg: C.ink },
  gold: { bg: C.gold, bd: C.gold, fg: C.ink },
  danger: { bg: al(C.hot, 0.1), bd: al(C.hot, 0.5), fg: C.hot },
};
export function Btn({ label, onPress, kind = "default", icon, disabled, small, style, flex }: { label: string; onPress?: () => void; kind?: Kind; icon?: IconName; disabled?: boolean; small?: boolean; style?: StyleProp<ViewStyle>; flex?: boolean }) {
  const k = KIND[kind], sc = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(sc, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale: sc }], opacity: disabled ? 0.4 : 1 }, flex ? { flex: 1 } : null, style]}>
      <Pressable disabled={disabled} onPress={() => { haptic("tap"); onPress?.(); }} onPressIn={() => to(0.97)} onPressOut={() => to(1)}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: R.sm + 2, borderWidth: 1, borderColor: k.bd, backgroundColor: k.bg, paddingHorizontal: small ? 12 : 16, paddingVertical: small ? 8 : 12, ...(kind === "primary" ? { shadowColor: C.mint, shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 0 } } : null) }}>
        {icon && <Icon name={icon} size={small ? 14 : 17} color={k.fg} />}
        <T c={k.fg} s={small ? 12 : 14} b={kind !== "default"} style={{ fontFamily: kind === "default" ? F.sansM : F.sansB }}>{label}</T>
      </Pressable>
    </Animated.View>
  );
}

export function Card({ children, style, glow, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; glow?: boolean; onPress?: PressableProps["onPress"] }) {
  const s: ViewStyle = { borderRadius: R.md, borderWidth: 1, borderColor: glow ? al(C.gold, 0.3) : C.line, backgroundColor: al(C.panel, 0.9), padding: 16, ...(glow ? { shadowColor: C.gold, shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 0 } } : null) };
  return onPress ? <Pressable onPress={(e) => { haptic("tap"); onPress(e); }} style={({ pressed }) => [s, pressed && { borderColor: al(C.mint, 0.5) }, style]}>{children}</Pressable> : <View style={[s, style]}>{children}</View>;
}

/** Kartu tingkat (setara .level-card): gradasi + garis warna tema. */
export function LevelCard({ color, glow, children, style }: { color: string; glow: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ borderRadius: R.lg, borderWidth: 1, borderColor: al(color, 0.38), backgroundColor: al(glow, 0.2), padding: 14, overflow: "hidden", shadowColor: glow, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } }, style]}>{children}</View>;
}

export const Chip = ({ children, color = C.paper, icon }: { children: React.ReactNode; color?: string; icon?: IconName }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", borderRadius: 99, borderWidth: 1, borderColor: al(color, 0.35), backgroundColor: al(color, 0.08), paddingHorizontal: 10, paddingVertical: 4 }}>
    {icon && <Icon name={icon} size={12} color={color} />}<T c={color} s={11}>{children}</T>
  </View>
);
export const Bar = ({ pct, color = C.mint, h = 6 }: { pct: number; color?: string; h?: number }) => (
  <View style={{ height: h, borderRadius: 99, backgroundColor: "rgba(255,255,255,.08)", overflow: "hidden" }}><View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: "100%", borderRadius: 99, backgroundColor: color }} /></View>
);
export const H2 = ({ children, color = C.gold }: { children: React.ReactNode; color?: string }) => <T d s={21} c={color}>{children}</T>;

/** Halaman: latar + inset aman + (opsional) bilah judul dengan tombol kembali. `tab` = layar tab (tanpa tombol kembali). */
export function Screen({ title, subtitle, children, scroll = true, tab, right, pad = 16, gap = 16, bottomExtra = 0 }: { title?: string; subtitle?: string; children: React.ReactNode; scroll?: boolean; tab?: boolean; right?: React.ReactNode; pad?: number; gap?: number; bottomExtra?: number }) {
  const ins = useSafeAreaInsets(), nav = useNavigation<any>();
  const head = title ? (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      {!tab && nav.canGoBack() && <Pressable hitSlop={12} onPress={() => { haptic("tap"); nav.goBack(); }} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" }}><Icon name="chevron-back" size={20} /></Pressable>}
      <View style={{ flex: 1 }}><T d s={26} c={C.gold}>{title}</T>{subtitle ? <T s={12.5} o={0.6} style={{ marginTop: 2 }}>{subtitle}</T> : null}</View>
      {right}
    </View>
  ) : null;
  return (
    <View style={{ flex: 1, backgroundColor: C.ink }}>
      <Backdrop />
      {scroll ? (
        <ScrollView contentContainerStyle={{ padding: pad, paddingTop: ins.top + 12, paddingBottom: ins.bottom + 28 + bottomExtra, gap }} keyboardShouldPersistTaps="handled">{head}{children}</ScrollView>
      ) : <View style={{ flex: 1, padding: pad, paddingTop: ins.top + 12, paddingBottom: ins.bottom + 12, gap }}>{head}{children}</View>}
    </View>
  );
}
