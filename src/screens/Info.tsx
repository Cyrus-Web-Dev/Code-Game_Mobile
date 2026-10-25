import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Card, Icon, Screen, T } from "../components/ui";
import CodeBlock from "../components/CodeBlock";
import { LEVELS, LEVEL_IDS, GOD_LEVELS, GOD_THEMES, DEV_BADGE_RULE, DEV_QUESTIONS_PER_ROLE, type GodLevel, type DevRole } from "../lib/config";
import { MasterPill } from "../components/MasterFrame";
import { KINDS, type Kind } from "../lib/learn";
import { useLang, useT } from "../lib/i18n";
import { C, F, al } from "../theme";
import data from "../data/languages.json";
import detailData from "../data/languages-detail.json";
import secData from "../data/security-tools.json";
import extraData from "../data/security-extra.json";
import rolesData from "../data/roles.json";

type Item = { name: string; year: number; level: string | null; note: string; noteEn?: string };
type Detail = { kind: Kind; run?: string; site?: string; ex?: string; hl?: string };
type L2 = { id: string; en: string };
type Tool = { name: string; group: string; cat: string; purpose: L2; goal?: L2; use: L2; cmd: string; tip: L2; site: string; tier?: GodLevel };
type Extra = { legacy: Record<string, string>; groups: Record<string, L2>; tools: Tool[] };
type Role = { id: DevRole; icon: string; color: string; name: L2; tagline: L2; what: L2; does: L2[]; skills: string[]; tools: string[]; day: L2[]; path: L2[]; pitfalls: L2[]; security: L2[]; secTools: string[]; master: L2 };
type RolesData = { roles: Role[]; compare: { row: L2; frontend: L2; backend: L2; fullstack: L2 }[]; faq: { q: L2; a: L2 }[] };
const ERAS: [number, number][] = [[0, 1969], [1970, 1979], [1980, 1989], [1990, 1999], [2000, 2009], [2010, 9999]];
const ALL_TOOLS: Tool[] = [...(secData as unknown as Tool[]).map((x) => ({ ...x, group: extraData.legacy[x.name as keyof typeof extraData.legacy] ?? "offense" })), ...(extraData.tools as unknown as Tool[])];
const items = data as Item[], details = detailData as unknown as Record<string, Detail>;
const box = { borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, color: C.paper, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: F.sans } as const;
const Pill = ({ on, label, color = C.mint, onPress }: { on: boolean; label: string; color?: string; onPress: () => void }) => <Pressable onPress={onPress} style={{ borderRadius: 9, borderWidth: 1, borderColor: on ? color : C.line, backgroundColor: on ? al(color, 0.1) : "transparent", paddingHorizontal: 12, paddingVertical: 7 }}><T s={12.5} c={on ? color : C.paper}>{label}</T></Pressable>;
const H3 = ({ children, color = C.gold }: { children: React.ReactNode; color?: string }) => <T b s={13} c={color} style={{ marginBottom: 4 }}>{children}</T>;

function Languages() {
  const t = useT(), lang = useLang((s) => s.lang), [q, setQ] = useState(""), [f, setF] = useState("all"), [open, setOpen] = useState<Set<string>>(new Set());
  const note = (i: Item) => (lang === "en" ? i.noteEn ?? i.note : i.note);
  const list = useMemo(() => items.filter((i) => (f === "all" || (f === "extra" ? i.level === null : i.level === f)) && (i.name + " " + note(i)).toLowerCase().includes(q.toLowerCase())), [q, f, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (n: string) => setOpen((s) => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; });
  return (
    <View style={{ gap: 14 }}>
      <T s={13.5} o={0.7}>{t("i_sub", { n: items.length, g: items.filter((i) => i.level).length })}</T><T s={12.5} c={C.mint} o={0.8}>{t("i_click_hint")}</T>
      <TextInput value={q} onChangeText={setQ} placeholder={t("i_search")} placeholderTextColor={al(C.paper, 0.35)} style={box} autoCorrect={false} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>{["all", ...LEVEL_IDS, "extra"].map((k) => <Pill key={k} on={f === k} onPress={() => setF(k)} label={k === "all" ? t("i_all") : k === "extra" ? t("i_extra") : LEVELS[k as keyof typeof LEVELS].label} />)}</ScrollView>
      {list.length === 0 && <T o={0.7}>{t("i_none")}</T>}
      {ERAS.map(([a, b], idx) => {
        const rows = list.filter((i) => i.year >= a && i.year <= b); if (!rows.length) return null;
        return (
          <View key={a} style={{ gap: 8 }}>
            <T b s={18} c={C.mint} style={{ borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 4 }}>{t("era" + idx)}</T>
            {rows.map((i) => {
              const isOpen = open.has(i.name), d = details[i.name], K = d ? KINDS[d.kind] : null;
              return (
                <Card key={i.name} onPress={() => toggle(i.name)} style={{ padding: 12, gap: 8, borderColor: isOpen ? al(C.mint, 0.6) : C.line }}>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                    <T m b s={14} c={C.gold} style={{ flexShrink: 1 }}>{i.name}</T><T s={11.5} o={0.55}>{i.year}</T><View style={{ flex: 1 }} />
                    {i.level && <T s={11.5} c={C.mint}>{LEVELS[i.level as keyof typeof LEVELS].label}</T>}<Icon name={isOpen ? "chevron-up" : "chevron-down"} size={14} color={al(C.paper, 0.5)} style={{ alignSelf: "center" }} />
                  </View>
                  <T s={13} o={0.8}>{note(i)}</T>
                  {isOpen && d && K && (
                    <View style={{ gap: 12, borderTopWidth: 1, borderTopColor: al(C.line, 0.7), paddingTop: 12 }}>
                      <T s={13}><T s={13} o={0.5}>{t("i_kind")}: </T><T b s={13} c={C.mint}>{K.label[lang]}</T></T>
                      {!!d.ex && <View><H3>{t("i_example")}</H3><CodeBlock code={d.ex} lang={d.hl} size={12} selectable /></View>}
                      <View><H3>{t("i_run")}</H3>{d.run ? <View style={{ backgroundColor: "rgba(0,0,0,.4)", borderRadius: 8, padding: 10 }}><T selectable m s={12}>{d.run}</T></View> : <T s={13} o={0.7}>{t("i_run_none")}</T>}</View>
                      <View>
                        <H3>{t("i_learn")}</H3>
                        {K.steps[lang].map((st, k) => <T key={k} s={13} o={0.85} style={{ marginBottom: 3, lineHeight: 19 }}>{k + 1}. {st}</T>)}
                        {!!d.site && <T s={12.5} style={{ marginTop: 8 }} o={0.7}>{t("i_site")}: <T selectable s={12.5} c={C.mint}>{d.site.split("/")[0]}</T></T>}
                        <T s={12.5} o={0.6} style={{ marginTop: 4 }}>{t("i_tip")}: <T s={12.5} o={0.8} style={{ fontStyle: "italic" }}>&quot;{i.name} {lang === "id" ? "tutorial pemula" : "beginner tutorial"}&quot;</T></T>
                      </View>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const COLOR: Record<string, string> = { defense: "#22e58a", appsec: "#3da5ff", crypto: "#f5c451", network: "#38d6d6", forensic: "#c084fc", cloud: "#8ab4ff", offense: "#ff5a3d", concept: "#9ca3af", debug: "#ff9ec4" };
const ORDER = ["defense", "appsec", "crypto", "network", "forensic", "cloud", "concept", "debug", "offense"];
const GROUPS = (extraData as unknown as Extra).groups;
const STAGES: { k: string; id: string; en: string; g: string[] }[] = [
  { k: "code", id: "Menulis kode", en: "Write code", g: ["appsec", "debug"] }, { k: "build", id: "Build & rilis", en: "Build & release", g: ["appsec", "crypto"] },
  { k: "deploy", id: "Deploy", en: "Deploy", g: ["network", "cloud", "crypto"] }, { k: "run", id: "Berjalan di produksi", en: "Run in production", g: ["defense", "network"] },
  { k: "respond", id: "Respons insiden", en: "Incident response", g: ["forensic", "defense"] },
];
const SX = {
  sub: { id: "Ensiklopedia {n} tools, standar, dan konsep keamanan: fungsi, kapan dipakai, cara pemakaian, contoh perintah, dan tips. Dari pertahanan sampai pentest.", en: "An encyclopedia of {n} security tools, standards, and concepts: what each does, when to use it, how to use it, sample commands, and tips. From defense to pentesting." },
  warnT: { id: "Gunakan secara etis & legal", en: "Use ethically & legally" },
  warn: { id: "Pindai atau uji HANYA sistem milik sendiri atau yang Anda punya izin tertulis untuk menguji. Mengakses sistem tanpa izin dapat melanggar hukum (di Indonesia, mis. UU ITE). Contoh perintah memakai alamat fiktif.", en: "Scan or test ONLY systems you own or have written permission to test. Accessing systems without permission can be illegal. Example commands use fictional addresses." },
  stage: { id: "Tools apa dipakai di tahap mana?", en: "Which tools fit which stage?" }, goal: { id: "Tujuan penggunaan", en: "Why / when to use it" }, how: { id: "Cara pemakaian", en: "How to use it" },
};

function Security({ initialQuery = "" }: { initialQuery?: string }) {
  const t = useT(), lang = useLang((s) => s.lang), [q, setQ] = useState(initialQuery), [g, setG] = useState("all"), [open, setOpen] = useState<Set<string>>(new Set(initialQuery ? [initialQuery] : []));
  useEffect(() => { if (initialQuery) { setQ(initialQuery); setG("all"); setOpen(new Set([initialQuery])); } }, [initialQuery]);
  const list = useMemo(() => ALL_TOOLS.filter((i) => (g === "all" || i.group === g) && (i.name + " " + i.cat + " " + i.purpose[lang]).toLowerCase().includes(q.toLowerCase())), [q, g, lang]);
  const toggle = (n: string) => setOpen((s) => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; });
  const count = (k: string) => ALL_TOOLS.filter((x) => x.group === k).length;
  return (
    <View style={{ gap: 14 }}>
      <T s={13.5} o={0.7}>{SX.sub[lang].replace("{n}", String(ALL_TOOLS.length))}</T>
      <View style={{ flexDirection: "row", gap: 10, borderRadius: 12, borderWidth: 1, borderColor: al(C.gold, 0.4), backgroundColor: al(C.gold, 0.1), padding: 12 }}>
        <Icon name="shield-half" size={18} color={C.gold} /><View style={{ flex: 1 }}><T b s={13} c={C.gold}>{SX.warnT[lang]}</T><T s={12.5} o={0.85} style={{ marginTop: 2, lineHeight: 18 }}>{SX.warn[lang]}</T></View>
      </View>
      <View style={{ gap: 6 }}>
        <T s={10.5} o={0.5} style={{ letterSpacing: 2, textTransform: "uppercase" }}>{SX.stage[lang]}</T>
        {STAGES.map((s, i) => (
          <View key={s.k} style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: al(C.panel, 0.7), padding: 8 }}>
            <T b s={12} c={C.mint} style={{ width: 130 }}>{i + 1}. {lang === "en" ? s.en : s.id}</T>
            {s.g.map((k) => <Pressable key={k} onPress={() => setG(k)} style={{ borderRadius: 99, borderWidth: 1, borderColor: COLOR[k] + "88", paddingHorizontal: 8, paddingVertical: 2 }}><T s={10.5} c={COLOR[k]}>{GROUPS[k]?.[lang] ?? k}</T></Pressable>)}
          </View>
        ))}
      </View>
      <TextInput value={q} onChangeText={setQ} placeholder={t("i_search")} placeholderTextColor={al(C.paper, 0.35)} style={box} autoCorrect={false} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        <Pill on={g === "all"} onPress={() => setG("all")} label={`${t("i_all")} (${ALL_TOOLS.length})`} />
        {ORDER.filter((k) => GROUPS[k]).map((k) => <Pill key={k} on={g === k} color={COLOR[k]} onPress={() => setG(k)} label={`${GROUPS[k][lang]} (${count(k)})`} />)}
      </ScrollView>
      {list.length === 0 && <T o={0.7}>{t("i_none")}</T>}
      {ORDER.map((k) => {
        const rows = list.filter((x) => x.group === k); if (!rows.length) return null; const c = COLOR[k];
        return (
          <View key={k} style={{ gap: 8 }}>
            <T b s={18} c={c} style={{ borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 4 }}>{GROUPS[k]?.[lang]} <T s={12} o={0.5}>({rows.length})</T></T>
            {rows.map((i) => {
              const isOpen = open.has(i.name), yml = i.cmd.includes("\n");
              return (
                <Card key={i.name} onPress={() => toggle(i.name)} style={{ padding: 12, gap: 8, borderColor: isOpen ? c : C.line }}>
                  <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                    <T m b s={14} c={c} style={{ flexShrink: 1 }}>{i.name}</T><T s={11.5} o={0.55} style={{ flex: 1 }}>{i.cat}</T>
                    {i.tier && <T s={10} c={GOD_THEMES[i.tier].main}>{GOD_LEVELS[i.tier].label}</T>}
                    <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={14} color={al(C.paper, 0.5)} style={{ alignSelf: "center" }} />
                  </View>
                  <T s={13} o={0.8}>{i.purpose[lang]}</T>
                  {isOpen && (
                    <View style={{ gap: 12, borderTopWidth: 1, borderTopColor: al(C.line, 0.7), paddingTop: 12 }}>
                      {i.goal && <View><H3 color={c}>{SX.goal[lang]}</H3><T s={13} o={0.85} style={{ lineHeight: 19 }}>{i.goal[lang]}</T></View>}
                      <View><H3 color={c}>{i.goal ? SX.how[lang] : t("i_sec_use")}</H3><T s={13} o={0.85} style={{ lineHeight: 19 }}>{i.use[lang]}</T></View>
                      <View><H3>{t("i_sec_example")}</H3><CodeBlock selectable code={i.cmd} lang={yml ? "yaml" : i.cmd.startsWith("(") ? "text" : "bash"} size={12} /></View>
                      <View><H3>{t("i_sec_tip")}</H3><T s={13} o={0.85} style={{ lineHeight: 19 }}>{i.tip[lang]}</T></View>
                      <T s={12.5} o={0.7}>{t("i_site")}: <T selectable s={12.5} c={C.mint}>{i.site.replace(/^https?:\/\//, "")}</T></T>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const RX = {
  what: { id: "Apa itu?", en: "What is it?" }, does: { id: "Tanggung jawab", en: "Responsibilities" }, skills: { id: "Keahlian & teknologi", en: "Skills & technologies" }, tools: { id: "Alat sehari-hari", en: "Everyday tools" },
  day: { id: "Keseharian", en: "A typical day" }, path: { id: "Jalur belajar", en: "Learning path" }, pit: { id: "Jebakan umum", en: "Common pitfalls" }, sec: { id: "Sisi keamanan", en: "Security side" },
  secTools: { id: "Tools keamanan yang relevan (ketuk untuk membuka)", en: "Relevant security tools (tap to open)" }, master: { id: "Di Developer Mode", en: "In Developer Mode" },
  cmp: { id: "Perbandingan ketiga peran", en: "The three roles compared" }, faq: { id: "Pertanyaan umum", en: "Common questions" },
  rule: { id: "Gelar Master: {n} soal dijawab dengan akurasi ≥{a}% · bank {m} soal/peran", en: "Master title: {n} questions answered at ≥{a}% accuracy · {m}-question bank per role" },
};
function Roles({ onOpenTool }: { onOpenTool: (n: string) => void }) {
  const lang = useLang((s) => s.lang), D = rolesData as unknown as RolesData, [sel, setSel] = useState<DevRole>("fullstack"), [faq, setFaq] = useState<number | null>(null);
  const r = D.roles.find((x) => x.id === sel) ?? D.roles[0];
  const H = ({ children }: { children: string }) => <T b s={12} c={r.color} style={{ letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>{children}</T>;
  const list = (items: L2[]) => items.map((x, i) => <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 5 }}><T s={13} c={r.color}>▸</T><T s={13} o={0.88} style={{ flex: 1, lineHeight: 19 }}>{x[lang]}</T></View>);
  const chips = (items: string[], onPress?: (n: string) => void) => <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{items.map((x) => <Pressable key={x} disabled={!onPress} onPress={() => onPress?.(x)} style={{ borderRadius: 99, borderWidth: 1, borderColor: onPress ? r.color + "88" : C.line, paddingHorizontal: 10, paddingVertical: 4 }}><T s={11.5} c={onPress ? r.color : C.paper} o={onPress ? 1 : 0.8}>{x}</T></Pressable>)}</View>;
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {D.roles.map((x) => (
          <Pressable key={x.id} onPress={() => setSel(x.id)} style={{ flex: 1, borderRadius: 14, borderWidth: 1, borderColor: sel === x.id ? x.color : C.line, backgroundColor: sel === x.id ? al(x.color, 0.14) : al(C.panel, 0.7), padding: 10, alignItems: "center", gap: 3 }}>
            <T s={22}>{x.icon}</T><T b s={12.5} c={x.color} style={{ textAlign: "center" }}>{x.name[lang].replace(" Developer", "")}</T>
          </Pressable>
        ))}
      </View>
      <Card style={{ gap: 16, borderColor: r.color + "66" }}>
        <T s={12.5} o={0.7}>{r.tagline[lang]}</T>
        <View><H>{RX.what[lang]}</H><T s={13} o={0.88} style={{ lineHeight: 20 }}>{r.what[lang]}</T></View>
        <View><H>{RX.does[lang]}</H>{list(r.does)}</View>
        <View><H>{RX.day[lang]}</H>{list(r.day)}</View>
        <View><H>{RX.skills[lang]}</H>{chips(r.skills)}</View>
        <View><H>{RX.tools[lang]}</H>{chips(r.tools)}</View>
        <View><H>{RX.path[lang]}</H>{r.path.map((x, i) => <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}><View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: r.color, alignItems: "center", justifyContent: "center" }}><T b s={11} c="#000000">{i + 1}</T></View><T s={13} o={0.88} style={{ flex: 1, lineHeight: 19 }}>{x[lang]}</T></View>)}</View>
        <View><H>{RX.pit[lang]}</H>{list(r.pitfalls)}</View>
        <View><H>{RX.sec[lang]}</H>{list(r.security)}<T s={11} o={0.5} style={{ marginVertical: 6 }}>{RX.secTools[lang]}</T>{chips(r.secTools, onOpenTool)}</View>
        <View style={{ borderRadius: 12, borderWidth: 1, borderColor: r.color + "55", backgroundColor: "rgba(0,0,0,.25)", padding: 12, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}><T s={11} o={0.5} style={{ letterSpacing: 1.5, textTransform: "uppercase" }}>{RX.master[lang]}</T><MasterPill role={r.id} /></View>
          <T s={13} o={0.88} style={{ lineHeight: 19 }}>{r.master[lang]}</T>
          <T s={11.5} c={C.gold}>{RX.rule[lang].replace("{n}", String(DEV_BADGE_RULE.minQ)).replace("{a}", String(Math.round(DEV_BADGE_RULE.acc * 100))).replace("{m}", String(DEV_QUESTIONS_PER_ROLE))}</T>
        </View>
      </Card>
      <View style={{ gap: 8 }}>
        <T b s={18} c={C.mint} style={{ borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 4 }}>{RX.cmp[lang]}</T>
        {D.compare.map((c, i) => (
          <Card key={i} style={{ padding: 12, gap: 6 }}>
            <T b s={13} c={C.gold}>{c.row[lang]}</T>
            {D.roles.map((x) => <View key={x.id} style={{ flexDirection: "row", gap: 8 }}><T b s={12} c={x.color} style={{ width: 22 }}>{x.icon}</T><T s={12.5} o={0.85} style={{ flex: 1 }}>{c[x.id][lang]}</T></View>)}
          </Card>
        ))}
      </View>
      <View style={{ gap: 8 }}>
        <T b s={18} c={C.mint} style={{ borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 4 }}>{RX.faq[lang]}</T>
        {D.faq.map((f, i) => (
          <Card key={i} onPress={() => setFaq(faq === i ? null : i)} style={{ padding: 12, gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><T b s={13.5} c={C.gold} style={{ flex: 1 }}>{f.q[lang]}</T><Icon name={faq === i ? "chevron-up" : "chevron-down"} size={14} color={al(C.paper, 0.5)} /></View>
            {faq === i && <T s={13} o={0.85} style={{ lineHeight: 19 }}>{f.a[lang]}</T>}
          </Card>
        ))}
      </View>
    </View>
  );
}

export default function Info() {
  const t = useT(), [tab, setTab] = useState<"lang" | "sec" | "roles">("lang"), [toolQ, setToolQ] = useState("");
  const openTool = (n: string) => { setToolQ(n); setTab("sec"); };
  return (
    <Screen title={t("i_hub")} subtitle={t("i_hub_sub")}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Pill on={tab === "lang"} onPress={() => setTab("lang")} label={t("i_tab_lang")} />
        <Pill on={tab === "sec"} color={GOD_THEMES.primordial_god.main} onPress={() => { setToolQ(""); setTab("sec"); }} label={t("i_tab_sec")} />
        <Pill on={tab === "roles"} color={C.gold} onPress={() => setTab("roles")} label={t("i_tab_roles")} />
      </ScrollView>
      {tab === "lang" ? <Languages /> : tab === "sec" ? <Security initialQuery={toolQ} /> : <Roles onOpenTool={openTool} />}
    </Screen>
  );
}
