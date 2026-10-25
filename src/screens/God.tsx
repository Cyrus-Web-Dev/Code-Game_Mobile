import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Card, Screen, T } from "../components/ui";
import ModeCard from "../components/ModeCard";
import TitleBadge from "../components/Badge";
import { GOD_IDS, GOD_LEVELS, GOD_THEMES, GOD_TITLE_DEFS } from "../lib/config";
import { useLang, useT } from "../lib/i18n";
import { useDerived } from "../lib/store";

export default function GodMode() {
  const t = useT(), lang = useLang((s) => s.lang), nav = useNavigation<any>(), { profile, stats, owned } = useDerived();
  const go = (level: string, mode = "normal") => nav.navigate("Play", { level, mode });
  return (
    <Screen title={t("god_title")} subtitle={t("god_subtitle")}>
      <Card glow style={{ backgroundColor: "#1a0b2e", gap: 6 }}>
        <T s={12.5} o={0.8}>{t("god_rule_time")}</T><T s={12.5} o={0.8}>{t("god_rule_hint")}</T><T s={12.5} o={0.8}>{t("god_rule_modes")}</T>
      </Card>
      {GOD_IDS.map((l) => {
        const th = GOD_THEMES[l], g = GOD_LEVELS[l], D = GOD_TITLE_DEFS[l];
        const n = stats.find((x) => x.difficulty === l)?.questions_answered ?? 0, need = 150, leg = owned.some((o) => o.level === l && o.tier === "legendary");
        return (
          <ModeCard key={l} color={th.main} glow={th.glow === "#120821" ? "#4b1d80" : th.glow} label={g.label} desc={D.desc[lang]}
            badge={<TitleBadge tier="legendary" level={l} tech={profile?.favoriteLanguage} size={128} />}
            progress={{ pct: Math.min(100, (n / need) * 100), text: `${t("g_legend")}: ${D.legend} ${leg ? "✓" : `· ${Math.min(n, need)}/${need}`}` }}
            points={`+${g.points} ${t("points")}`} lines={[`+${g.streak.bonus} ${t("streak_bonus_short", { n: g.streak.min })}`, `${t("g_hint")} ∞`, `⏱ ${Math.round(g.timeLimit / 60) >= 1 ? `${Math.round(g.timeLimit / 60)} ${t("minutes_short")}` : `${g.timeLimit}s`}`]}
            actions={[{ label: t("g_play"), kind: "primary", onPress: () => go(l) }, { label: t("g_marathon"), onPress: () => go(l, "maraton") }]} />
        );
      })}
    </Screen>
  );
}
