import React from "react";
import { Pressable, View } from "react-native";
import { T } from "./ui";
import { C } from "../theme";
import { useLang } from "../lib/i18n";
import { haptic } from "../lib/feedback";

/** Tombol bahasa ID / EN. */
export default function LangSwitch() {
  const lang = useLang((s) => s.lang), set = useLang((s) => s.set);
  return (
    <View style={{ flexDirection: "row", borderRadius: 8, borderWidth: 1, borderColor: C.line, overflow: "hidden" }}>
      {(["id", "en"] as const).map((l) => <Pressable key={l} onPress={() => { haptic("tap"); set(l); }} style={{ paddingHorizontal: 12, paddingVertical: 7, backgroundColor: lang === l ? C.mint : "transparent" }}><T m b s={12} c={lang === l ? C.ink : C.paper}>{l.toUpperCase()}</T></Pressable>)}
    </View>
  );
}
