import React, { useState } from "react";
import { Animated, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "react-native";
import { SvgXml } from "react-native-svg";
import { foilXml } from "../lib/foil-svg";
import { FOIL_IMG } from "../lib/badge-images";
import { useFx } from "../lib/fx";
import { turn, useNativeLoop } from "../lib/loop";

/** Kartu dengan border foil berputar (gelar legendaris). Tanpa animasi bila efek "Mati": hanya border statis. */
export default function FoilCard({ main, accent, radius = 16, children, style, bg = "#1f1c2e" }: { main: string; accent: string; radius?: number; children: React.ReactNode; style?: StyleProp<ViewStyle>; bg?: string }) {
  const fx = useFx(), [sz, setSz] = useState({ w: 0, h: 0 }), spin = useNativeLoop(9000, fx === "full"), B = 2;
  const D = Math.ceil(Math.hypot(sz.w, sz.h)) + 4;
  const on = (e: LayoutChangeEvent) => { const { width, height } = e.nativeEvent.layout; if (Math.abs(width - sz.w) > 1 || Math.abs(height - sz.h) > 1) setSz({ w: width, h: height }); };
  return (
    <View onLayout={on} style={[{ borderRadius: radius + B, padding: B, backgroundColor: main + "55" }, style]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius + B, overflow: "hidden" }]}>
        {sz.w > 0 && (
          <Animated.View style={{ position: "absolute", width: D, height: D, left: (sz.w - D) / 2, top: (sz.h - D) / 2, transform: [{ rotate: turn(spin) }] }}>
            {FOIL_IMG[main.slice(1)] ? <Image source={FOIL_IMG[main.slice(1)]} style={{ width: D, height: D }} fadeDuration={0} /> : <SvgXml xml={foilXml(main, accent, 300)} width={D} height={D} />}
          </Animated.View>
        )}
      </View>
      <View style={{ borderRadius: radius, overflow: "hidden", backgroundColor: bg }}>{children}</View>
    </View>
  );
}
