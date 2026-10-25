export const APP_VERSION = "2.5.3";
export const TIME_LIMIT = 30;       // detik, sama di semua tingkat
export const TIME_TOLERANCE = 6;    // toleransi jaringan (server): permintaan bisa lambat di jaringan seluler
export const SESSION_LEN = 10;      // mode biasa
export const MARATHON_LEN = 100;    // mode maraton
export const SPEEDRUN_LEN = 10;     // mode speedrun
export const SPEEDRUN_TIME = 15;    // detik per soal di speedrun
export const DAILY_LEN = 10;        // daily challenge
export type Lang = "id" | "en";
export type Level = "easy" | "normal" | "hard" | "extreme" | "hell";
export const LEVELS: Record<Level, { label: string; points: number; hints: number }> = {
  easy: { label: "Easy", points: 10, hints: 3 },
  normal: { label: "Normal", points: 20, hints: 3 },
  hard: { label: "Hard", points: 50, hints: 5 },
  extreme: { label: "Extreme", points: 100, hints: 7 },
  hell: { label: "Hell", points: 150, hints: 10 },
};
export const LEVEL_IDS = Object.keys(LEVELS) as Level[];
export const isLevel = (x: string): x is Level => x in LEVELS;

// ════════ v2: bonus jawaban benar beruntun (streak) — Hard, Extreme, Hell ════════
// min: berapa kali benar berturut-turut (termasuk jawaban saat ini) untuk memicu bonus.
// bonus: poin tambahan yang didapat PADA SETIAP jawaban benar selama streak >= min (bukan cuma sekali saat tercapai).
export type StreakRule = { min: number; bonus: number };
export const STREAK_RULES: Partial<Record<Level, StreakRule>> = {
  hard: { min: 3, bonus: 50 },      // 50 (benar) + 50 (beruntun) = 100
  extreme: { min: 3, bonus: 50 },   // 100 (benar) + 50 (beruntun) = 150
  hell: { min: 4, bonus: 50 },      // 150 (benar) + 50 (beruntun) = 200
};
// Waktu per soal (detik) per tingkat. Tingkat yang tidak disebut memakai TIME_LIMIT global (30 dtk).
export const LEVEL_TIME: Partial<Record<Level, number>> = { extreme: 20, hell: 20 };
export const timeLimitFor = (lv: Level) => LEVEL_TIME[lv] ?? TIME_LIMIT;

// Warna lencana monitor per tingkat
export const THEMES: Record<Level, { name: string; main: string; glow: string; accent: string }> = {
  easy: { name: "Matte Silver", main: "#9aa0aa", glow: "#6b7280", accent: "#d1d5db" },
  normal: { name: "Neon Emerald", main: "#22e58a", glow: "#10b981", accent: "#a7f3d0" },
  hard: { name: "Electric Blue", main: "#3da5ff", glow: "#2563eb", accent: "#bfdbfe" },
  extreme: { name: "Mystic Purple", main: "#a855f7", glow: "#7c3aed", accent: "#d08a4b" },
  hell: { name: "Mythic Red & Gold", main: "#ff3b3b", glow: "#dc2626", accent: "#f5c451" },
};
// ════════ v2: GOD MODE — ensiklopedia tools keamanan siber, bukan cuma bahasa/framework ════════
// 4 tingkat di atas Hell. Tujuannya edukasi: pemain belajar tools keamanan website nyata (fungsi, tujuan, cara pakai)
// lewat soal tebak-tools & lengkapi perintah, bukan cuma bahasa pemrograman.
export type GodLevel = "demi_god" | "god" | "true_god" | "primordial_god";
export const GOD_IDS: GodLevel[] = ["demi_god", "god", "true_god", "primordial_god"];
export const isGodLevel = (x: string): x is GodLevel => (GOD_IDS as string[]).includes(x);
export type AnyLevel = Level | GodLevel;
export const isAnyLevel = (x: string): x is AnyLevel => isLevel(x) || isGodLevel(x);

export const GOD_LEVELS: Record<GodLevel, { label: string; points: number; streak: StreakRule; timeLimit: number }> = {
  demi_god: { label: "Demi God", points: 500, streak: { min: 3, bonus: 250 }, timeLimit: 120 },
  god: { label: "God", points: 1000, streak: { min: 3, bonus: 500 }, timeLimit: 120 },
  true_god: { label: "True God", points: 2000, streak: { min: 3, bonus: 1000 }, timeLimit: 180 },
  primordial_god: { label: "Primordial God", points: 5000, streak: { min: 3, bonus: 2500 }, timeLimit: 300 },
};
export const GOD_SESSION_LEN = 10, GOD_MARATHON_LEN = 100, GOD_QUESTIONS_PER_TIER = 200;

// Warna lencana: Demi God emas redup, God emas terang, True God putih berkilau/platina, Primordial God ungu kosmik + hitam-emas.
export const GOD_THEMES: Record<GodLevel, { name: string; main: string; glow: string; accent: string }> = {
  demi_god: { name: "Tarnished Gold", main: "#a9872f", glow: "#73581a", accent: "#d9c177" },
  god: { name: "Radiant Gold", main: "#ffd24a", glow: "#f5a623", accent: "#fff3c4" },
  true_god: { name: "Platinum Shimmer", main: "#eef2fb", glow: "#9fb3d9", accent: "#ffffff" },
  primordial_god: { name: "Cosmic Black-Gold", main: "#8b2fd1", glow: "#120821", accent: "#f5c451" },
};

// Konsekuensi visual: selesai TANPA hint = gelar "Emas Menyala" (pureClear). Pakai hint = gelar tetap didapat,
// tapi dicatat "didapat dengan bantuan hint" (lihat kolom game_sessions.hints_used & pure_clear).
export const GOD_TITLE_DEFS: Record<GodLevel, { std: string; legend: string; desc: L2 }> = {
  demi_god: {
    std: "Vuln Spotter", legend: "BUG_HUNTER",
    desc: { id: "Mulai jeli mengenali celah dan tools keamanan dasar sebuah website — level taktis seorang pemburu bug.", en: "Starting to spot basic web vulnerabilities and tools — the tactical eye of a bug hunter." },
  },
  god: {
    std: "Pentest Apprentice", legend: "CYBER_DEITY",
    desc: { id: "Bukan cuma mencari celah — sudah mengontrol dan mendominasi ekosistem jaringan sebuah website.", en: "No longer just hunting flaws — commanding and dominating a website's entire network ecosystem." },
  },
  true_god: {
    std: "Red Team Operator", legend: "Exploit Architect",
    desc: { id: "Mampu merancang kode eksploitasi yang sempurna untuk menembus target, bukan sekadar memakainya.", en: "Can architect a flawless exploit chain to breach a target, not just run one." },
  },
  primordial_god: {
    std: "Security Architect", legend: "The Cosmic Kernel",
    desc: { id: "Jantung paling mendasar dari sistem keamanan — skala dewa purba yang mengendalikan seluruh semesta coding.", en: "The most fundamental core of a security system — primordial-god scale, ruling the entire coding universe." },
  },
};

export const anyLabel = (id: AnyLevel) => (isGodLevel(id) ? GOD_LEVELS[id].label : LEVELS[id].label);
export const anyPoints = (id: AnyLevel) => (isGodLevel(id) ? GOD_LEVELS[id].points : LEVELS[id].points);
export const anyTheme = (id: AnyLevel) => (isGodLevel(id) ? GOD_THEMES[id] : THEMES[id]);

/** Konfigurasi gabungan (tingkat biasa + God Mode + Developer Mode) dipakai server (sesi/skor/waktu/hint). */
export function anyLevelConfig(id: PlayableLevel) {
  if (isDevRole(id)) {
    const d = DEV_ROLES[id];
    return { points: d.points, timeLimit: d.timeLimit, streak: d.streak as StreakRule | undefined, hintsUnlimited: true, hints: 0 };
  }
  if (isGodLevel(id)) {
    const g = GOD_LEVELS[id];
    return { points: g.points, timeLimit: g.timeLimit, streak: g.streak as StreakRule | undefined, hintsUnlimited: true, hints: 0 };
  }
  const l = LEVELS[id];
  return { points: l.points, timeLimit: timeLimitFor(id), streak: STREAK_RULES[id], hintsUnlimited: false, hints: l.hints };
}

type L2 = { id: string; en: string };
export const TITLE_DEFS: Record<Level, { std: string; legend: string; desc: L2 }> = {
  easy: { std: "Hello World Graduate", legend: "Raja Tutorial (Tutorial Hell Monarch)", desc: { id: "Hafal luar kepala syntax dasar, tapi enggan keluar dari zona nyaman.", en: "Knows basic syntax by heart, but reluctant to leave the comfort zone." } },
  normal: { std: "StackOverflow Copy-Paster", legend: "Suhu CSS & Logic (Framework Overlord)", desc: { id: "Sudah bisa bikin aplikasi jalan tanpa error, rajanya manipulasi state.", en: "Can build apps that run without errors; the king of state manipulation." } },
  hard: { std: "Memory Leak Survivor", legend: "Dewa Pointer (C & Rust Specialist)", desc: { id: "Orang gila yang menikmati manajemen memori manual dan bahasa fungsional.", en: "A madman who enjoys manual memory management and functional languages." } },
  extreme: { std: "Low-Level Enthusiast", legend: "Ksatria Kode Purba (Legacy Necromancer)", desc: { id: "Mampu membangkitkan dan membaca bahasa mati seperti COBOL dan Fortran.", en: "Can resurrect and read dead languages like COBOL and Fortran." } },
  hell: { std: "Glitch In The Matrix", legend: "SEPUH CODING (The Chosen One 0x00)", desc: { id: "Tingkat tertinggi. Setara dengan entitas yang bisa coding langsung menggunakan kode biner.", en: "The highest rank. On par with an entity that codes directly in binary." } },
};
export const STARTERS: Record<string, { name: string; desc: L2 }> = {
  hello_world_graduate: { name: "Hello World Graduate", desc: { id: "Gelar awal. Selesaikan minimal 50 soal di satu tingkat untuk naik gelar.", en: "Starter title. Answer at least 50 questions in a level to rank up." } },
  junior_copas: { name: "Junior Copas (StackOverflow Enthusiast)", desc: { id: "Gelar awal. Selesaikan minimal 50 soal di satu tingkat untuk naik gelar.", en: "Starter title. Answer at least 50 questions in a level to rank up." } },
};

// Daftar gabungan untuk gelar/statistik: tingkat biasa (Easy–Hell) + God Mode (Demi God–Primordial God).
export const ALL_IDS: AnyLevel[] = [...LEVEL_IDS, ...GOD_IDS];
const defOf = (l: AnyLevel) => (isGodLevel(l) ? GOD_TITLE_DEFS[l] : TITLE_DEFS[l as Level]);

// Syarat: min 50 soal per tingkat. Standar: akurasi >= 60%. Legendaris: >= 150 soal & akurasi >= 85%.
// Gelar legendaris Hell (SEPUH CODING) hanya jika kelima tingkat biasa sudah legendaris.
export type Stat = { difficulty: string; questions_answered: number; correct_answers: number };
export type Earned = { level: AnyLevel; tier: "standard" | "legendary"; name: string; desc: L2 };
export function earnedTitles(stats: Stat[]): Earned[] {
  const info = ALL_IDS.map((l) => {
    const s = stats.find((x) => x.difficulty === l);
    const n = s?.questions_answered ?? 0, acc = n ? (s!.correct_answers / n) * 100 : 0;
    return { l, std: n >= 50 && acc >= 60, leg: n >= 150 && acc >= 85 };
  });
  const allClassic = LEVEL_IDS.every((l) => info.find((i) => i.l === l)?.leg);
  const out: Earned[] = [];
  for (const i of info) {
    const D = defOf(i.l);
    if (i.leg && (i.l !== "hell" || allClassic)) out.push({ level: i.l, tier: "legendary", name: D.legend, desc: D.desc });
    else if (i.std || i.leg) out.push({ level: i.l, tier: "standard", name: D.std, desc: D.desc });
  }
  return out;
}
/**
 * Berapa jawaban benar BERTURUT-TURUT yang masih dibutuhkan agar syarat terpenuhi (0 = sudah terpenuhi).
 * Syarat: minimal `minQ` soal dan akurasi >= `acc` (dihitung dari seluruh jawaban di tingkat itu).
 * Menambah x jawaban benar: (c + x) / (n + x) >= acc  =>  x >= (acc*n - c) / (1 - acc).
 */
export function answersNeeded(n: number, c: number, minQ: number, acc: number) {
  return Math.max(0, minQ - n, Math.ceil((acc * n - c) / (1 - acc) - 1e-9));
}
export const LEGEND_RULE = { minQ: 150, acc: 0.85 }, STD_RULE = { minQ: 50, acc: 0.6 };

/** Kunci gelar untuk pilihan pemain: "starter", atau "<tingkat>:std" / "<tingkat>:legend". */
export const titleKey = (level: AnyLevel, tier: "standard" | "legendary") => `${level}:${tier === "legendary" ? "legend" : "std"}`;
export type Owned = { key: string; level: AnyLevel; tier: "standard" | "legendary"; name: string; desc: L2 };
/** SEMUA gelar yang sudah dibuka. Gelar standar tetap dimiliki walau gelar legendaris tingkat itu sudah diraih. */
export function ownedTitles(stats: Stat[]): Owned[] {
  const info = ALL_IDS.map((l) => {
    const s = stats.find((x) => x.difficulty === l);
    const n = s?.questions_answered ?? 0, acc = n ? (s!.correct_answers / n) * 100 : 0;
    return { l, std: n >= 50 && acc >= 60, leg: n >= 150 && acc >= 85 };
  });
  const allClassic = LEVEL_IDS.every((l) => info.find((i) => i.l === l)?.leg);
  const out: Owned[] = [];
  for (const i of info) {
    const D = defOf(i.l);
    if (i.std || i.leg) out.push({ key: titleKey(i.l, "standard"), level: i.l, tier: "standard", name: D.std, desc: D.desc });
    if (i.leg && (i.l !== "hell" || allClassic)) out.push({ key: titleKey(i.l, "legendary"), level: i.l, tier: "legendary", name: D.legend, desc: D.desc });
  }
  return out;
}
export type Current = { tier: "starter" | "standard" | "legendary"; level: AnyLevel; name: string; desc: L2; key: string };
/**
 * Gelar yang ditampilkan. Bila pemain memilih gelar (selected) dan gelar itu memang sudah dimiliki, itu yang dipakai;
 * selain itu otomatis: legendaris tertinggi, lalu standar tertinggi, lalu gelar awal.
 */
export function currentTitle(starter: string, stats: Stat[], selected?: string | null): Current {
  const owned = ownedTitles(stats);
  const s = STARTERS[starter] ?? STARTERS.hello_world_graduate;
  const starterCur: Current = { tier: "starter", level: "easy", name: s.name, desc: s.desc, key: "starter" };
  if (selected === "starter") return starterCur;
  if (selected) {
    const o = owned.find((x) => x.key === selected);
    if (o) return { tier: o.tier, level: o.level, name: o.name, desc: o.desc, key: o.key };
  }
  const best = (t: "legendary" | "standard") => [...owned].reverse().find((x) => x.tier === t);
  const pick = best("legendary") ?? best("standard");
  return pick ? { tier: pick.tier, level: pick.level, name: pick.name, desc: pick.desc, key: pick.key } : starterCur;
}

// ════════ v2.1: DEVELOPER MODE — Frontend / Backend / Full Stack ════════
// Jalur gelar "skill", TERPISAH dari gelar penaklukan Easy–Primordial God: bisa dipakai bertumpuk
// (lebih dari satu sekaligus) dan tidak pernah menggantikan currentTitle. Soal sesuai peran yang dipilih.
export type DevRole = "frontend" | "backend" | "fullstack";
export const DEV_IDS: DevRole[] = ["frontend", "backend", "fullstack"];
export const isDevRole = (x: string): x is DevRole => (DEV_IDS as string[]).includes(x);
/** Union lebar khusus mesin sesi/skor (play, bukan sistem gelar tunggal): tingkat biasa + God Mode + Developer Mode. */
export type PlayableLevel = AnyLevel | DevRole;
export const isPlayable = (x: string): x is PlayableLevel => isAnyLevel(x) || isDevRole(x);

export const DEV_ROLES: Record<DevRole, { label: string; points: number; streak: StreakRule; timeLimit: number }> = {
  frontend: { label: "Frontend", points: 3000, streak: { min: 4, bonus: 250 }, timeLimit: 120 },
  backend: { label: "Backend", points: 3000, streak: { min: 4, bonus: 250 }, timeLimit: 120 },
  fullstack: { label: "Full Stack", points: 3000, streak: { min: 4, bonus: 250 }, timeLimit: 120 },
};
export const DEV_SESSION_LEN = 10, DEV_MARATHON_LEN = 100, DEV_QUESTIONS_PER_ROLE = 800;

// Hadiah bonus: bingkai bercahaya di avatar (leaderboard & profil). Merah membara (Frontend), hitam gelap gulita
// (Backend), ungu pekat berhawa gelap (Full Stack) — lihat Avatar.tsx prop `rings`.
export const DEV_THEMES: Record<DevRole, { name: string; main: string; glow: string; accent: string }> = {
  frontend: { name: "Blazing Red", main: "#ff2d2d", glow: "#7a0000", accent: "#ffb199" },
  backend: { name: "Pitch Black", main: "#3a3a3a", glow: "#000000", accent: "#9ca3af" },
  fullstack: { name: "Dark Violet Aura", main: "#7c1fd1", glow: "#180726", accent: "#d8b4fe" },
};

export const DEV_TITLE_DEFS: Record<DevRole, { name: string; desc: L2 }> = {
  frontend: { name: "⚡ Master Frontend", desc: { id: "Menguasai sisi yang dilihat dan disentuh pengguna — UI, interaktivitas, dan pengalaman di browser.", en: "Mastered what users see and touch — UI, interactivity, and the in-browser experience." } },
  backend: { name: "🛠️ Master Backend", desc: { id: "Menguasai mesin di balik layar — server, API, basis data, dan logika yang tak pernah terlihat pengguna.", en: "Mastered the engine behind the scenes — servers, APIs, databases, and logic users never see." } },
  fullstack: { name: "🌌 Master Fullstack", desc: { id: "Menguasai dua dunia sekaligus — dari piksel di layar sampai baris terdalam di server.", en: "Mastered both worlds at once — from the pixels on screen to the deepest line on the server." } },
};

/** Syarat gelar Master (v2.4 HARD MODE): akurasi >= 90% dengan minimal 500 soal dijawab di peran itu (gabungan sesi Biasa + Maraton).
 *  Bank soal 800/peran dan mesin memprioritaskan soal yang BELUM pernah dijawab, jadi 500 jawaban sebagian besar soal berbeda. */
export const DEV_BADGE_RULE = { minQ: 500, acc: 0.9 };
export type DevBadge = { role: DevRole; name: string; desc: L2; theme: { name: string; main: string; glow: string; accent: string } };
/** Gelar Master yang sudah diraih pemain — SEMUA yang terpenuhi dikembalikan sekaligus (dipakai bertumpuk, tidak dipilih satu). */
export function earnedDevBadges(stats: Stat[]): DevBadge[] {
  const out: DevBadge[] = [];
  for (const r of DEV_IDS) {
    const s = stats.find((x) => x.difficulty === r);
    const n = s?.questions_answered ?? 0, c = s?.correct_answers ?? 0, acc = n ? c / n : 0;
    if (n >= DEV_BADGE_RULE.minQ && acc >= DEV_BADGE_RULE.acc) out.push({ role: r, name: DEV_TITLE_DEFS[r].name, desc: DEV_TITLE_DEFS[r].desc, theme: DEV_THEMES[r] });
  }
  return out;
}
/** Warna cincin avatar (urut) dari daftar gelar Master yang diraih — dipakai langsung sebagai prop `rings` Avatar. */
export const devBadgeRingColors = (badges: DevBadge[]) => badges.map((b) => b.theme.main);

// ════════ v2.3: bingkai Master yang bisa DIPILIH + kelompok papan peringkat ════════
/** Bingkai yang tampil di avatar & kartu: `msel` (pilihan pemain) dipakai kalau gelarnya sudah diraih. `"none"` = tanpa bingkai.
 *  Tanpa pilihan: Full Stack (paling langka) > Backend > Frontend. Mengembalikan null bila belum ada gelar Master. */
export const MASTER_PRIORITY: DevRole[] = ["fullstack", "backend", "frontend"];
export const isMasterSel = (x: unknown): x is DevRole | "none" => x === "none" || (typeof x === "string" && isDevRole(x));
export function activeMaster(badges: DevBadge[], msel?: string | null): DevRole | null {
  if (msel === "none") return null;
  if (msel && isDevRole(msel) && badges.some((b) => b.role === msel)) return msel;
  return MASTER_PRIORITY.find((r) => badges.some((b) => b.role === r)) ?? null;
}
/** Kelompok tab papan peringkat & kartu peringkat (id = nilai `difficulty` di user_stats). */
export const RANK_GROUPS: { key: "classic" | "god" | "dev"; ids: string[] }[] = [
  { key: "classic", ids: LEVEL_IDS },
  { key: "god", ids: GOD_IDS },
  { key: "dev", ids: DEV_IDS },
];
export const rankLabel = (id: string) => (isDevRole(id) ? DEV_ROLES[id].label : isGodLevel(id) ? GOD_LEVELS[id].label : isLevel(id) ? LEVELS[id].label : id);
/** Warna teks/label yang terbaca di latar gelap (DEV_THEMES.backend sengaja hitam pekat, tidak cocok untuk teks). */
export const MASTER_TEXT: Record<DevRole, string> = { frontend: "#ff5a3d", backend: "#b9bfcc", fullstack: "#b65cff" };
export const rankTheme = (id: string) => (isDevRole(id) ? { ...DEV_THEMES[id], main: MASTER_TEXT[id] } : isGodLevel(id) ? GOD_THEMES[id] : isLevel(id) ? THEMES[id] : THEMES.easy);

export const playLabel = (id: PlayableLevel) => (isDevRole(id) ? DEV_ROLES[id].label : anyLabel(id));
export const playTheme = (id: PlayableLevel) => (isDevRole(id) ? DEV_THEMES[id] : anyTheme(id));

export type AchievementId =
  | "first_blood" | "streak_3" | "streak_7" | "streak_30"
  | "perfect_10" | "marathon_finisher" | "speed_demon"
  | "daily_warrior" | "polyglot" | "hell_survivor";

export const ACHIEVEMENTS: Record<AchievementId, { icon: string; name: L2; desc: L2 }> = {
  first_blood: { icon: "🩸", name: { id: "First Blood", en: "First Blood" }, desc: { id: "Jawab soal pertama dengan benar.", en: "Answer your first question correctly." } },
  streak_3: { icon: "🔥", name: { id: "Api Kecil", en: "Spark" }, desc: { id: "Main 3 hari berturut-turut.", en: "Play 3 days in a row." } },
  streak_7: { icon: "🔥🔥", name: { id: "Api Mingguan", en: "Week of Fire" }, desc: { id: "Main 7 hari berturut-turut.", en: "Play 7 days in a row." } },
  streak_30: { icon: "🌋", name: { id: "Api Abadi", en: "Eternal Flame" }, desc: { id: "Main 30 hari berturut-turut.", en: "Play 30 days in a row." } },
  perfect_10: { icon: "💯", name: { id: "Sempurna 10", en: "Perfect 10" }, desc: { id: "Selesaikan 10 soal tanpa salah.", en: "Finish 10 questions without a miss." } },
  marathon_finisher: { icon: "🏃", name: { id: "Pelari Marathon", en: "Marathon Finisher" }, desc: { id: "Selesaikan mode Maraton 100 soal.", en: "Complete a 100-question Marathon." } },
  speed_demon: { icon: "⚡", name: { id: "Speed Demon", en: "Speed Demon" }, desc: { id: "Selesaikan mode Speedrun.", en: "Complete a Speedrun session." } },
  daily_warrior: { icon: "📅", name: { id: "Pejuang Harian", en: "Daily Warrior" }, desc: { id: "Selesaikan Daily Challenge 5 kali.", en: "Complete Daily Challenge 5 times." } },
  polyglot: { icon: "🌐", name: { id: "Polyglot", en: "Polyglot" }, desc: { id: "Jawab benar di semua 5 tingkat.", en: "Get a correct answer in all 5 levels." } },
  hell_survivor: { icon: "👹", name: { id: "Hell Survivor", en: "Hell Survivor" }, desc: { id: "Selesaikan 10 soal di tingkat Hell.", en: "Answer 10 questions in Hell." } },
};
