import React, { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Btn, Chip, Screen, T } from "../components/ui";
import TitleBadge from "../components/Badge";
import LangSwitch from "../components/LangSwitch";
import Onboarding from "../components/Onboarding";
import { gateOn } from "../lib/loop";
import { APP_VERSION, LEVEL_IDS, THEMES, TITLE_DEFS } from "../lib/config";
import { useT } from "../lib/i18n";
import { useDerived, useStore } from "../lib/store";
import { C } from "../theme";

const TECH = ["Py", "JS", "Rs", "COB", "0x"];
/** Lencana legendaris bergantian (sama dengan BadgeShowcase di web), dengan fade. */
function Showcase() {
  const t = useT(), [i, setI] = useState(4), fade = useRef(new Animated.Value(1)).current, l = LEVEL_IDS[i];
  useEffect(() => {
    const id = setInterval(() => gateOn() && Animated.timing(fade, { toValue: 0, duration: 260, useNativeDriver: true }).start(() => { setI((x) => (x + 1) % LEVEL_IDS.length); Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }).start(); }), 4200);
    return () => clearInterval(id);
  }, [fade]);
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <T s={10} o={0.5} style={{ letterSpacing: 3, textTransform: "uppercase" }}>{t("land_showcase")}</T><T s={10.5} o={0.4}>{t("badge_tap")}</T>
      <Animated.View style={{ opacity: fade, alignItems: "center" }}>
        <TitleBadge tier="legendary" level={l} tech={TECH[i]} size={280} />
        <T b s={14} c={THEMES[l].main} style={{ marginTop: 2, textShadowColor: THEMES[l].glow, textShadowRadius: 14 }}>{TITLE_DEFS[l].legend}</T>
      </Animated.View>
    </View>
  );
}

export default function Home() {
  const t = useT(), nav = useNavigation<any>(), { profile, meta, total } = useDerived();
  return (
    <Screen tab>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Chip color={C.mint} icon="cloud-offline">{t("offline_badge")}</Chip>
        <LangSwitch />
      </View>
      <View style={{ alignItems: "center", gap: 6, marginTop: 4 }}>
        <T d s={44} c={C.gold} style={{ textShadowColor: "rgba(245,196,81,.45)", textShadowRadius: 22 }}>Kode Tebak</T>
        <T s={14} o={0.7} style={{ textAlign: "center", maxWidth: 320 }}>{t("tagline")}</T>
        {profile && <T s={12.5} c={C.mint} o={0.9}>{t("welcome_back", { name: profile.username })} · {total} {t("points")}</T>}
      </View>
      <Showcase />
      <View style={{ gap: 10 }}>
        <Btn kind="primary" icon="play" label={t("m_start")} onPress={() => nav.navigate("Tabs", { screen: "Game" })} />
        <Btn icon="book" label={t("m_info")} onPress={() => nav.navigate("Info")} />
        <Btn icon="language" label={t("m_settings")} onPress={() => nav.navigate("Settings")} />
        <Btn icon="mail" label={t("m_contact")} onPress={() => nav.navigate("Contact")} />
      </View>
      <T s={11} o={0.4} style={{ textAlign: "center" }}>v{APP_VERSION} · {t("offline_badge")}</T>
      <Onboarding visible={!!profile && !meta.onboardingDone} onDone={() => useStore.getState().setOnboardingDone()} />
    </Screen>
  );
}
