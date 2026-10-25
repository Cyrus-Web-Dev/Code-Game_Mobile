import React from "react";
import { Alert, Switch, View } from "react-native";
import { Btn, Card, Screen, T, Icon } from "../components/ui";
import LangSwitch from "../components/LangSwitch";
import { useT } from "../lib/i18n";
import { useStore } from "../lib/store";
import { APP_VERSION } from "../lib/config";
import { Pressable } from "react-native";
import type { FxMode } from "../lib/engine";
import { C } from "../theme";

export default function Settings() {
  const t = useT(), haptics = useStore((s) => s.save.settings.haptics), fx = useStore((s) => s.save.settings.fx);
  const reset = () => Alert.alert(t("s_reset"), t("s_reset_ask"), [{ text: t("cancel"), style: "cancel" }, { text: t("s_reset_yes"), style: "destructive", onPress: () => useStore.getState().resetAll() }]);
  return (
    <Screen title={t("s_title")} subtitle={t("s_desc")}>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Icon name="language" color={C.mint} size={20} /><T b s={15} style={{ flex: 1 }}>{t("s_lang")}</T><LangSwitch /></View>
      </Card>
      <Card style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Icon name="phone-portrait" color={C.gold} size={20} /><View style={{ flex: 1 }}><T b s={15}>{t("s_haptics")}</T><T s={12} o={0.6}>{t("s_haptics_desc")}</T></View>
        <Switch value={haptics} onValueChange={(v) => useStore.getState().setSetting("haptics", v)} trackColor={{ true: C.mint, false: C.line }} thumbColor={C.paper} />
      </Card>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Icon name="sparkles" color={C.gold} size={20} /><T b s={15}>{t("s_fx")}</T></View>
        <T s={12} o={0.6}>{t("s_fx_desc")}</T>
        <View style={{ flexDirection: "row", gap: 6 }}>{(["auto", "full", "lite", "off"] as FxMode[]).map((m) => <Pressable key={m} onPress={() => useStore.getState().setFx(m)} style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: fx === m ? C.mint : C.line, backgroundColor: fx === m ? "rgba(110,231,200,.12)" : "transparent", paddingVertical: 9, alignItems: "center" }}><T s={12} c={fx === m ? C.mint : C.paper}>{t("fx_" + m)}</T></Pressable>)}</View>
      </Card>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Icon name="shield-checkmark" color={C.mint} size={20} /><T b s={15}>{t("s_data")}</T></View>
        <T s={12.5} o={0.7} style={{ lineHeight: 19 }}>{t("s_data_desc")}</T>
        <Btn kind="danger" icon="trash" label={t("s_reset")} onPress={reset} />
      </Card>
      <Card><T b s={14} c={C.gold}>{t("s_about")}</T><T s={12.5} o={0.7} style={{ marginTop: 4, lineHeight: 19 }}>{t("s_about_text", { v: APP_VERSION })}</T></Card>
    </Screen>
  );
}
