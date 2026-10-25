import React, { useState } from "react";
import { Modal, View } from "react-native";
import { Btn, Icon, T } from "./ui";
import { C, al } from "../theme";
import { useT } from "../lib/i18n";

const STEPS = [{ icon: "code-slash", key: "ob_1" }, { icon: "trophy", key: "ob_2" }, { icon: "flame", key: "ob_3" }, { icon: "sparkles", key: "ob_4" }] as const;
/** Tutorial 4 langkah (sama dengan web), tampil sekali setelah profil dibuat. */
export default function Onboarding({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const t = useT(), [i, setI] = useState(0), S = STEPS[i], last = i === STEPS.length - 1;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View style={{ flex: 1, backgroundColor: "rgba(8,6,16,.88)", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <View style={{ width: "100%", maxWidth: 420, borderRadius: 22, borderWidth: 1, borderColor: al(C.gold, 0.35), backgroundColor: C.panel, padding: 24, alignItems: "center", gap: 14 }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: al(C.mint, 0.12), borderWidth: 1, borderColor: al(C.mint, 0.5), alignItems: "center", justifyContent: "center" }}><Icon name={S.icon} size={34} color={C.mint} /></View>
          <T d s={24} c={C.gold} style={{ textAlign: "center" }}>{t(S.key + "_title")}</T>
          <T s={14.5} o={0.78} style={{ textAlign: "center", lineHeight: 21 }}>{t(S.key + "_desc")}</T>
          <View style={{ flexDirection: "row", gap: 6, marginVertical: 4 }}>{STEPS.map((_, k) => <View key={k} style={{ width: k === i ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: k === i ? C.mint : C.line }} />)}</View>
          <View style={{ width: "100%", gap: 8 }}>
            <Btn kind="primary" label={last ? t("ob_start") : t("next")} onPress={() => (last ? onDone() : setI(i + 1))} />
            {!last && <Btn label={t("ob_skip")} onPress={onDone} />}
          </View>
        </View>
      </View>
    </Modal>
  );
}
