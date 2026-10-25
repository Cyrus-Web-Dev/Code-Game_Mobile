// Generator lencana gelar — versi React Native (diport dari web). Menghasilkan lapisan SVG statis; animasi dibuat native di Badge.tsx.
import { THEMES, GOD_THEMES, type Level, type AnyLevel, type GodLevel, isGodLevel } from "./config";
export type Tier = "starter" | "standard" | "legendary";
/** Tiap tingkat God Mode meminjam "profil efek" visual (gear, kilau, dsb.) dari salah satu 5 tingkat klasik,
 *  tapi warnanya tetap dari GOD_THEMES sendiri (emas redup/terang, platina, ungu kosmik). */
const GOD_EFFECT_PROFILE: Record<GodLevel, Level> = { demi_god: "normal", god: "hard", true_god: "extreme", primordial_god: "hell" };
const effectLv = (lv: AnyLevel): Level => (isGodLevel(lv) ? GOD_EFFECT_PROFILE[lv] : lv);
const themeOf = (lv: AnyLevel) => (isGodLevel(lv) ? GOD_THEMES[lv] : THEMES[lv]);

const f = (n: number) => Math.round(n * 10) / 10;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
const rng = (seed: number) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

const ABBR: Record<string, string> = { python: "Py", javascript: "JS", typescript: "TS", c: "C", "c++": "C++", "c#": "C#", rust: "Rs", go: "Go", java: "Jv", php: "PHP", kotlin: "Kt", swift: "Sw", ruby: "Rb", haskell: "Hs", elixir: "Ex", cobol: "COB", fortran: "F90", assembly: "ASM", lisp: "λ", pascal: "Pas", brainfuck: "BF" };
export const abbr = (s?: string | null) => { const k = (s || "").trim().toLowerCase(); return ABBR[k] ?? (k ? k[0].toUpperCase() + (k[1] ?? "") : "</>"); };

const CX = 160, CY = 138;

const leaf = (L: number, w: number) => `M0 0C${f(L * .22)} ${f(-w)} ${f(L * .72)} ${f(-w * .95)} ${f(L)} 0C${f(L * .72)} ${f(w * .95)} ${f(L * .22)} ${f(w)} 0 0Z`;
const crystal = (L: number, w: number) => `M0 0L${f(L * .42)} ${f(-w)}L${f(L)} 0L${f(L * .42)} ${f(w)}Z`;
const flame = (L: number, w: number) => `M0 0C${f(L * .25)} ${f(-w)} ${f(L * .62)} ${f(-w)} ${f(L * .84)} ${f(-w * .5)}L${f(L * .95)} ${f(-w * 1.55)}L${f(L * .98)} ${f(-w * .35)}L${f(L * 1.08)} ${f(-w * .95)}L${f(L)} 0C${f(L * .7)} ${f(w * .95)} ${f(L * .25)} ${f(w)} 0 0Z`;
const shape = (lv: Level, L: number, w: number) => (lv === "hard" ? crystal(L, w) : lv === "hell" ? flame(L, w) : leaf(L, w));
// Teks cincin & lingkar luar khas God Mode (menggantikan RING/arc klasik untuk 4 tingkat di atas Hell).
const GOD_RING: Record<GodLevel, string> = {
  demi_god: "RECON · BURP · NMAP · SCAN · RECON · BURP · NMAP · SCAN · ",
  god: "EXPLOIT · METASPLOIT · SHELL · PWN · EXPLOIT · METASPLOIT · SHELL · PWN · ",
  true_god: "0-DAY · CVE · APT · RCE · 0-DAY · CVE · APT · RCE · ",
  primordial_god: "",
};
const GOD_ARC: Record<GodLevel, string> = {
  demi_god: "", god: "", true_god: "",
  primordial_god: "0x00 · ROOT · KERNEL · 0x00 · ROOT · KERNEL · 0x00 · ROOT · KERNEL · 0x00 ·",
};
const star = "M0 -6L1.8 -1.8L6 0L1.8 1.8L0 6L-1.8 1.8L-6 0L-1.8 -1.8Z";
const gear = (r: number, n: number) => {
  const step = (2 * Math.PI) / n, pts: string[] = [];
  for (let i = 0; i < n; i++) { const a = i * step; for (const [da, rr] of [[-.28, r], [-.16, r + 3.5], [.16, r + 3.5], [.28, r]]) pts.push(`${f(Math.cos(a + da * step) * rr)} ${f(Math.sin(a + da * step) * rr)}`); }
  return "M" + pts.join("L") + "Z";
};

type Th = (typeof THEMES)[Level] | (typeof GOD_THEMES)[GodLevel];
// ── Sayap bergaya "sayap malaikat tegak": bilah utama melengkung, dua bulu sekunder, tiga cuping bergerigi.
// Semua koordinat dalam sistem gambar referensi (akar sayap kanan di 590,580); diskalakan WS saat dipasang.
const WS = 0.27, RX = 590, RY = 580, SX = 200, SY = 166;
const W_FILL = "M822 336 C874 330 900 372 892 396 C858 414 846 440 846 478 C848 494 846 504 838 508 C806 518 760 536 700 566 C670 576 630 580 592 580 C700 542 790 432 822 336Z";
const W_BLADE = "M592 578 C612 538 652 478 672 412 C684 366 688 332 692 300 C762 250 862 172 936 106 C962 82 986 66 998 54 C1002 100 976 176 926 236 C890 278 856 306 822 336 C790 432 700 540 592 578Z";
const W_F1 = "M822 336 C872 306 934 274 996 252 C988 304 944 352 890 394 C850 424 822 452 802 486 C806 430 812 384 822 336Z";
const W_F2 = "M806 442 C852 418 910 396 958 378 C942 424 896 458 846 478 C826 486 810 494 796 508Z";
const W_L1 = "M768 470 C800 478 828 496 842 514 C818 512 792 518 758 536 C762 512 764 490 768 470Z";
const W_L2 = "M728 514 C756 524 774 538 786 554 C762 550 738 556 708 578 C714 552 720 530 728 514Z";
const W_L3 = "M676 556 C698 570 712 590 722 612 C700 610 648 600 592 582 C620 574 650 566 676 556Z";
const W_ALL = [W_FILL, W_BLADE, W_F1, W_F2, W_L1, W_L2, W_L3];
// garis ganda pada tepi depan, busur pemisah, dan tepi bulu sekunder
const S_LEAD = "M996 62 C984 72 960 92 934 114 C862 180 764 258 702 308 C698 340 694 376 682 414 C660 480 626 538 604 572";
const S_LEAD_W = "M988 84 C960 108 934 130 912 150 C850 206 772 272 718 320 C714 352 710 388 698 426 C678 490 650 540 624 566";
const S_LEAD_2 = "M980 100 C954 126 930 148 910 168 C852 224 780 286 734 332 C730 364 724 398 712 436 C694 492 668 538 644 560";
const S_ARC = "M824 342 C792 436 702 544 598 578";
const S_ARC_W = "M834 350 C802 442 712 548 612 580";
const S_F1 = "M826 332 C874 306 936 274 990 256";
const S_F2 = "M828 424 C866 408 914 392 950 382";

function wings(lv: AnyLevel, p: string, th: Th, tier: Tier) {
  const effLv = effectLv(lv);
  const leg = tier === "legendary", starter = tier === "starter", hell = effLv === "hell";
  const c1 = hell ? "#f5c451" : th.accent, c2 = hell ? "#ffe9a8" : "#ffffff";
  const sw = (w: number) => `stroke="${c1}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const wt = (w: number) => `stroke="${c2}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const body = (d: string, extra = "") => `<path d="${d}" fill="url(#${p}wbody)" stroke="${mix(th.main, "#0a0d16", .2)}" stroke-width="3" stroke-opacity=".75" stroke-linejoin="round"${extra}/>`;
  // Starter: bilah + satu bulu, garis tunggal. Standar/legendaris: bentuk penuh dengan garis ganda.
  const base = starter ? body(W_BLADE) + body(W_F1) + body(W_L1) : W_ALL.map((d) => body(d)).join("");
  const lines = starter
    ? `<path d="${S_LEAD}" ${sw(8)}/><path d="${S_F1}" ${sw(7)}/>`
    : `<path d="${S_LEAD}" ${sw(7)}/><path d="${S_LEAD_W}" ${wt(3)}/><path d="${S_LEAD_2}" ${sw(5)}/><path d="${S_ARC}" ${sw(7)}/><path d="${S_ARC_W}" ${wt(3)}/><path d="${S_F1}" ${sw(6)}/><path d="${S_F2}" ${sw(5)}/>`;

  // efek khas tiap tingkat (hanya legendaris), dalam koordinat referensi (garis dan bentuk dibuat lebih tebal agar terbaca setelah diskala 0.27)
  let fx = "";
  if (leg) {
    if (effLv === "easy") fx = `<g transform="translate(997 56) scale(3)"><path class="tw" d="${star}" fill="#fff"/></g><g transform="translate(996 252) scale(2.4)"><path class="tw" style="animation-delay:-.6s" d="${star}" fill="#fff"/></g>`;
    if (effLv === "normal") fx = `<g fill="none" stroke="${th.main}" stroke-width="6" stroke-linecap="round"><path class="flow" d="M668 470 L735 400 L735 330 L805 262 L880 196 L950 130"/><path class="flow" style="animation-delay:-.5s" d="M690 520 L770 440 L790 372 L850 330"/><path class="flow" style="animation-delay:-.9s" d="M880 340 L940 296 L984 268"/></g><g fill="#fff"><circle cx="950" cy="130" r="8"/><circle cx="850" cy="330" r="7"/><circle cx="984" cy="268" r="7"/></g>`;
    if (effLv === "hard") fx = `<path d="M692 300 L780 238 L752 352Z" fill="#fff" opacity=".16"/><path d="M780 238 L936 106 L880 260Z" fill="#fff" opacity=".12"/><path d="M752 352 L880 260 L830 400Z" fill="#fff" opacity=".1"/><g fill="#fff">${[[998, 54, 3.2], [996, 252, 2.6], [958, 378, 2.2]].map(([x, y, k], i) => `<g transform="translate(${x} ${y}) scale(${k})"><path class="tw" style="animation-delay:-${i * .5}s" d="${star}"/></g>`).join("")}</g>`;
    if (effLv === "extreme") fx = `<g transform="translate(748 430)"><path class="gear" d="${gear(44, 10)}" fill="${th.accent}" stroke="#2a1708" stroke-width="3"/><circle r="14" fill="#14111f"/></g><g transform="translate(846 352)"><path class="gearr" d="${gear(28, 8)}" fill="${mix(th.accent, "#ffffff", .25)}" stroke="#2a1708" stroke-width="3"/><circle r="9" fill="#14111f"/></g><g fill="${th.accent}">${[[704, 360], [724, 296], [800, 258], [878, 196]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/>`).join("")}</g>`;
    if (effLv === "hell") fx = [[998, 54, -35, 1], [996, 252, -10, .8], [958, 378, 5, .6]].map(([x, y, r, k], i) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${(k as number) * 3.4})"><path class="fl" style="animation-delay:-${i * .25}s" d="M0 0C-5 -9 -4 -15 0 -26C4 -15 5 -9 0 0Z" fill="#ffd45e"/><path class="fl" style="animation-delay:-${i * .4}s" d="M0 0C-3 -5 -2 -9 0 -15C2 -9 3 -5 0 0Z" fill="#ff5a3d"/></g>`).join("");
  }
  const flap = leg;
  // bulu sekunder dan cuping mengepak sedikit terlambat dari bilah utama (efek berantai)
  const g = (cls: string, delay: number, inner: string) => (flap ? `<g class="${cls}" style="animation-delay:${delay}s">${inner}</g>` : `<g>${inner}</g>`);
  const art =
    g("wing", 0,
      g("wsub", -.12, body(W_FILL) + body(W_L3) + body(W_L2) + body(W_L1) + body(W_F2) + body(W_F1)) +
      body(W_BLADE) + lines + fx);
  const full = starter ? g("wing", 0, base + lines) : art;
  const one = `<g transform="translate(${SX} ${SY}) scale(${WS}) translate(${-RX} ${-RY})">${full}</g>`;
  const clip = (d: string) => `<path d="${d}" transform="translate(${SX} ${SY}) scale(${WS}) translate(${-RX} ${-RY})"/>`;
  const clipAll = W_ALL.map(clip).join("");
  return {
    art: `${one}<g transform="translate(320 0) scale(-1 1)">${one}</g>`,
    clip: `${clipAll}<g transform="translate(320 0) scale(-1 1)">${clipAll}</g>`,
  };
}

function embers(n: number, color: string, seed: number, spread = 70, y0 = 190) {
  const r = rng(seed); let s = "";
  for (let i = 0; i < n; i++) s += `<g transform="translate(${f(CX + (r() - .5) * spread * 2)} ${f(y0 - r() * 50)})"><circle class="ember" style="--dx:${f((r() - .5) * 40)}px;animation-duration:${f(2.2 + r() * 2.2)}s;animation-delay:-${f(r() * 4)}s" r="${f(1.2 + r() * 2.2)}" fill="${color}"/></g>`;
  return s;
}
const bolt = (d: string, c: string, delay = 0) => `<polyline class="bolt" style="animation-delay:${delay}s" points="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round" filter="url(#GLOW)"/>`;

function backFx(lv: AnyLevel, th: Th, p: string) {
  const effLv = effectLv(lv);
  if (effLv === "easy") {
    const g = ["{ }", "</>", ";", "()", "[]", "=>", "//"].map((t, i) => `<g transform="translate(${30 + i * 40} ${200 - (i % 3) * 14})"><text class="drift" style="animation-delay:-${i * .8}s" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="${th.accent}">${esc(t)}</text></g>`).join("");
    return `${ring(p, lv, th)}<g class="spin"><circle cx="${CX}" cy="${CY}" r="124" fill="none" stroke="${th.accent}" stroke-opacity=".55" stroke-width="2" stroke-dasharray="3 9"/><path d="M160 14l9 6-9 6z" fill="${th.accent}"/><path d="M160 262l-9-6 9-6z" fill="${th.accent}"/></g><circle cx="${CX}" cy="${CY}" r="108" fill="none" stroke="${th.main}" stroke-opacity=".25"/>${g}`;
  }
  if (effLv === "normal") {
    let cols = ""; const r = rng(7);
    for (let i = 0; i < 13; i++) { const x = 14 + i * 24, ch = Array.from({ length: 16 }, (_, k) => `<text x="0" y="${k * 18}" font-family="monospace" font-size="11" fill="${th.main}" opacity="${f(.25 + (k % 4) * .12)}">${(k + i) % 2 ? "1" : "0"}</text>`).join(""); cols += `<g transform="translate(${x} ${-20 + (i % 3) * 5})"><g class="rain" style="animation-duration:${f(.9 + r() * 1.2)}s">${ch}</g></g>`; }
    const hex = Array.from({ length: 6 }, (_, k) => `${f(CX + 122 * Math.cos((Math.PI / 3) * k - Math.PI / 6))},${f(CY + 122 * Math.sin((Math.PI / 3) * k - Math.PI / 6))}`).join(" ");
    return `${ring(p, lv, th)}<g opacity=".6" clip-path="url(#${p}bg)">${cols}</g><polygon class="pulse" points="${hex}" fill="none" stroke="${th.accent}" stroke-width="2" filter="url(#GLOW)"/>`;
  }
  if (effLv === "hard") {
    const orb = (R: number, n: number, cls: string, off: number) => `<g class="${cls}">${Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2 + off; return `<g transform="translate(${f(CX + R * Math.cos(a))} ${f(CY + R * Math.sin(a) * .9)})"><path class="tw" style="animation-delay:-${k * .3}s" d="${star}" fill="${k % 2 ? "#fff" : th.accent}"/></g>`; }).join("")}</g>`;
    return `${ring(p, lv, th)}<circle cx="${CX}" cy="${CY}" r="118" fill="none" stroke="${th.main}" stroke-opacity=".3" stroke-dasharray="1 7"/>${orb(120, 9, "spin", 0)}${orb(92, 6, "spinr", .4)}${bolt("112,118 124,128 118,134 130,146", "#bfe0ff")}${bolt("208,118 196,128 202,134 190,146", "#bfe0ff", .5)}`;
  }
  if (effLv === "extreme") {
    const fog = [[0, 78, 50, .38], [120, 90, 56, .3], [240, 70, 48, .34]].map(([a, rx, ry, o], i) => `<g class="${i % 2 ? "spinr" : "spin"}"><ellipse cx="${CX + 52}" cy="${CY}" rx="${rx}" ry="${ry}" fill="${th.main}" opacity="${o}" filter="url(#FOG)" transform="rotate(${a} ${CX} ${CY})"/></g>`).join("");
    const runes = ["COBOL", "ADA", "F77", "PL/I", "LISP"].map((t, i) => `<g transform="translate(${44 + i * 58} ${196 - (i % 2) * 18})"><text class="drift" style="animation-delay:-${i * 1.1}s" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="${th.accent}">${esc(t)}</text></g>`).join("");
    return `${fog}${ring(p, lv, th)}${runes}<g class="spin"><circle cx="${CX}" cy="${CY}" r="122" fill="none" stroke="${th.accent}" stroke-opacity=".6" stroke-width="2" stroke-dasharray="14 6 2 6"/></g>${embers(10, "#d8b4fe", 11, 90, 200)}`;
  }
  // Hell & Primordial God (primordial meminjam profil efek "hell", lihat GOD_EFFECT_PROFILE) berbagi efek sinar
  // emas, gelombang kejut, dan arc text — warnanya mengikuti tema aslinya (Hell: merah-emas, Primordial: ungu-emas kosmik).
  const rays = Array.from({ length: 16 }, (_, i) => `<path transform="rotate(${i * 22.5} ${CX} ${CY})" d="M${CX} ${CY - 46}L${CX - 7} ${CY - 142}L${CX + 7} ${CY - 142}Z" fill="url(#${p}ray)"/>`).join("");
  const arcText = isGodLevel(lv) ? GOD_ARC[lv] : "0x00 · 0xFF · SEPUH · 0x00 · 0xFF · SEPUH · 0x00 · 0xFF · SEPUH · 0x00 ·";
  const arc = arcText ? `<g class="spinf"><path id="${p}arc" d="M${CX - 138} ${CY}a138 138 0 1 1 276 0a138 138 0 1 1 -276 0" fill="none"/><text font-family="monospace" font-size="10" font-weight="700" fill="${th.accent}" opacity=".85" letter-spacing="3"><textPath href="#${p}arc">${esc(arcText)}</textPath></text></g>` : "";
  return `<g class="spin">${rays}</g><g class="spinr"><circle cx="${CX}" cy="${CY}" r="130" fill="none" stroke="${th.accent}" stroke-width="2.5" stroke-dasharray="2 10"/></g><circle cx="${CX}" cy="${CY}" r="119" fill="none" stroke="${th.main}" stroke-opacity=".6" stroke-width="1.5"/><circle class="shock" cx="${CX}" cy="${CY}" r="120" fill="none" stroke="${th.accent}" stroke-width="3"/><circle class="shock" style="animation-delay:-1.6s" cx="${CX}" cy="${CY}" r="120" fill="none" stroke="${th.main}" stroke-width="2"/>${arc}${bolt("96,70 108,88 100,94 114,114", "#fff")}${bolt("224,70 212,88 220,94 206,114", mix(th.accent, "#ffffff", .3), 1.1)}`;
}

const RING: Record<Level, string> = { easy: "TUTORIAL HELL · MONARCH · ∞ · TUTORIAL HELL · MONARCH · ∞ · ", normal: "FRAMEWORK · OVERLORD · STATE · PROPS · FRAMEWORK · OVERLORD · ", hard: "*PTR · &REF · UNSAFE · MALLOC · FREE · *PTR · &REF · UNSAFE · ", extreme: "LEGACY · NECROMANCER · COBOL · FORTRAN · LEGACY · NECROMANCER · ", hell: "" };
const ring = (p: string, lv: AnyLevel, th: Th) => {
  const text = isGodLevel(lv) ? GOD_RING[lv] : RING[lv as Level];
  return text ? `<g class="spinr"><path id="${p}rt" d="M${CX - 128} ${CY}a128 128 0 1 1 256 0a128 128 0 1 1 -256 0" fill="none"/><text font-family="monospace" font-size="9.5" font-weight="700" fill="${th.accent}" opacity=".8" letter-spacing="2.4"><textPath href="#${p}rt">${esc(text)}</textPath></text></g>` : "";
};
const glints = (th: Th, seed: number) => { const r = rng(seed); return Array.from({ length: 7 }, (_, i) => { const a = r() * Math.PI * 2, d = 96 + r() * 44; return `<g transform="translate(${f(CX + Math.cos(a) * d)} ${f(CY + Math.sin(a) * d * .85)})"><path class="tw" style="animation-delay:-${f(r() * 1.8)}s" d="${star}" fill="${i % 2 ? "#fff" : th.accent}"/></g>`; }).join(""); };

/** Layar monitor lencana, dipecah dua: `stat` = bagian statis (masuk PNG), `txt` = teks singkatan bahasa milik pemain (dinamis → SVG kecil). */
function screen(lv: AnyLevel, th: Th, leg: boolean, tech: string, p: string): { stat: string; txt: string } {
  const effLv = effectLv(lv);
  const t = `x="160" y="135" text-anchor="middle" dominant-baseline="central" font-family="ui-monospace,Menlo,monospace" font-weight="800" font-size="${tech.length > 2 ? 18 : 24}"`;
  const T = esc(tech);
  if (!leg) return { stat: "", txt: `<text ${t} fill="${th.main}">${T}</text>` };
  if (effLv === "easy") return { stat: "", txt: `<text ${t} fill="${th.accent}" class="flick">${T}</text><rect class="blink" x="${tech.length > 2 ? 186 : 176}" y="146" width="9" height="2.5" fill="${th.accent}"/>` };
  if (effLv === "normal") { let c = ""; for (let i = 0; i < 8; i++) c += `<g transform="translate(${124 + i * 10} 100)"><g class="rain" style="animation-duration:${f(.7 + (i % 4) * .25)}s">${Array.from({ length: 6 }, (_, k) => `<text y="${k * 18}" font-family="monospace" font-size="9" fill="${th.main}" opacity=".6">${(k + i) % 2 ? "1" : "0"}</text>`).join("")}</g></g>`; return { stat: `<g clip-path="url(#${p}sc)">${c}</g>`, txt: `<text ${t} fill="#fff" stroke="#052e1b" stroke-width="3" paint-order="stroke">${T}</text>` }; }
  if (effLv === "hard") { let c = ""; for (let i = 0; i < 24; i++) c += `<rect class="blk" style="animation-delay:-${f(((i * 7) % 16) / 10)}s" x="${123 + (i % 8) * 9.4}" y="${112 + Math.floor(i / 8) * 13}" width="7" height="9" rx="1.2" fill="${th.main}"/>`; return { stat: `${c}<text x="123" y="154" font-family="monospace" font-size="5.5" fill="#fff" class="flick">0x7FFE·F0A4</text>`, txt: `<text ${t} fill="#fff" stroke="#0b2a5b" stroke-width="3" paint-order="stroke">${T}</text>` }; }
  if (effLv === "extreme") return { stat: `<rect class="pulse" x="120" y="108" width="80" height="52" fill="${th.main}" opacity=".3"/><g stroke="${th.accent}" stroke-width="1.4" fill="none" class="flick"><path d="M146 108l6 14-9 9 10 12-4 17"/><path d="M152 122l22 4M143 131l-14 4M153 143l24 10" opacity=".7"/></g>`, txt: `<text ${t} fill="#f0d9ff" class="pulse" stroke="#3b0764" stroke-width="3" paint-order="stroke">${T}</text>` };
  return { stat: `<rect class="scan" x="120" y="108" width="80" height="3" fill="#fff" opacity=".18"/><text x="123" y="154" font-family="monospace" font-size="6" fill="#ffd45e" class="flick">0x00 ▸ SEPUH</text>`, txt: `<text ${t} fill="#ff3b3b" class="g1">${T}</text><text ${t} fill="#22d3ee" opacity=".8" class="g2">${T}</text><text ${t} fill="#fff">${T}</text>` };
}

/** react-native-svg tidak menjalankan CSS/animasi/filter. Bersihkan hal-hal itu supaya hasilnya statis & valid;
 *  animasi dibuat native di Badge.tsx (rotasi lapisan latar, melayang, denyut aura, partikel). */
export function staticize(svg: string): string {
  return svg
    .replace(/<ellipse[^>]*filter="url\(#FOG\)"[^>]*\/>/g, "")           // kabut (butuh blur)
    .replace(/<polyline class="bolt"[^>]*\/>/g, "")                         // petir (hanya tampil sesaat di web)
    .replace(/<circle class="shock"[^>]*\/>/g, "")                          // gelombang kejut
    .replace(/<rect class="slice"[^>]*\/>/g, "")                            // glitch slice
    .replace(/<g[^>]*><circle class="ember"[^>]*\/><\/g>/g, "")            // ember (diganti partikel native)
    .replace(/<g[^>]*><rect class="sweep"[^>]*\/><\/g>/g, "")              // kilau menyapu (clip-path + animasi)
    .replace(/ filter="url\(#GLOW\)"/g, "")
    .replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/ dominant-baseline="central"/g, ' dy="0.35em"')
    .replace(/ style="[^"]*"/g, "")
    .replace(/ class="[^"]*"/g, "")
    .replace(/ aria-hidden="true"/g, "");
}

export type BadgeLayers = { back: string; front: string; text: string; fg: string; leg: boolean; hell: boolean; effLv: Level; glow: string; accent: string; main: string };
/** viewBox diperlebar 24 unit di tiap sisi (cincin teks & api sayap melewati 320×280) — Badge.tsx menggeser layer sebesar -24·skala.
 *  Tiga lapisan SVG: `back` (aura + efek latar, diputar), `front` (sayap + monitor + mahkota, melayang), `fg` (kilau bintang). */
export function badgeLayers({ uid, tier, level, tech, size = 320 }: { uid: string; tier: Tier; level: AnyLevel; tech?: string | null; size?: number }): BadgeLayers {
  const p = `b${uid}`, lv: AnyLevel = tier === "starter" ? "easy" : level, th = themeOf(lv);
  const leg = tier === "legendary", effLv = effectLv(lv), W = wings(lv, p, th, tier), hell = effLv === "hell";
  const big = leg && size > 100;
  const crown = leg ? `<path d="M130 100L136 72L149 87L160 62L171 87L184 72L190 100Z" fill="url(#${p}gd)" stroke="${hell ? "#7a4a00" : mix(th.glow, "#000000", .5)}" stroke-width="1.5" stroke-linejoin="round"/><rect x="130" y="98" width="60" height="7" rx="2" fill="url(#${p}gd)" stroke="${hell ? "#7a4a00" : mix(th.glow, "#000000", .5)}" stroke-width="1"/><circle cx="136" cy="72" r="3.2" fill="${hell ? "#ff3b3b" : th.accent}"/><circle cx="160" cy="62" r="3.8" fill="${hell ? "#22d3ee" : "#ffffff"}"/><circle cx="184" cy="72" r="3.2" fill="${hell ? "#ff3b3b" : th.accent}"/>` : "";
  const fg = big ? glints(th, lv.length * 17) : "";
  const aura = leg ? `<circle cx="${CX}" cy="${CY}" r="150" fill="url(#${p}au)"/>` : `<circle cx="${CX}" cy="${CY}" r="120" fill="url(#${p}au)" opacity=".5"/>`;
  const defs = `<defs>
<linearGradient id="${p}wbody" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${mix(th.main, "#0a0d16", .5)}"/><stop offset="1" stop-color="${mix(th.glow, "#0a0d16", .66)}"/></linearGradient>
<linearGradient id="${p}bz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${th.accent}"/><stop offset=".5" stop-color="${th.main}"/><stop offset="1" stop-color="${th.glow}"/></linearGradient>
<linearGradient id="${p}gd" x1="0" y1="0" x2="0" y2="1">${hell ? `<stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#f5c451"/><stop offset="1" stop-color="#b8791a"/>` : `<stop offset="0" stop-color="${mix(th.accent, "#ffffff", .55)}"/><stop offset=".5" stop-color="${th.main}"/><stop offset="1" stop-color="${th.glow}"/>`}</linearGradient>
<linearGradient id="${p}ray" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${th.accent}" stop-opacity=".55"/><stop offset="1" stop-color="${th.main}" stop-opacity="0"/></linearGradient>
<radialGradient id="${p}au"><stop offset="0" stop-color="${th.glow}" stop-opacity=".55"/><stop offset=".6" stop-color="${th.glow}" stop-opacity=".12"/><stop offset="1" stop-color="${th.glow}" stop-opacity="0"/></radialGradient>
<clipPath id="${p}sc"><rect x="120" y="108" width="80" height="52" rx="5"/></clipPath>
<clipPath id="${p}bg"><rect x="0" y="0" width="320" height="280"/></clipPath>
</defs>`;
  const wrap = (inner: string) => staticize(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-24 -24 368 328" width="368" height="328">${defs}${inner}</svg>`);
  const scr = screen(lv, th, leg, abbr(tech), p), back = `${aura}${big ? backFx(lv, th, p) : ""}`;
  const front = `<ellipse cx="${CX}" cy="214" rx="72" ry="8" fill="${th.glow}" opacity=".35"/><g>${W.art}
<path d="M146 176h28l6 13h-40z" fill="#1a1626" stroke="${th.main}" stroke-width="2"/><rect x="132" y="189" width="56" height="7" rx="3.5" fill="url(#${p}bz)"/>
<rect x="112" y="100" width="96" height="72" rx="11" fill="#12101c" stroke="url(#${p}bz)" stroke-width="5"/>
<rect x="120" y="108" width="80" height="52" rx="5" fill="#05040a"/>
<g clip-path="url(#${p}sc)">${scr.stat}<path d="M120 108h44l-26 52h-18z" fill="#fff" opacity=".06"/></g>
<circle cx="198" cy="167" r="1.8" fill="${leg ? "#ff3b3b" : th.main}"/>
${crown}</g>${fg}`;
  const text = wrap(`<g clip-path="url(#${p}sc)">${scr.txt}</g>`);
  return { back: wrap(back), front: wrap(front), text, fg, leg, hell, effLv, glow: th.glow, accent: th.accent, main: th.main };
}
