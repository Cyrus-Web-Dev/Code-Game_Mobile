import React, { useEffect, useRef, useState } from "react";
import { Pressable, Share, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Bar, Btn, Card, H2, Icon, LevelCard, Screen, T } from "../components/ui";
import TitleBadge from "../components/Badge";
import Avatar from "../components/Avatar";
import Confetti from "../components/Confetti";
import GameHistory from "../components/GameHistory";
import LevelStats from "../components/LevelStats";
import EarnedTitles from "../components/EarnedTitles";
import { MasterCard, MasterPill } from "../components/MasterFrame";
import { ACHIEVEMENTS, LEVEL_IDS, LEVELS, THEMES, TITLE_DEFS, anyTheme, type AchievementId } from "../lib/config";
import { hintsFor } from "../lib/engine";
import { useLang, useT } from "../lib/i18n";
import { useDerived, useStore } from "../lib/store";
import { C, F, al } from "../theme";

const input = { borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, color: C.paper, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: F.sans } as const;
const Stat = ({ icon, v, label, color }: { icon: any; v: string | number; label: string; color: string }) => <View style={{ flex: 1, borderRadius: 12, backgroundColor: "rgba(0,0,0,.25)", padding: 8, alignItems: "center" }}><Icon name={icon} size={16} color={color} /><T m s={17} c={color}>{v}</T><T s={10} o={0.5}>{label}</T></View>;

export default function Profile() {
  const t = useT(), lang = useLang((s) => s.lang), nav = useNavigation<any>(), { save, profile: p, stats, title: ti, owned, badges, master, total, meta } = useDerived();
  const [e, setE] = useState({ username: p?.username ?? "", fl: p?.favoriteLanguage ?? "", ff: p?.favoriteFramework ?? "", role: p?.role ?? "fullstack", skill: p?.skillLevel ?? "newbie", avatar: p?.avatar ?? null as string | null });
  const [msg, setMsg] = useState(""), [party, setParty] = useState(false), seen = useRef(false);
  useEffect(() => { // rayakan saat gelar naik (setara confetti di web)
    const key = `${ti.tier}:${ti.name}`;
    AsyncStorage.getItem("kt_title").then((old) => { if (!seen.current && old && old !== key && ti.tier !== "starter") setParty(true); seen.current = true; AsyncStorage.setItem("kt_title", key).catch(() => {}); }).catch(() => {});
  }, [ti.tier, ti.name]);
  if (!p) return null;
  const th = anyTheme(ti.level), totalQ = stats.reduce((a, s) => a + s.questions_answered, 0);
  const pickPhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.35, base64: true });
    if (r.canceled || !r.assets?.[0]?.base64) return;
    const uri = `data:image/jpeg;base64,${r.assets[0].base64}`;
    if (uri.length > 260_000) return setMsg(t("p_photo_big"));
    setE((x) => ({ ...x, avatar: uri }));
  };
  const saveProfile = () => {
    if (!/^[A-Za-z0-9_]{2,20}$/.test(e.username.trim())) return setMsg(t("w_err_name"));
    if (!e.fl.trim() || !e.ff.trim()) return setMsg(t("w_err_fields"));
    useStore.getState().updateProfile({ username: e.username.trim(), favoriteLanguage: e.fl.trim().slice(0, 40), favoriteFramework: e.ff.trim().slice(0, 40), role: e.role, skillLevel: e.skill, avatar: e.avatar }); setMsg(t("saved"));
  };
  const shareProfile = () => Share.share({ message: `🏆 ${p.username} — ${ti.name}\n${total} ${t("points")} · ${totalQ} ${t("p_questions")} · 🔥 ${meta.streak}\n${badges.map((b) => b.name).join(" ")}\nKode Tebak` }).catch(() => {});
  const chip = (k: string, v: string) => <View key={k} style={{ flexDirection: "row", gap: 5, borderRadius: 99, borderWidth: 1, borderColor: "rgba(255,255,255,.14)", backgroundColor: "rgba(255,255,255,.05)", paddingHorizontal: 10, paddingVertical: 4 }}><T s={11} o={0.5}>{k}</T><T s={11} b>{v || "-"}</T></View>;
  return (
    <Screen tab>
      {party && <Confetti />}
      <MasterCard role={master} radius={18}>
        <View style={{ borderRadius: 18, borderWidth: master ? 0 : 1, borderColor: al(th.main, 0.53), backgroundColor: al(th.glow === "#000000" ? "#1a1626" : th.glow, 0.33), padding: 16, gap: 14, alignItems: "center" }}>
          <TitleBadge tier={ti.tier} level={ti.level} tech={p.favoriteLanguage} size={290} />
          <View style={{ alignSelf: "stretch", gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Avatar uri={p.avatar} name={p.username} size={60} master={master} />
              <View style={{ flex: 1 }}><T d s={28}>{p.username}</T><T s={11} c={th.main} style={{ letterSpacing: 2.5, textTransform: "uppercase" }}>{t("tier_" + ti.tier)}</T></View>
            </View>
            {badges.length > 0 && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{badges.map((b) => <MasterPill key={b.role} role={b.role} active={b.role === master} />)}</View>}
            <View><T s={11.5} o={0.6}>{t("p_title_label")}</T><T b s={22} c={th.main} style={{ lineHeight: 28, textShadowColor: th.glow, textShadowRadius: 16 }}>{ti.name}</T><T s={13.5} o={0.75} style={{ marginTop: 3 }}>{ti.desc[lang]}</T></View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{chip(t("p_role"), t("role_" + p.role))}{chip(t("p_fav_lang"), p.favoriteLanguage)}{chip(t("p_fav_fw"), p.favoriteFramework)}{chip(t("p_skill"), t("skill_" + p.skillLevel))}</View>
            <View style={{ flexDirection: "row", gap: 8 }}><Stat icon="trophy" v={total} label={t("points")} color={C.gold} /><Stat icon="help-circle" v={totalQ} label={t("p_questions")} color={C.mint} /><Stat icon="flame" v={meta.streak} label={t("streak_days")} color={C.hot} /></View>
            <Pressable onPress={() => nav.navigate("Tabs", { screen: "Titles" })}><T s={13.5} c={C.mint} style={{ textDecorationLine: "underline" }}>{t("p_all_titles")}</T></Pressable>
          </View>
        </View>
      </MasterCard>

      <EarnedTitles stats={stats} current={ti} tech={p.favoriteLanguage} />

      <View style={{ gap: 10 }}><H2>{t("p_level_stats")}</H2><LevelStats stats={save.stats} /></View>

      <View style={{ gap: 10 }}>
        <H2>{t("p_next")}</H2>
        {LEVEL_IDS.map((l) => {
          const s = stats.find((x) => x.difficulty === l), n = s?.questions_answered ?? 0, acc = n ? Math.round((s!.correct_answers / n) * 100) : 0, c = THEMES[l], got = owned.filter((o) => o.level === l).pop();
          return (
            <LevelCard key={l} color={c.main} glow={c.glow} style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 14, rowGap: 2 }}>
                <T m b s={16} c={c.main} style={{ width: 74 }}>{LEVELS[l].label}</T>
                <T m s={12}>{s?.games_played ?? 0} {t("p_games")}</T><T m s={12}>{n} {t("p_questions")}</T><T m s={12}>{t("p_accuracy")} {acc}%</T><T m s={12} c={C.gold}>{s?.points ?? 0} {t("points")}</T><T m s={12} o={0.5}>{t("p_hints")}: {hintsFor(save, l)}/{LEVELS[l].hints}</T>
              </View>
              <View><Bar pct={(n / 50) * 100} color={c.main} /><T s={11} o={0.6} style={{ marginTop: 3 }}>{t("p_prog_std", { n: Math.min(n, 50) })} · {TITLE_DEFS[l].std}</T></View>
              <View><Bar pct={(n / 150) * 100} color={c.main} /><T s={11} o={0.6} style={{ marginTop: 3 }}>{t("p_prog_leg", { n: Math.min(n, 150) })} · {TITLE_DEFS[l].legend.split(" (")[0]}</T></View>
              {got && <T b s={13.5} c={c.main}>★ {got.name}</T>}
            </LevelCard>
          );
        })}
      </View>

      <View style={{ gap: 10 }}>
        <H2>{t("p_ach")}</H2>
        {(Object.keys(ACHIEVEMENTS) as AchievementId[]).map((id) => {
          const a = ACHIEVEMENTS[id], on = meta.achievements.includes(id);
          return <View key={id} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, borderColor: on ? al(C.gold, 0.5) : C.line, backgroundColor: on ? al(C.gold, 0.1) : al(C.panel, 0.6), padding: 12, opacity: on ? 1 : 0.6 }}><T s={26}>{a.icon}</T><View style={{ flex: 1 }}><T b s={13.5}>{a.name[lang]}</T><T s={12} o={0.6}>{a.desc[lang]}</T></View></View>;
        })}
      </View>

      <View style={{ gap: 10 }}><H2>{t("h_title")}</H2><GameHistory /></View>

      <Card style={{ gap: 12 }}>
        <H2>{t("p_edit")}</H2>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Avatar uri={e.avatar} name={e.username || "?"} size={64} />
          <View style={{ flex: 1, gap: 8 }}><Btn small icon="image" label={t("p_change_photo")} onPress={pickPhoto} />{!!e.avatar && <Btn small kind="danger" label={t("p_remove_photo")} onPress={() => setE({ ...e, avatar: null })} />}</View>
        </View>
        <View style={{ gap: 5 }}><T s={13}>{t("p_name")}</T><TextInput value={e.username} onChangeText={(v) => setE({ ...e, username: v })} maxLength={20} autoCapitalize="none" style={input} /></View>
        <View style={{ gap: 5 }}><T s={13}>{t("fav_lang")}</T><TextInput value={e.fl} onChangeText={(v) => setE({ ...e, fl: v })} maxLength={40} style={input} /></View>
        <View style={{ gap: 5 }}><T s={13}>{t("fav_fw")}</T><TextInput value={e.ff} onChangeText={(v) => setE({ ...e, ff: v })} maxLength={40} style={input} /></View>
        <View style={{ gap: 5 }}><T s={13}>{t("role")}</T><View style={{ flexDirection: "row", gap: 6 }}>{(["frontend", "backend", "fullstack"] as const).map((k) => <Pressable key={k} onPress={() => setE({ ...e, role: k })} style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: e.role === k ? C.mint : C.line, backgroundColor: e.role === k ? al(C.mint, 0.12) : "transparent", paddingVertical: 9, alignItems: "center" }}><T s={12} c={e.role === k ? C.mint : C.paper}>{t("role_" + k)}</T></Pressable>)}</View></View>
        <View style={{ gap: 5 }}><T s={13}>{t("skill")}</T><View style={{ flexDirection: "row", gap: 6 }}>{(["newbie", "intermediate", "advanced"] as const).map((k) => <Pressable key={k} onPress={() => setE({ ...e, skill: k })} style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: e.skill === k ? C.mint : C.line, backgroundColor: e.skill === k ? al(C.mint, 0.12) : "transparent", paddingVertical: 9, alignItems: "center" }}><T s={12} c={e.skill === k ? C.mint : C.paper}>{t("skill_" + k)}</T></Pressable>)}</View></View>
        <View style={{ flexDirection: "row", gap: 8 }}><Btn flex kind="primary" label={t("save")} onPress={saveProfile} /><Btn flex icon="share-social" label={t("p_share")} onPress={shareProfile} /></View>
        {!!msg && <T s={13} c={C.mint}>{msg}</T>}
      </Card>
    </Screen>
  );
}
