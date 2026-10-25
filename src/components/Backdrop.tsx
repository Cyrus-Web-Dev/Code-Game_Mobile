import React, { memo } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFx } from "../lib/fx";
import { swing, useNativeLoop } from "../lib/loop";
import { STARS_IMG } from "../lib/badge-images";

const TW = [[12, 18, 2.2, 0.8], [78, 9, 1.8, 0.7], [44, 33, 2.6, 0.8], [90, 52, 1.8, 0.6], [24, 68, 2.2, 0.7], [66, 84, 2.4, 0.8]].map(([x, y, s, o]) => ({ x, y, s, o }));
function Star({ x, y, s, o }: (typeof TW)[number]) {
  const fx = useFx(), v = useNativeLoop(3600 + Math.round(x * 40), fx === "full");
  return <Animated.View style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: s, height: s, borderRadius: s, backgroundColor: "#fff", opacity: swing(v, o * 0.3, o + 0.3) }} />;
}
/** Latar gradien + bintang. Bintang statis = SATU gambar PNG (dulu 40 view SVG per layar). */
export default memo(function Backdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={["#120f20", "#1d1836", "#3d2348"]} style={StyleSheet.absoluteFill} />
      <Image source={STARS_IMG} resizeMode="stretch" fadeDuration={0} style={StyleSheet.absoluteFill} />
      {TW.map((s, i) => <Star key={i} {...s} />)}
    </View>
  );
});
