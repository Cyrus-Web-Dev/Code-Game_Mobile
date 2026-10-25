import React from "react";
import { Animated, View, type StyleProp, type TextStyle } from "react-native";
import { T } from "./ui";
import { useFx } from "../lib/fx";
import { swing, useNativeLoop } from "../lib/loop";

/** Nama gelar legendaris berkilau (setara .name-shine di web): teks asli + lapisan cahaya yang berdenyut (hanya opacity → native). Hanya pada efek Penuh. */
export default function ShineText({ children, color, glow, s = 18, style }: { children: string; color: string; glow: string; s?: number; style?: StyleProp<TextStyle> }) {
  const fx = useFx(), v = useNativeLoop(3000, fx === "full");
  return (
    <View>
      <T b s={s} c={color} style={style}>{children}</T>
      {fx === "full" && (
        <Animated.View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: swing(v, 0, 0.95) }}>
          <T b s={s} c="#ffffff" style={[style, { textShadowColor: glow, textShadowRadius: 14, textShadowOffset: { width: 0, height: 0 } }]}>{children}</T>
        </Animated.View>
      )}
    </View>
  );
}
