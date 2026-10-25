import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Btn, Card, Chip, T } from "../components/ui";
import Backdrop from "../components/Backdrop";
import LangSwitch from "../components/LangSwitch";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "../lib/i18n";
import { useStore } from "../lib/store";
import { C, F, al } from "../theme";
import langs from "../data/languages.json";

const L = langs as { name: string; level: string | null }[];
const LANGS = L.filter((x) => x.level && x.level !== "normal").map((x) => x.name), FWS = L.filter((x) => x.level === "normal").map((x) => x.name);
const input = { borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, color: C.paper, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, fontFamily: F.sans } as const;

function Suggest({ value, set, pool }: { value: string; set: (v: string) => void; pool: string[] }) {
  const m = useMemo(() => { const q = value.trim().toLowerCase(); return (q ? pool.filter((x) => x.toLowerCase().includes(q) && x.toLowerCase() !== q) : pool).slice(0, 8); }, [value, pool]);
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 6 }}>{m.map((x) => <Pressable key={x} onPress={() => set(x)}><Chip color={C.mint}>{x}</Chip></Pressable>)}</ScrollView>;
}
function Seg<K extends string>({ value, set, opts, label }: { value: K; set: (k: K) => void; opts: K[]; label: (k: K) => string }) {
  return <View style={{ flexDirection: "row", gap: 6 }}>{opts.map((k) => <Pressable key={k} onPress={() => set(k)} style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: value === k ? C.mint : C.line, backgroundColor: value === k ? al(C.mint, 0.12) : "transparent", paddingVertical: 10, alignItems: "center" }}><T s={12.5} b={value === k} c={value === k ? C.mint : C.paper}>{label(k)}</T></Pressable>)}</View>;
}

/** Pengganti Register/Login: profil LOKAL (tanpa kata sandi, tanpa internet). */
export default function Welcome() {
  const t = useT(), ins = useSafeAreaInsets();
  const [name, setName] = useState(""), [lang, setLang] = useState(""), [fw, setFw] = useState("");
  const [skill, setSkill] = useState<"newbie" | "intermediate" | "advanced">("newbie"), [role, setRole] = useState<"frontend" | "backend" | "fullstack">("fullstack"), [err, setErr] = useState("");
  const go = () => {
    if (!/^[A-Za-z0-9_]{2,20}$/.test(name.trim())) return setErr(t("w_err_name"));
    if (!lang.trim() || !fw.trim()) return setErr(t("w_err_fields"));
    useStore.getState().createProfile({ username: name.trim(), favoriteLanguage: lang.trim().slice(0, 40), favoriteFramework: fw.trim().slice(0, 40), skillLevel: skill, role });
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.ink }}>
      <Backdrop />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18, paddingTop: ins.top + 14, paddingBottom: ins.bottom + 30, gap: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><Chip color={C.mint} icon="cloud-offline">{t("offline_badge")}</Chip><LangSwitch /></View>
          <View style={{ alignItems: "center", gap: 6, marginTop: 6 }}><T d s={40} c={C.gold}>Kode Tebak</T><T d s={22}>{t("w_title")}</T><T s={13} o={0.65} style={{ textAlign: "center" }}>{t("w_sub")}</T></View>
          <Card style={{ gap: 14 }}>
            <View style={{ gap: 6 }}><T s={13}>{t("p_name")}</T><TextInput value={name} onChangeText={(v) => { setName(v); setErr(""); }} maxLength={20} autoCapitalize="none" autoCorrect={false} placeholder="king_dev" placeholderTextColor={al(C.paper, 0.35)} style={input} /><T s={11} o={0.45}>{t("w_name_hint")}</T></View>
            <View style={{ gap: 6 }}><T s={13}>{t("fav_lang")}</T><TextInput value={lang} onChangeText={setLang} maxLength={40} placeholder="Python" placeholderTextColor={al(C.paper, 0.35)} style={input} /><Suggest value={lang} set={setLang} pool={LANGS} /></View>
            <View style={{ gap: 6 }}><T s={13}>{t("fav_fw")}</T><TextInput value={fw} onChangeText={setFw} maxLength={40} placeholder="Laravel" placeholderTextColor={al(C.paper, 0.35)} style={input} /><Suggest value={fw} set={setFw} pool={FWS} /></View>
            <View style={{ gap: 6 }}><T s={13}>{t("role")}</T><Seg value={role} set={setRole} opts={["frontend", "backend", "fullstack"]} label={(k) => t("role_" + k)} /></View>
            <View style={{ gap: 6 }}><T s={13}>{t("skill")}</T><Seg value={skill} set={setSkill} opts={["newbie", "intermediate", "advanced"]} label={(k) => t("skill_" + k)} /><T s={11} o={0.5}>{t("starter_note")}</T></View>
            {!!err && <T s={13} c={C.hot}>{err}</T>}
            <Btn kind="primary" icon="rocket" label={t("w_create")} onPress={go} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
