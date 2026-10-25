import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, BackHandler, Easing, Pressable, Share, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Btn, Card, Icon, Screen, T } from "../components/ui";
import CodeBlock from "../components/CodeBlock";
import Confetti from "../components/Confetti";
import { ACHIEVEMENTS, TIME_LIMIT, isGodLevel, isPlayable, playLabel, playTheme, type AchievementId } from "../lib/config";
import type { Feedback, Payload } from "../lib/engine";
import { useLang, useT } from "../lib/i18n";
import { useStore } from "../lib/store";
import { haptic } from "../lib/feedback";
import { setPlaying } from "../lib/loop";
import { C, al } from "../theme";

type Toast = { id: string; icon: string; name: string };
export default function Play() {
  const t = useT(), lang = useLang((s) => s.lang), nav = useNavigation<any>();
  const { level, mode: modeParam } = useRoute<any>().params as { level: string; mode?: string };
  const [p, setP] = useState<Payload | null>(null), [fb, setFb] = useState<Feedback | null>(null), [picked, setPicked] = useState<number | null>(null);
  const [hint, setHint] = useState(""), [hints, setHints] = useState(0), [stage, setStage] = useState(0), [hintsUsed, setHintsUsed] = useState(0);
  const [left, setLeft] = useState(0), [err, setErr] = useState(""), [done, setDone] = useState<null | "finished" | "quit">(null);
  const [score, setScore] = useState(0), [correct, setCorrect] = useState(0), [streak, setStreak] = useState(0), [toasts, setToasts] = useState<Toast[]>([]);
  const [run, setRun] = useState(0), [answeredN, setAnsweredN] = useState(0);
  // layar permainan terbuka → hentikan semua animasi dekoratif di layar lain (tab di belakang) sampai selesai
  useEffect(() => { setPlaying(true); return () => setPlaying(false); }, []);
  const busy = useRef(false), deadline = useRef(0), startedAt = useRef(0), prev = useRef(99), lastP = useRef<Payload | null>(null);
  const bar = useRef(new Animated.Value(1)).current, shake = useRef(new Animated.Value(0)).current, pop = useRef(new Animated.Value(0)).current, toastA = useRef(new Animated.Value(0)).current;

  const pushAch = useCallback((ids?: string[]) => {
    if (!ids?.length) return;
    const items = ids.map((id) => { const a = ACHIEVEMENTS[id as AchievementId]; return a ? { id, icon: a.icon, name: a.name[lang] } : null; }).filter(Boolean) as Toast[];
    if (!items.length) return;
    haptic("win"); setToasts(items);
    toastA.setValue(0); Animated.sequence([Animated.timing(toastA, { toValue: 1, duration: 250, useNativeDriver: true }), Animated.delay(2800), Animated.timing(toastA, { toValue: 0, duration: 300, useNativeDriver: true })]).start(() => setToasts([]));
  }, [lang, toastA]);

  const apply = useCallback((d: Payload) => {
    lastP.current = d; setP(d); setAnsweredN(d.answered); setHints(d.hints); setScore(d.score); setCorrect(d.correct); setStreak(d.streak); setStage(0); setHintsUsed(d.hintsUsed);
    if (d.finished) { pushAch(d.newAchievements); haptic("win"); setDone("finished"); return; }
    setHint(""); setFb(null); setPicked(null); busy.current = false; prev.current = d.timeLimit;
    startedAt.current = Date.now(); deadline.current = startedAt.current + d.timeLimit * 1000; setLeft(d.timeLimit);
    bar.setValue(1); Animated.timing(bar, { toValue: 0, duration: d.timeLimit * 1000, easing: Easing.linear, useNativeDriver: true }).start();
  }, [bar, pushAch]);

  // `apply` bergantung pada bahasa; disimpan di ref agar mengganti bahasa tidak memulai ulang sesi yang sedang berjalan
  const applyRef = useRef(apply); applyRef.current = apply;
  // mulai sesi (dan "main lagi")
  useEffect(() => {
    if (!isPlayable(level) && level !== "daily") { setErr("INVALID_LEVEL"); return; }
    setDone(null); setErr(""); setP(null);
    const r = useStore.getState().startGame(level, modeParam || (level === "daily" ? "daily" : "normal"));
    if ("error" in r) setErr(r.error); else applyRef.current(r.payload);
  }, [level, modeParam, run]);

  const answer = useCallback((choice: number | null) => {
    if (!p || busy.current || fb) return; busy.current = true; setPicked(choice); bar.stopAnimation();
    const elapsed = choice === null ? p.timeLimit + 2 : (Date.now() - startedAt.current) / 1000;
    const f = useStore.getState().answer(choice, elapsed);
    setAnsweredN(p.answered + 1); setFb(f); setScore(f.score); setStreak(f.streak); if (f.correct) setCorrect((c) => c + 1);
    pop.setValue(0); Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
    if (f.correct) haptic("ok"); else { haptic("bad"); if (choice !== null && !f.late) Animated.sequence([6, -6, 4, -4, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 55, useNativeDriver: true }))).start(); }
    pushAch(f.newAchievements);
  }, [p, fb, bar, pop, shake, pushAch]);

  // timer berbasis Date.now: tetap akurat setelah aplikasi di latar belakang
  useEffect(() => {
    if (!p || fb || done) return;
    const tick = () => {
      const remain = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      if (remain <= 5 && remain < prev.current) haptic("tick");
      prev.current = remain; setLeft(remain); if (remain <= 0) answer(null);
    };
    const id = setInterval(tick, 250); return () => clearInterval(id);
  }, [p, fb, done, answer]);

  const next = () => { const d = useStore.getState().nextQuestion(); apply(d); };
  const askHint = () => {
    const r = useStore.getState().hint();
    if ("error" in r) setHint(t("err_" + r.error)); else { setHint(r.hint); setHints(r.hints); if (r.stage) setStage(r.stage); if (typeof r.hintsUsedTotal === "number") setHintsUsed(r.hintsUsedTotal); haptic("hint"); }
  };
  const quit = useCallback(() => {
    Alert.alert(t("quit"), t("quit_confirm"), [{ text: t("back"), style: "cancel" }, { text: t("quit"), style: "destructive", onPress: () => { useStore.getState().quitGame(); setDone("quit"); } }]);
  }, [t]);
  useEffect(() => {
    const h = BackHandler.addEventListener("hardwareBackPress", () => { if (done || err) return false; quit(); return true; });
    return () => h.remove();
  }, [done, err, quit]);

  const share = async () => { try { await Share.share({ message: `🏆 Kode Tebak — ${isPlayable(level) ? playLabel(lastP.current?.level ?? (level as any)) : level}\n${t("points")}: ${score} | ${correct}/${p?.total ?? 10}\n${(lastP.current?.mode ?? "normal") !== "normal" ? `Mode: ${lastP.current?.mode}\n` : ""}` }); } catch {} };

  if (err) return (
    <Screen scroll={false}><View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}><T c={C.hot} s={17} style={{ textAlign: "center" }}>{t("err_" + err)}</T><Btn label={t("choose")} onPress={() => nav.goBack()} /></View></Screen>
  );

  if (done) {
    const total = p?.total ?? 10, acc = total ? Math.round((correct / (done === "quit" ? Math.max(1, answeredN) : total)) * 100) : 0, lv = lastP.current?.level ?? level, th = isPlayable(String(lv)) ? playTheme(lv as any) : { main: C.gold };
    return (
      <Screen>
        {done === "finished" && score > 0 && <Confetti />}
        <Card glow style={{ alignItems: "center", gap: 6, marginTop: 24 }}>
          <T s={11} c={C.gold} o={0.7} style={{ letterSpacing: 3, textTransform: "uppercase" }}>{done === "quit" ? t("over") : t("done")}</T>
          <T d s={52} c={C.gold}>{score}</T><T s={13} o={0.6}>{t("points")}</T>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            {[[String(correct), t("p_questions"), C.mint], [`${acc}%`, t("p_accuracy"), C.gold], [String(lastP.current?.mode ?? "normal"), "mode", th.main]].map(([v, l, c], i) => (
              <View key={i} style={{ flex: 1, borderRadius: 10, backgroundColor: al(C.ink, 0.6), padding: 10, alignItems: "center" }}><T m s={17} c={c as string} style={{ textTransform: "capitalize" }}>{v}</T><T s={10.5} o={0.5}>{l}</T></View>
            ))}
          </View>
          {done === "finished" && isGodLevel(String(lv)) && <T b s={12} c={hintsUsed === 0 ? C.gold : C.paper} o={hintsUsed === 0 ? 1 : 0.6} style={{ marginTop: 10, textAlign: "center" }}>{hintsUsed === 0 ? `✨ ${t("god_pure_clear")}` : t("god_used_hint", { n: hintsUsed })}</T>}
        </Card>
        <T s={12.5} o={0.6} style={{ textAlign: "center" }}>{t("saved_local")}</T>
        <View style={{ gap: 10 }}>
          <Btn kind="primary" icon="refresh" label={t("again")} onPress={() => setRun((x) => x + 1)} />
          <Btn icon="grid" label={t("choose")} onPress={() => nav.goBack()} />
          <Btn kind="gold" icon="share-social" label={t("share")} onPress={share} />
        </View>
      </Screen>
    );
  }

  if (!p || !p.question) return <Screen scroll={false}><View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><T m s={13} o={0.5}>{t("loading_q")}</T></View></Screen>;

  const q = p.question, danger = left <= 5, qNum = Math.min(p.answered + 1, p.total), lv = p.level, th = playTheme(lv);
  return (
    <Screen gap={14}>
      {toasts.length > 0 && <Animated.View pointerEvents="none" style={{ position: "absolute", top: 8, right: 14, zIndex: 20, opacity: toastA, transform: [{ translateY: toastA.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) }] }}>
        {toasts.map((a) => <View key={a.id} style={{ borderRadius: 12, borderWidth: 1, borderColor: al(C.gold, 0.45), backgroundColor: al(C.panel, 0.97), paddingHorizontal: 14, paddingVertical: 10, marginBottom: 6 }}><T s={10} c={C.gold} style={{ letterSpacing: 1, textTransform: "uppercase" }}>{t("ach_unlocked")}</T><T b s={14}>{a.icon} {a.name}</T></View>)}
      </Animated.View>}

      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <View style={{ borderRadius: 8, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, paddingHorizontal: 10, paddingVertical: 5, flexDirection: "row", gap: 6, alignItems: "center" }}>
          <T m b s={13} c={th.main}>{playLabel(lv)}</T>
          {p.mode === "speedrun" && <Icon name="flash" size={12} color={C.gold} />}{p.mode === "daily" && <T s={10} c={C.gold}>DAILY</T>}{p.mode === "maraton" && <T s={10} c={C.mint}>100</T>}
        </View>
        <T m s={12.5} o={0.6}>{t("q_n", { n: qNum, total: p.total })}</T>
        <T m b s={13} c={C.gold}>{score} {t("points")}</T>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}><Icon name="time" size={18} color={danger ? C.hot : C.mint} /><T m b s={20} c={danger ? C.hot : C.mint}>{left}s</T></View>
      </View>
      {p.streakMin > 0 && <View style={{ alignSelf: "flex-start", borderRadius: 8, backgroundColor: streak >= p.streakMin ? al(C.hot, 0.2) : al(C.ink, 0.5), paddingHorizontal: 10, paddingVertical: 5 }}><T b s={11.5} c={streak >= p.streakMin ? C.hot : C.paper} o={streak >= p.streakMin ? 1 : 0.6}>🔥 {t("streak_n", { n: streak })}{streak < p.streakMin ? ` · ${t("streak_need", { n: p.streakMin })}` : ` · +${p.streakBonus}`}</T></View>}

      <View style={{ height: 6, borderRadius: 99, backgroundColor: C.line, overflow: "hidden" }}><Animated.View style={{ height: "100%", width: "100%", borderRadius: 99, backgroundColor: danger ? C.hot : C.mint, transformOrigin: "left center", transform: [{ scaleX: bar }] }} /></View>
      <View style={{ flexDirection: "row", gap: 3 }}>
        {Array.from({ length: Math.min(p.total, 20) }, (_, i) => <View key={i} style={{ flex: 1, height: 5, borderRadius: 99, backgroundColor: i < p.answered ? C.mint : i === p.answered ? C.gold : C.line }} />)}
        {p.total > 20 && <T s={10} o={0.4}>+{p.total - 20}</T>}
      </View>

      <T b s={19} style={{ lineHeight: 26 }}>{q.prompt}</T>
      <CodeBlock code={q.code} lang={q.language} />

      <Animated.View style={{ gap: 10, transform: [{ translateX: shake }] }}>
        {q.options.map((o, i) => {
          const isC = !!fb && i === fb.correctIndex, isW = !!fb && !isC && i === picked, dim = !!fb && !isC && !isW;
          const col = isC ? C.mint : isW ? C.hot : C.line;
          return (
            <Pressable key={i} disabled={!!fb} onPress={() => { haptic("tap"); answer(i); }} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, borderColor: fb ? col : pressed ? al(C.mint, 0.6) : C.line, backgroundColor: isC ? al(C.mint, 0.15) : isW ? al(C.hot, 0.12) : al(C.panel, 0.6), paddingHorizontal: 14, paddingVertical: 14, opacity: dim ? 0.45 : 1 })}>
              <View style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: al(C.ink, 0.4), alignItems: "center", justifyContent: "center" }}><T m s={12} o={0.6}>{String.fromCharCode(65 + i)}</T></View>
              <T s={14.5} c={isC ? C.mint : isW ? C.hot : C.paper} style={{ flex: 1 }}>{o}</T>
              {isC && <Icon name="checkmark" size={18} color={C.mint} />}{isW && <Icon name="close" size={18} color={C.hot} />}
            </Pressable>
          );
        })}
      </Animated.View>

      {!!hint && <View style={{ borderRadius: 12, borderWidth: 1, borderColor: al(C.gold, 0.5), backgroundColor: al(C.gold, 0.06), padding: 14 }}><T s={13.5} c={C.gold}>💡 {t("hint_prefix")} {hint}</T></View>}

      {fb && (
        <Animated.View style={{ borderRadius: 14, borderWidth: 1, borderColor: fb.correct ? C.mint : C.hot, backgroundColor: al(fb.correct ? C.mint : C.hot, 0.06), padding: 16, gap: 8, opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon name={fb.correct ? "checkmark-circle" : "close-circle"} size={24} color={fb.correct ? C.mint : C.hot} />
            <T b s={16} style={{ flex: 1 }}>{fb.correct ? t("right", { n: fb.gained }) : fb.late ? (picked === fb.correctIndex ? t("late_correct") : t("timeout")) : picked === null ? t("timeout") : t("wrong")}</T>
          </View>
          {fb.correct && fb.streakActive && !!fb.gainedBonus && <T b s={11.5} c={C.hot}>🔥 {t("streak_bonus_line", { base: fb.gainedBase, bonus: fb.gainedBonus })}</T>}
          <T s={13.5} o={0.78} style={{ lineHeight: 20 }}>{fb.explanation}</T>
          <Btn kind="primary" label={t("next")} onPress={next} />
        </Animated.View>
      )}

      {!fb && (
        <View style={{ flexDirection: "row", gap: 10, paddingTop: 2 }}>
          {p.mode !== "speedrun" && <Btn flex icon="bulb" label={`${t("hint")} ${p.hintsUnlimited ? `(${t("hint_unlimited")}${stage ? ` · ${stage}/3` : ""})` : `(${hints})`}`} disabled={!p.hintsUnlimited && hints <= 0} onPress={askHint} />}
          <Btn flex kind="danger" icon="flag" label={t("quit")} onPress={quit} />
        </View>
      )}
    </Screen>
  );
}
