// Uji engine offline di Node:  npx tsx scripts/test-engine.ts
import assert from "node:assert/strict";
import { emptySave, migrate, pickQuestion, startSession, serveNext, answer, useHint, quit, finish, todayStr, totalPoints, statList, type Session } from "../src/lib/engine";
import { bankOf, questionByKey } from "../src/lib/bank";
import { earnedTitles, earnedDevBadges, currentTitle, activeMaster, GOD_IDS, DEV_IDS, LEVEL_IDS, DEV_BADGE_RULE, DEV_QUESTIONS_PER_ROLE } from "../src/lib/config";

// 1) Integritas bank soal
const ALL = [...LEVEL_IDS, ...GOD_IDS, ...DEV_IDS] as string[];
let total = 0;
for (const lv of ALL) {
  const b = bankOf(lv); assert.ok(b.length > 0, lv + " kosong"); total += b.length;
  b.forEach((q, i) => {
    assert.ok(q.p && q.c !== undefined && q.l, `${lv}#${i} field wajib`);
    assert.ok(Array.isArray(q.o) && q.o.length >= 2, `${lv}#${i} opsi`);
    assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length, `${lv}#${i} indeks benar`);
    if (q.oe) assert.equal(q.oe.length, q.o.length, `${lv}#${i} opsi EN`);
  });
}
console.log("bank OK:", total, "soal");

const rng = (() => { let s = 12345; return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296); })();
function play(save: ReturnType<typeof emptySave>, level: string, mode: string, pick: (q: NonNullable<ReturnType<typeof questionByKey>>) => number | null) {
  const r = startSession(save, level, mode); assert.ok(!("error" in r), JSON.stringify(r));
  const s = (r as { session: Session }).session; const fbs = [];
  let p = serveNext(save, s, "id", rng);
  while (!p.finished) { const q = questionByKey(s.currentKey!)!; fbs.push(answer(save, s, pick(q), "id", 1)); p = serveNext(save, s, "id", rng); }
  return { s, fbs, last: p };
}

// 2) Easy, semua benar: 10 x 10 poin, streak tidak berlaku, selesai -> perfect_10 + first_blood
let save = emptySave();
let r = play(save, "easy", "normal", (q) => q.a);
assert.equal(r.s.score, 100); assert.equal(r.s.correct, 10); assert.equal(r.s.status, "finished");
assert.ok(save.meta.achievements.includes("perfect_10") && save.meta.achievements.includes("first_blood"));
assert.equal(save.meta.streak, 1); assert.equal(save.history.length, 1); assert.equal(save.stats.easy.games_played, 1);
assert.equal(new Set(r.s.used).size, 10, "soal tidak boleh berulang dalam satu sesi");

// 3) Hard, streak: benar ke-3 dst dapat +50  (50,50,100,100,...)
save = emptySave(); r = play(save, "hard", "normal", (q) => q.a);
assert.deepEqual(r.fbs.slice(0, 4).map((f) => f.gained), [50, 50, 100, 100]); assert.equal(r.s.score, 50 + 50 + 8 * 100);

// 4) Salah -> masuk daftar review, benar -> hilang; waktu habis (null) memutus streak
save = emptySave();
let rr = startSession(save, "hard", "normal") as { session: Session }; let s = rr.session;
serveNext(save, s, "id", rng); const k1 = s.currentKey!; const q1 = questionByKey(k1)!;
const wrongChoice = (q1.a + 1) % q1.o.length; let f = answer(save, s, wrongChoice, "id", 2);
assert.equal(f.correct, false); assert.ok(save.wrong[k1]); assert.equal(s.streak, 0);
serveNext(save, s, "id", rng); f = answer(save, s, null, "id", 31); assert.equal(f.correct, false);

// 5) Hint harian terbatas (Easy = 3) lalu NO_HINTS; speedrun tanpa hint
save = emptySave(); s = (startSession(save, "easy", "normal") as { session: Session }).session; serveNext(save, s, "id", rng);
for (let i = 2; i >= 0; i--) { const h = useHint(save, s, "id"); assert.ok(!("error" in h) && h.hints === i); }
assert.deepEqual(useHint(save, s, "id"), { error: "NO_HINTS" });
const sp = (startSession(save, "easy", "speedrun") as { session: Session }).session; assert.equal(serveNext(save, sp, "id", rng).hints, 0);

// 6) God Mode: hint 3 tahap, tidak terbatas, menandai pureClear=false; waktu per soal sesuai config
save = emptySave(); s = (startSession(save, "god", "normal") as { session: Session }).session; let p = serveNext(save, s, "id", rng);
assert.ok(p.hintsUnlimited && p.hints === -1 && p.pureClear);
const st = [1, 2, 3, 4].map(() => (useHint(save, s, "id") as { stage: number }).stage); assert.deepEqual(st, [1, 2, 3, 3]); assert.equal(s.hintsUsed, 3);
assert.equal(startSession(save, "god", "speedrun" as any) && (startSession(save, "god", "speedrun") as any).error, "INVALID_LEVEL");
assert.equal((startSession(save, "frontend", "daily") as any).session?.level === "frontend", false, "daily selalu memakai tingkat klasik");

// 7) Daily: sekali sehari
save = emptySave(); const d1 = startSession(save, "x", "daily") as { session: Session }; assert.ok(LEVEL_IDS.includes(d1.session.level as any));
play(save, "x", "daily", (q) => q.a); assert.equal(save.meta.dailyDoneDate, todayStr());
assert.deepEqual(startSession(save, "x", "daily"), { error: "DAILY_DONE" });

// 8) Gelar: 50 soal & akurasi >= 60% -> gelar standar; Dev Master: 50 soal & >= 85%
save = emptySave(); save.stats.easy = { games_played: 5, questions_answered: 50, correct_answers: 31, points: 310 };
assert.equal(earnedTitles(statList(save)).length, 1);
save.stats.frontend = { games_played: 5, questions_answered: 60, correct_answers: 52, points: 100 };
assert.equal(earnedDevBadges(statList(save)).length, 0, "v2.4: 60 soal / 87% TIDAK cukup lagi untuk Master");
assert.deepEqual([DEV_BADGE_RULE.minQ, DEV_BADGE_RULE.acc, DEV_QUESTIONS_PER_ROLE], [500, 0.9, 800]);
save.stats.frontend = { games_played: 60, questions_answered: 500, correct_answers: 449, points: 100 };
assert.equal(earnedDevBadges(statList(save)).length, 0, "89,8% < 90%");
save.stats.frontend = { games_played: 60, questions_answered: 500, correct_answers: 450, points: 100 };
const bd = earnedDevBadges(statList(save)); assert.deepEqual(bd.map((b) => b.role), ["frontend"]); assert.equal(activeMaster(bd, null), "frontend"); assert.equal(activeMaster(bd, "none"), null);
console.log("gelar:", currentTitle("hello_world_graduate", statList(save), null).name);

// 9) Quit mencatat riwayat dan tidak menaikkan streak hari
save = emptySave(); s = (startSession(save, "normal", "maraton") as { session: Session }).session; serveNext(save, s, "id", rng); answer(save, s, questionByKey(s.currentKey!)!.a, "id", 1);
quit(save, s); assert.equal(save.history[0].status, "quit"); assert.equal(save.meta.streak, 0); assert.equal(s.length, 100);
// 10) Seluruh maraton 100 soal dapat diselesaikan di tiap tingkat (bank cukup)
for (const lv of ["easy", "hell", "frontend", "primordial_god"]) { save = emptySave(); const x = play(save, lv, "maraton", (q) => q.a); assert.equal(x.s.total, Math.min(100, bankOf(lv).length), lv); }

// 11) Bank Developer Mode 800/peran (v2.4)
for (const r of DEV_IDS) assert.equal(bankOf(r).length, 800, r);
// 12) Developer Mode memprioritaskan soal yang BELUM pernah dijawab (sampai bank habis)
save = emptySave(); save.seen.frontend = Array.from({ length: 799 }, (_, i) => i);
for (let i = 0; i < 20; i++) assert.equal(pickQuestion("frontend", [], rng, save.seen.frontend), "frontend:799");
assert.ok(pickQuestion("frontend", ["frontend:799"], rng, save.seen.frontend)!.startsWith("frontend:"), "bila semua sudah pernah dijawab, soal lama dipakai ulang");
s = (startSession(save, "frontend", "normal") as { session: Session }).session; serveNext(save, s, "id", rng);
answer(save, s, questionByKey(s.currentKey!)!.a, "id", 1); assert.ok(save.seen.frontend.includes(799) || save.seen.frontend.length === 800);
// 13) migrate: simpanan v1 lama / rusak
const old = { v: 1, profile: { username: "budi" }, stats: { frontend: { games_played: 1, questions_answered: 9, correct_answers: 9, points: 5 } }, wrong: { "frontend:3": { difficulty: "frontend", chosen: 0, at: "x" }, "easy:4": { difficulty: "easy", chosen: 1, at: "y" } }, settings: { haptics: false } };
const m = migrate(old); assert.equal(m.v, 2); assert.ok(!("frontend:3" in m.wrong) && "easy:4" in m.wrong, "soal dev lama dibuang, soal klasik tetap");
assert.equal(m.stats.frontend.points, 5); assert.equal(m.settings.haptics, false); assert.equal(m.settings.fx, "auto"); assert.deepEqual(m.seen, {});
for (const bad of [null, undefined, 5, "x", [], { profile: 3, stats: [] }]) assert.equal(migrate(bad).v, 2);
console.log("semua uji engine LULUS | total poin contoh:", totalPoints(save));
