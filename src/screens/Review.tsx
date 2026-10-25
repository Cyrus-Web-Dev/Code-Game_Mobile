import React, { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Card, Icon, Screen, T } from "../components/ui";
import CodeBlock from "../components/CodeBlock";
import { THEMES, isPlayable, playTheme } from "../lib/config";
import { questionByKey, parseKey } from "../lib/bank";
import { useLang, useT } from "../lib/i18n";
import { useStore } from "../lib/store";
import { C, al } from "../theme";

/** Ulangi soal yang pernah salah (dari penyimpanan lokal; jawaban benar berikutnya otomatis menghapusnya). */
export default function Review() {
  const t = useT(), lang = useLang((s) => s.lang), wrong = useStore((s) => s.save.wrong), [open, setOpen] = useState<string | null>(null);
  const items = useMemo(() => Object.entries(wrong).sort((a, b) => b[1].at.localeCompare(a[1].at)).map(([key, w]) => ({ key, w, q: questionByKey(key), level: parseKey(key).level })).filter((x) => x.q).slice(0, 60), [wrong]);
  return (
    <Screen tab title={t("review_title")} subtitle={t("review_desc")}>
      {!items.length ? (
        <Card style={{ alignItems: "center", paddingVertical: 36, gap: 6 }}><Icon name="checkmark-done" size={34} color={C.mint} /><T s={17} o={0.8}>{t("review_empty")}</T><T s={12.5} o={0.5} style={{ textAlign: "center" }}>{t("review_empty_hint")}</T></Card>
      ) : items.map(({ key, w, q, level }) => {
        const th = isPlayable(level) ? playTheme(level) : THEMES.easy, isOpen = open === key, opts = lang === "en" ? q!.oe ?? q!.o : q!.o;
        return (
          <Card key={key} onPress={() => setOpen(isOpen ? null : key)} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: th.main, marginTop: 5 }} />
              <View style={{ flex: 1 }}><T b s={13.5} style={{ lineHeight: 19 }}>{(lang === "en" ? q!.pe ?? q!.p : q!.p)}</T><T s={11.5} o={0.5} style={{ textTransform: "capitalize", marginTop: 3 }}>{level}</T></View>
              <Icon name="close" size={16} color={C.hot} />
            </View>
            {isOpen && (
              <View style={{ gap: 10, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 12 }}>
                <CodeBlock code={q!.c} lang={q!.l} />
                {opts.map((o, i) => { const ok = i === q!.a, bad = i === w.chosen && !ok; return (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, borderColor: ok ? C.mint : bad ? C.hot : C.line, backgroundColor: ok ? al(C.mint, 0.12) : bad ? al(C.hot, 0.1) : "transparent", padding: 10, opacity: ok || bad ? 1 : 0.5 }}>
                    {ok && <Icon name="checkmark" size={14} color={C.mint} />}{bad && <Icon name="close" size={14} color={C.hot} />}<T s={13} c={ok ? C.mint : bad ? C.hot : C.paper} style={{ flex: 1 }}>{o}</T></View>
                ); })}
                {!!(lang === "en" ? q!.xe ?? q!.x : q!.x) && <T s={13} o={0.75} style={{ backgroundColor: al(C.ink, 0.5), borderRadius: 10, padding: 12, lineHeight: 19 }}>{lang === "en" ? q!.xe ?? q!.x : q!.x}</T>}
              </View>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}
