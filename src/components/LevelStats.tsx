import React from "react";
import { View } from "react-native";
import { LevelCard, T } from "./ui";
import { RANK_GROUPS, rankLabel, rankTheme } from "../lib/config";
import { useT } from "../lib/i18n";
import type { StatRow } from "../lib/engine";
import { C } from "../theme";

/** Statistik per tingkat (Easy–Hell, God Mode, Developer Mode). Versi offline dari kartu "Peringkat per tingkat" di web
 *  (peringkat antar-pemain butuh server, jadi diganti poin pribadi + akurasi). */
export default function LevelStats({ stats }: { stats: Record<string, StatRow> }) {
  const t = useT(), labels = { classic: t("lr_group_classic"), god: t("lr_group_god"), dev: t("lr_group_dev") };
  return (
    <View style={{ gap: 16 }}>
      {RANK_GROUPS.map((g) => (
        <View key={g.key} style={{ gap: 8 }}>
          <T b s={12} o={0.6} style={{ letterSpacing: 0.6 }}>{labels[g.key]}</T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {g.ids.map((l) => {
              const s = stats[l], th = rankTheme(l), n = s?.questions_answered ?? 0, acc = n ? Math.round((s!.correct_answers / n) * 100) : 0;
              return (
                <LevelCard key={l} color={th.main} glow={th.glow === "#000000" ? "#2a2338" : th.glow === "#120821" ? "#4b1d80" : th.glow} style={{ width: "31.5%", flexGrow: 1, padding: 10, alignItems: "center" }}>
                  <T b s={11} c={th.main} style={{ letterSpacing: 1.4, textTransform: "uppercase" }}>{rankLabel(l)}</T>
                  {n ? <><T m b s={20} c={C.gold} style={{ marginTop: 4 }}>{s!.points}</T><T s={10} o={0.5}>{t("points")}</T><T s={10.5} o={0.7} style={{ marginTop: 2 }}>{n} {t("p_questions")} · {acc}%</T></> : <T s={11} o={0.4} style={{ marginTop: 10 }}>{t("lr_none")}</T>}
                </LevelCard>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
