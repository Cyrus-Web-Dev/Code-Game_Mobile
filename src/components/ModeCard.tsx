import React from "react";
import { View } from "react-native";
import { LevelCard, Btn, Bar, T, Icon } from "./ui";
import { C } from "../theme";

type Action = { label: string; kind?: "default" | "primary" | "gold"; icon?: any; onPress: () => void };
/** Kartu tingkat/peran (Easy–Hell, God Mode, Developer Mode): lencana + info + progres + tombol main. */
export default function ModeCard({ color, glow, label, desc, badge, progress, points, lines, actions, tag }: {
  color: string; glow: string; label: string; desc: string; badge: React.ReactNode; tag?: React.ReactNode;
  progress?: { pct: number; text: string }; points: string; lines?: string[]; actions: Action[];
}) {
  return (
    <LevelCard color={color} glow={glow}>
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <View style={{ marginLeft: -6, marginVertical: -6 }}>{badge}</View>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, shadowColor: glow, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }} />
            <T b s={22} c={color} style={{ flexShrink: 1 }}>{label}</T>{tag}
          </View>
          <T s={12} o={0.6}>{desc}</T>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
            <T m b s={15} c={C.gold}>{points}</T>
            {lines?.map((l, i) => <T key={i} m s={10.5} o={0.6}>{l}</T>)}
          </View>
        </View>
      </View>
      {progress && <View style={{ marginTop: 10 }}><Bar pct={progress.pct} color={color} /><T s={10.5} o={0.5} style={{ marginTop: 4 }}>{progress.text}</T></View>}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {actions.map((a, i) => <Btn key={i} small label={a.label} kind={a.kind} icon={a.icon} onPress={a.onPress} />)}
      </View>
    </LevelCard>
  );
}
export { Icon };
