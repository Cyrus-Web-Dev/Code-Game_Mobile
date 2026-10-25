import React from "react";
import { View } from "react-native";
import { Card, Icon, Screen, T } from "../components/ui";
import { CONTACT } from "../contact";
import { useT } from "../lib/i18n";
import { C, al } from "../theme";

/** Kontak developer — hanya TEKS (tekan lama untuk menyalin), tanpa tautan/jaringan. */
export default function Contact() {
  const t = useT();
  const rows = [
    { icon: "logo-instagram", label: "Instagram", value: CONTACT.instagram, color: "#E1306C" },
    { icon: "mail", label: t("c_email"), value: CONTACT.email, color: C.gold },
    { icon: "logo-whatsapp", label: "WhatsApp", value: CONTACT.whatsapp, color: "#25D366" },
  ].filter((r) => !!r.value);
  return (
    <Screen title={t("c_title")} subtitle={t("c_desc")}>
      {rows.map((r) => (
        <Card key={r.label} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: al(r.color, 0.15), alignItems: "center", justifyContent: "center" }}><Icon name={r.icon as any} size={20} color={r.color} /></View>
          <View style={{ flex: 1 }}><T s={11.5} o={0.55}>{r.label}</T><T selectable b s={16}>{r.value}</T></View>
        </Card>
      ))}
      <T s={12} o={0.5}>{t("c_offline")}</T>
    </Screen>
  );
}
