import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, Icon, Screen, T, Btn } from "../components/ui";
import ModeCard from "../components/ModeCard";
import TitleBadge from "../components/Badge";
import { LEVELS, LEVEL_IDS, THEMES, TITLE_DEFS } from "../lib/config";
import { hintsFor } from "../lib/engine";
import { useT } from "../lib/i18n";
import { useDerived } from "../lib/store";
import { todayStr } from "../lib/engine";
import { C, al } from "../theme";

export default function Game() {
  const t = useT(), nav = useNavigation<any>(), { save, profile, stats, owned, meta } = useDerived();
  const dailyDone = meta.dailyDoneDate === todayStr();
  const go = (level: string, mode = "normal") => nav.navigate("Play", { level, mode });
  return (
    <Screen tab title={t("g_title")} subtitle={t("g_subtitle")}
      right={meta.streak > 0 ? <View style={{ flexDirection: "row", gap: 5, alignItems: "center", borderRadius: 99, borderWidth: 1, borderColor: al(C.hot, 0.4), backgroundColor: al(C.hot, 0.1), paddingHorizontal: 10, paddingVertical: 4 }}><Icon name="flame" size={14} color={C.hot} /><T s={12} b c={C.hot}>{meta.streak} {t("streak_days")}</T></View> : undefined}>
      {/* Daily Challenge */}
      <Card glow style={{ opacity: dailyDone ? 0.7 : 1, backgroundColor: "#2a1f3d" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icon name="calendar" size={16} color={C.gold} /><T s={11} b c={C.gold} style={{ letterSpacing: 1.6, textTransform: "uppercase" }}>{t("daily_title")}</T></View>
            <T s={12.5} o={0.7}>{t("daily_desc")}</T>
          </View>
          {dailyDone ? <View style={{ borderRadius: 99, backgroundColor: al(C.mint, 0.15), paddingHorizontal: 14, paddingVertical: 8 }}><T s={12} b c={C.mint}>{t("daily_done")}</T></View> : <Btn small kind="gold" label={t("daily_play")} onPress={() => go("easy", "daily")} />}
        </View>
      </Card>

      {LEVEL_IDS.map((l) => {
        const th = THEMES[l], n = stats.find((x) => x.difficulty === l)?.questions_answered ?? 0, need = 150;
        const leg = owned.some((o) => o.level === l && o.tier === "legendary");
        return (
          <ModeCard key={l} color={th.main} glow={th.glow} label={LEVELS[l].label} desc={t("b_" + l)}
            badge={<TitleBadge tier="legendary" level={l} tech={profile?.favoriteLanguage} size={128} />}
            progress={{ pct: Math.min(100, (n / need) * 100), text: `${t("g_legend")}: ${TITLE_DEFS[l].legend.split(" (")[0]} ${leg ? "✓" : `· ${Math.min(n, need)}/${need}`}` }}
            points={`+${LEVELS[l].points} ${t("points")}`} lines={[`${t("g_hint")} ${hintsFor(save, l)}/${LEVELS[l].hints}`]}
            actions={[{ label: t("g_play"), kind: "primary", onPress: () => go(l) }, { label: t("g_marathon"), onPress: () => go(l, "maraton") }, { label: t("g_speedrun"), icon: "flash", onPress: () => go(l, "speedrun") }]} />
        );
      })}

      <Card onPress={() => nav.navigate("God")} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderColor: "rgba(217,70,239,.3)" }}>
        <T s={26}>🛡️</T><View style={{ flex: 1 }}><T b s={15}>{t("god_title")}</T><T s={12.5} o={0.6}>{t("god_subtitle")}</T></View><Icon name="chevron-forward" color={C.line} />
      </Card>
      <Card onPress={() => nav.navigate("Dev")} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderColor: "rgba(239,68,68,.3)" }}>
        <T s={26}>🧑‍💻</T><View style={{ flex: 1 }}><T b s={15}>{t("dev_title")}</T><T s={12.5} o={0.6}>{t("dev_subtitle")}</T></View><Icon name="chevron-forward" color={C.line} />
      </Card>
      <Card onPress={() => nav.navigate("Review")} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Icon name="book" size={22} color={C.mint} /><View style={{ flex: 1 }}><T b s={15}>{t("review_title")}</T><T s={12.5} o={0.6}>{t("review_desc")}</T></View><Icon name="chevron-forward" color={C.line} />
      </Card>
    </Screen>
  );
}
