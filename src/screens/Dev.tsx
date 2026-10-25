import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, Screen, T } from "../components/ui";
import ModeCard from "../components/ModeCard";
import Avatar from "../components/Avatar";
import { MasterPill } from "../components/MasterFrame";
import { DEV_IDS, DEV_ROLES, DEV_THEMES, DEV_TITLE_DEFS, DEV_BADGE_RULE, MASTER_TEXT } from "../lib/config";
import { useLang, useT } from "../lib/i18n";
import { useDerived } from "../lib/store";

const ICON: Record<string, string> = { frontend: "🎨", backend: "⚙️", fullstack: "🌌" };
export default function DevMode() {
  const t = useT(), lang = useLang((s) => s.lang), nav = useNavigation<any>(), { profile, stats, badges, master } = useDerived();
  const go = (level: string, mode = "normal") => nav.navigate("Play", { level, mode });
  return (
    <Screen title={t("dev_title")} subtitle={t("dev_subtitle")}>
      {badges.length > 0 && (
        <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Avatar name={profile?.username ?? "?"} uri={profile?.avatar} size={56} master={master} />
          <View style={{ flex: 1, gap: 6 }}><T s={12.5} o={0.6}>{t("dev_your_badges")}</T><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{badges.map((b) => <MasterPill key={b.role} role={b.role} active={b.role === master} />)}</View></View>
        </Card>
      )}
      <Card style={{ gap: 6 }}>
        <T s={12.5} o={0.75}>{t("dev_rule_scope")}</T><T s={12.5} o={0.75}>{t("dev_rule_score", { n: DEV_BADGE_RULE.minQ, a: Math.round(DEV_BADGE_RULE.acc * 100) })}</T><T s={12.5} o={0.75}>{t("dev_rule_stack")}</T>
      </Card>
      {DEV_IDS.map((r) => {
        const th = DEV_THEMES[r], role = DEV_ROLES[r], def = DEV_TITLE_DEFS[r], tc = MASTER_TEXT[r];
        const s = stats.find((x) => x.difficulty === r), n = s?.questions_answered ?? 0, c = s?.correct_answers ?? 0, acc = n ? Math.round((c / n) * 100) : 0, got = badges.some((b) => b.role === r);
        return (
          <ModeCard key={r} color={tc} glow={th.glow === "#000000" ? "#2a2338" : th.glow} label={role.label} desc={def.desc[lang]}
            badge={<View style={{ width: 84, height: 84, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: tc + "18", borderWidth: 2, borderColor: tc, marginHorizontal: 4 }}><T s={38}>{ICON[r]}</T></View>}
            tag={got ? <View style={{ borderRadius: 99, backgroundColor: tc, paddingHorizontal: 8, paddingVertical: 2 }}><T b s={9.5} c="#0b0e14">MASTER ✓</T></View> : undefined}
            progress={{ pct: Math.min(100, (n / DEV_BADGE_RULE.minQ) * 100), text: `${def.name} · ${n} ${t("p_questions")} · ${acc}% ${lang === "en" ? "accuracy" : "akurasi"}` }}
            points={`+${role.points} ${t("points")}`} lines={[`+${role.streak.bonus} ${t("streak_bonus_short", { n: role.streak.min })}`, `${t("g_hint")} ∞`, `⏱ ${Math.round(role.timeLimit / 60)} ${t("minutes_short")}`]}
            actions={[{ label: t("g_play"), kind: "primary", onPress: () => go(r) }, { label: t("g_marathon"), onPress: () => go(r, "maraton") }]} />
        );
      })}
    </Screen>
  );
}
