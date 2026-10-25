import React, { useState } from "react";
import { View } from "react-native";
import { Btn, T } from "./ui";
import { THEMES, isPlayable, playLabel, playTheme } from "../lib/config";
import { useLang, useT } from "../lib/i18n";
import { useStore } from "../lib/store";
import { C, al } from "../theme";

const PAGE = 15;
/** Riwayat permainan lokal (100 terakhir). */
export default function GameHistory() {
  const t = useT(), lang = useLang((s) => s.lang), rows = useStore((s) => s.save.history), [n, setN] = useState(0);
  const fmt = (iso: string) => new Date(iso).toLocaleString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const dur = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
  if (!n) return <Btn label={t("h_show")} icon="time" onPress={() => setN(PAGE)} />;
  return (
    <View style={{ gap: 8 }}>
      {rows.length === 0 && <T s={13} o={0.6}>{t("h_empty")}</T>}
      {rows.slice(0, n).map((r, i) => {
        const th = isPlayable(r.difficulty) ? playTheme(r.difficulty) : THEMES.easy, acc = r.total ? Math.round((r.correct / r.total) * 100) : 0;
        return (
          <View key={r.started_at + i} style={{ flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, borderColor: al(th.main, 0.27), backgroundColor: al(C.panel, 0.7), padding: 10 }}>
            <T b s={11} c={th.main} style={{ width: 62, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>{isPlayable(r.difficulty) ? playLabel(r.difficulty) : r.difficulty}</T>
            <View style={{ flex: 1 }}>
              <T s={13}><T b s={13}>{t("mode_" + (r.mode || "normal"))}</T> <T s={12} o={0.5}>· {fmt(r.started_at)}{r.secs > 0 ? ` · ${t("h_dur")} ${dur(r.secs)}` : ""}</T></T>
              <T s={11.5} o={0.6}>{r.correct}/{r.total} {t("h_correct")} · {acc}%</T>
            </View>
            <View style={{ alignItems: "flex-end" }}><T m b s={14} c={C.gold}>{r.score}</T><T s={10} c={r.status === "finished" ? C.mint : C.hot}>{r.status === "finished" ? t("h_finished") : t("h_quit")}</T></View>
          </View>
        );
      })}
      {n < rows.length && <Btn small label={t("h_more")} onPress={() => setN(n + PAGE)} />}
    </View>
  );
}
