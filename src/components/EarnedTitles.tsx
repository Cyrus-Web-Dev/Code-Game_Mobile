import React from "react";
import { View } from "react-native";
import { Chip, H2, Icon, T } from "./ui";
import TitleBadge from "./Badge";
import FoilCard from "./Foil";
import ShineText from "./ShineText";
import { MasterPill } from "./MasterFrame";
import { anyTheme, earnedDevBadges, ownedTitles, type Current, type Stat } from "../lib/config";
import { useLang, useT } from "../lib/i18n";
import { C, al } from "../theme";

/** SEMUA gelar yang sudah diraih (standar + legendaris tiap tingkat termasuk God Mode, plus gelar Master). Padanan EarnedTitles.tsx di web v2.4. */
export default function EarnedTitles({ stats, current, tech }: { stats: Stat[]; current?: Current | null; tech?: string | null }) {
  const t = useT(), lang = useLang((s) => s.lang);
  const owned = [...ownedTitles(stats)].sort((a, b) => (a.tier === b.tier ? 0 : a.tier === "legendary" ? -1 : 1)), masters = earnedDevBadges(stats), total = owned.length + masters.length;
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}><H2>{t("ot_title")}</H2><Chip color={C.gold}>{t("ot_count", { n: total })}</Chip></View>
      {total === 0 && <T s={13} o={0.6}>{current && current.tier === "starter" ? t("ot_none_starter", { name: current.name }) : t("ot_none")}</T>}
      {masters.length > 0 && (
        <View style={{ gap: 8 }}>
          <T s={11} o={0.5} style={{ letterSpacing: 2, textTransform: "uppercase" }}>{t("ot_master")}</T>
          {masters.map((b) => (
            <View key={b.role} style={{ borderRadius: 12, borderWidth: 1, borderColor: al(b.theme.main, 0.6), backgroundColor: al(b.theme.glow === "#000000" ? "#1a1626" : b.theme.glow, 0.5), padding: 12, gap: 6 }}>
              <View style={{ alignSelf: "flex-start" }}><MasterPill role={b.role} /></View>
              <T s={12} o={0.75}>{b.desc[lang]}</T>
            </View>
          ))}
        </View>
      )}
      {owned.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {owned.map((o) => {
            const th = anyTheme(o.level), isCur = !!current && current.level === o.level && current.tier === o.tier, legend = o.tier === "legendary";
            const inner = (
              <View style={{ padding: 10, alignItems: "center", gap: 3, backgroundColor: al(th.glow === "#000000" ? "#1a1626" : th.glow === "#120821" ? "#4b1d80" : th.glow, 0.27) }}>
                <TitleBadge tier={o.tier} level={o.level} tech={tech} size={118} still />
                <T s={9.5} c={th.main} style={{ letterSpacing: 1.8, textTransform: "uppercase" }}>{t("tier_" + o.tier)}</T>
                {legend ? <View style={{ alignItems: "center" }}><ShineText color={th.main} glow={th.glow} s={13} style={{ textAlign: "center" }}>{o.name}</ShineText></View> : <T b s={13} c={th.main} style={{ textAlign: "center" }}>{o.name}</T>}
                <View style={{ marginTop: 4 }}>{isCur ? <Chip color={C.gold} icon="star">{t("ot_using")}</Chip> : <Chip color={C.mint} icon="checkmark">{t("t_earned")}</Chip>}</View>
              </View>
            );
            return legend
              ? <FoilCard key={o.key} main={th.main} accent={th.accent} radius={12} style={{ width: "48%", flexGrow: 1, borderWidth: isCur ? 2 : 0, borderColor: C.gold }}>{inner}</FoilCard>
              : <View key={o.key} style={{ width: "48%", flexGrow: 1, borderRadius: 12, borderWidth: isCur ? 2 : 1, borderColor: isCur ? C.gold : al(th.main, 0.47), overflow: "hidden" }}>{inner}</View>;
          })}
        </View>
      )}
    </View>
  );
}
export { Icon };
