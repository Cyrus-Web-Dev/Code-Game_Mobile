import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Bar, Btn, Card, Chip, Icon, LevelCard, Screen, T } from "../components/ui";
import TitleBadge from "../components/Badge";
import Avatar from "../components/Avatar";
import FoilCard from "../components/Foil";
import ShineText from "../components/ShineText";
import {
  LEVEL_IDS, LEVELS, STARTERS, THEMES, DEV_THEMES, TITLE_DEFS, LEGEND_RULE, STD_RULE, answersNeeded, anyTheme, GOD_IDS, GOD_LEVELS, GOD_TITLE_DEFS,
  DEV_IDS, DEV_TITLE_DEFS, DEV_BADGE_RULE, MASTER_TEXT, type AnyLevel,
} from "../lib/config";
import { useLang, useT } from "../lib/i18n";
import { useDerived, useStore } from "../lib/store";
import { C, al } from "../theme";

type CardT = { key: string; name: string; tier: "starter" | "standard" | "legendary"; level: AnyLevel; desc: string; state: "earned" | "locked" | "current" | "other"; need?: number; have?: number; req?: string; pick?: string; gap?: number };

export default function Titles() {
  const t = useT(), lang = useLang((s) => s.lang), { profile: p, stats, title: cur, owned, badges, master } = useDerived();
  const [msg, setMsg] = useState(""), [open, setOpen] = useState<Set<string>>(new Set([cur.tier === "starter" ? "starter" : cur.level]));
  if (!p) return null;
  const tech = p.favoriteLanguage;
  const stat = (l: string) => { const s = stats.find((x) => x.difficulty === l), n = s?.questions_answered ?? 0, c = s?.correct_answers ?? 0; return { n, c, a: n ? Math.round((c / n) * 100) : 0 }; };
  const has = new Set(owned.map((o) => o.key)), got = (l: AnyLevel) => owned.filter((o) => o.level === l).pop();
  const legCount = LEVEL_IDS.filter((l) => got(l)?.tier === "legendary").length;
  const toggle = (k: string) => setOpen((s) => { const x = new Set(s); x.has(k) ? x.delete(k) : x.add(k); return x; });
  const pick = (key: string | null) => { const ok = useStore.getState().setTitle(key); setMsg(ok ? t("t_picked") : t("err_TITLE_LOCKED")); };
  const pickMaster = (key: string | null) => { const ok = useStore.getState().setMaster(key); setMsg(ok ? t("mf_picked") : t("err_TITLE_LOCKED")); };
  const state = (k: string): CardT["state"] => (has.has(k) ? (cur.key === k ? "current" : "earned") : "locked");

  const starters: CardT[] = Object.entries(STARTERS).map(([k, v]) => ({ key: k, name: v.name, tier: "starter", level: "easy", desc: v.desc[lang], state: cur.key === "starter" && cur.name === v.name ? "current" : p.starter === k ? "earned" : "other", pick: "starter" }));
  const mk = (l: AnyLevel, D: { std: string; legend: string; desc: { id: string; en: string } }, hell: boolean): CardT[] => { const { n, c, a } = stat(l); return [
    { key: l + "s", name: D.std, tier: "standard", level: l, desc: D.desc[lang], state: state(l + ":std"), pick: l + ":std", need: 50, have: n, req: t("t_req_std", { n, a }), gap: answersNeeded(n, c, STD_RULE.minQ, STD_RULE.acc) },
    { key: l + "l", name: D.legend, tier: "legendary", level: l, desc: D.desc[lang], state: state(l + ":legend"), pick: l + ":legend", need: hell ? 5 : 150, have: hell ? legCount : n, req: hell ? t("t_req_sepuh", { k: legCount }) : t("t_req_leg", { n, a }), gap: answersNeeded(n, c, LEGEND_RULE.minQ, LEGEND_RULE.acc) },
  ]; };

  const render = (c: CardT) => {
    const th = anyTheme(c.level), pct = c.need ? Math.min(100, Math.round(((c.have ?? 0) / c.need) * 100)) : 0, isCur = c.state === "current";
    const card = (
      <LevelCard key={c.key} color={th.main} glow={th.glow === "#120821" ? "#4b1d80" : th.glow} style={{ alignItems: "center", gap: 4, borderColor: isCur ? C.gold : al(th.main, 0.38), borderWidth: isCur ? 2 : 1, opacity: c.state === "locked" ? 0.78 : 1 }}>
        <TitleBadge tier={c.tier} level={c.level} tech={tech} size={210} still={c.state === "other"} />
        <T s={10.5} c={th.main} style={{ letterSpacing: 2.5, textTransform: "uppercase" }}>{t("tier_" + c.tier)}</T>
        {c.tier === "legendary" && c.state !== "locked" ? <ShineText color={th.main} glow={th.glow} s={18} style={{ textAlign: "center" }}>{c.name}</ShineText> : <T b s={18} style={{ textAlign: "center", textShadowColor: th.glow, textShadowRadius: 14 }}>{c.name}</T>}
        <T s={13} o={0.7} style={{ textAlign: "center", maxWidth: 300 }}>{c.desc}</T>
        <View style={{ marginTop: 6 }}>
          {c.state === "locked" ? <Chip icon="lock-closed">{t("t_locked")}</Chip> : c.state === "other" ? <Chip color={al(C.paper, 0.6)}>{t("t_other")}</Chip> : c.state === "current" ? <Chip color={C.gold} icon="star">{t("t_current")}</Chip> : <Chip color={C.mint} icon="checkmark">{t("t_earned")}</Chip>}
        </View>
        {c.state === "earned" && c.pick && <Btn small kind="primary" label={t("t_use")} onPress={() => pick(c.pick!)} style={{ marginTop: 6 }} />}
        {c.state === "locked" && c.req && (
          <View style={{ alignSelf: "stretch", marginTop: 8, paddingHorizontal: 6 }}>
            <Bar pct={pct} color={th.main} /><T s={11.5} o={0.6} style={{ marginTop: 4 }}>{c.req}</T>
            {c.key !== "hell:legend" && c.gap !== undefined && <T s={11.5} c={C.gold} style={{ marginTop: 3 }}>{c.gap > 0 ? t("t_gap", { n: c.gap }) : t("t_gap_ok")}</T>}
          </View>
        )}
        {c.state === "locked" && c.key === "hell:legend" && (
          <View style={{ alignSelf: "stretch", marginTop: 8, borderRadius: 10, backgroundColor: "rgba(0,0,0,.25)", padding: 12, gap: 6 }}>
            <T b s={12} c={C.gold}>{t("t_chk_title")}</T>
            {LEVEL_IDS.map((lv) => { const { n, c: cc, a } = stat(lv), ok = n >= LEGEND_RULE.minQ && cc / Math.max(n, 1) >= LEGEND_RULE.acc, done = lv === "hell" ? ok : has.has(lv + ":legend"), gap = answersNeeded(n, cc, LEGEND_RULE.minQ, LEGEND_RULE.acc);
              return <View key={lv} style={{ flexDirection: "row", gap: 8 }}><T s={12} c={done ? C.mint : THEMES[lv].main}>{done ? "✓" : "○"}</T><View style={{ flex: 1 }}><T s={12}><T b s={12} c={THEMES[lv].main}>{LEVELS[lv].label}</T> <T s={12} o={0.7}>{done ? t("t_chk_done") : t("t_chk_row", { n: Math.min(n, 999), a })}</T></T>{!done && <T s={11.5} c={C.gold}>{gap > 0 ? t("t_gap", { n: gap }) : t("t_gap_ok")}</T>}</View></View>; })}
            <T s={10.5} o={0.5}>{t("t_chk_hell")}</T>
          </View>
        )}
      </LevelCard>
    );
    return c.tier === "legendary" && (c.state === "earned" || c.state === "current") ? <FoilCard key={c.key} main={th.main} accent={th.accent} radius={16}>{card}</FoilCard> : card;
  };
  // fungsi biasa (bukan komponen): komponen yang dibuat di dalam render akan di-remount tiap render dan mereset animasi lencana
  const section = ({ id, label, color, children, sub }: { id: string; label: string; color: string; children: React.ReactNode; sub?: string }) => (
    <View key={id} style={{ gap: 12 }}>
      <Pressable onPress={() => toggle(id)} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <T b s={20} c={color}>{label}</T><View style={{ flex: 1, height: 1, backgroundColor: al(color, 0.4) }} /><Icon name={open.has(id) ? "chevron-up" : "chevron-down"} size={18} color={color} />
      </Pressable>
      {sub && open.has(id) ? <T s={12.5} o={0.6}>{sub}</T> : null}
      {open.has(id) && children}
    </View>
  );

  return (
    <Screen tab title={t("t_title")} subtitle={t("t_desc")}>
      <Card glow style={{ backgroundColor: "#2a1d3d", gap: 6 }}>
        <Bar pct={(legCount / 5) * 100} color={C.gold} /><T s={12} c={C.gold}>{t("t_sepuh_banner", { k: legCount })}</T>
        <T s={12} o={0.6}>{t("t_pick_hint")}</T><T s={12} c={C.gold} o={0.9}>{t("t_sepuh_how")}</T><T s={12} o={0.6}>{t("t_rule_leg")}</T>
        {p.selectedTitle ? <Btn small label={t("t_auto")} onPress={() => pick(null)} style={{ marginTop: 6, alignSelf: "flex-start" }} /> : null}
        {!!msg && <T s={13} c={C.gold}>{msg}</T>}
      </Card>

      <View style={{ gap: 4 }}><T b s={20}>{t("mf_title")}</T><T s={12.5} o={0.6}>{t("mf_desc")}</T></View>
      {DEV_IDS.map((r) => {
        const st = stat(r), have = badges.some((b) => b.role === r), active = master === r, tc = MASTER_TEXT[r], pct = Math.min(100, Math.round((st.n / DEV_BADGE_RULE.minQ) * 100));
        return (
          <LevelCard key={r} color={tc} glow={DEV_THEMES[r].glow === "#000000" ? "#2a2338" : DEV_THEMES[r].glow} style={{ alignItems: "center", gap: 4, borderColor: active ? C.gold : al(tc, 0.38), borderWidth: active ? 2 : 1, opacity: have ? 1 : 0.85 }}>
            <View style={{ paddingVertical: 10 }}><Avatar uri={p.avatar} name={p.username} size={76} master={r} /></View>
            <T b s={16} c={tc}>{DEV_TITLE_DEFS[r].name}</T><T s={12.5} o={0.7} style={{ textAlign: "center" }}>{t("mf_" + r)}</T>
            <View style={{ marginTop: 6 }}>{!have ? <Chip icon="lock-closed">{t("mf_locked")}</Chip> : active ? <Chip color={C.gold} icon="star">{t("mf_current")}</Chip> : <Btn small kind="primary" label={t("mf_use")} onPress={() => pickMaster(r)} />}</View>
            {!have && <View style={{ alignSelf: "stretch", marginTop: 8, paddingHorizontal: 6 }}><Bar pct={pct} color={tc} /><T s={11.5} o={0.6} style={{ marginTop: 4 }}>{t("mf_req", { n: Math.min(st.n, DEV_BADGE_RULE.minQ), m: DEV_BADGE_RULE.minQ, a: st.a, r: Math.round(DEV_BADGE_RULE.acc * 100) })}</T></View>}
          </LevelCard>
        );
      })}
      {badges.length > 0 && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {p.selectedMaster != null && <Btn small label={t("mf_auto")} onPress={() => pickMaster(null)} />}
        {p.selectedMaster !== "none" && <Btn small label={t("mf_none")} onPress={() => pickMaster("none")} />}
      </View>}

      {section({ id: "starter", label: t("t_starter"), color: C.mint, children: starters.map(render) })}
      {LEVEL_IDS.map((l) => section({ id: l, label: LEVELS[l].label, color: THEMES[l].main, children: mk(l, TITLE_DEFS[l], l === "hell").map(render) }))}
      {GOD_IDS.map((l) => section({ id: l, label: `${t("god_title")} · ${GOD_LEVELS[l].label}`, color: anyTheme(l).main, children: mk(l, GOD_TITLE_DEFS[l], false).map(render) }))}
    </Screen>
  );
}
