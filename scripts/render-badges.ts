// Menghasilkan PNG lapisan lencana (assets/badges/*.png) + src/lib/badge-images.ts dari badge-svg.ts.
// Jalankan HANYA bila desain lencana berubah:  npx tsx scripts/render-badges.ts   (butuh `sharp`: npm i -D sharp)
// Alasan: menggambar lencana sebagai SVG vektor membuat Android membuat ratusan view per lencana → layar Game/Gelar freeze.
import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { badgeLayers } from "../src/lib/badge-svg";
import { LEVEL_IDS, GOD_IDS, anyTheme } from "../src/lib/config";
import { foilXml } from "../src/lib/foil-svg";
import { STARS_SVG } from "../src/lib/stars-svg";

const SCALE = 1.75, W = Math.round(368 * SCALE), H = Math.round(328 * SCALE);
async function main() {
  let sharp: any;
  try { sharp = (await import("sharp")).default; } catch { sharp = createRequire(process.cwd() + "/package.json")("sharp"); }
  mkdirSync("assets/badges", { recursive: true });
  const combos: { tier: "starter" | "standard" | "legendary"; level: string }[] = [{ tier: "starter", level: "easy" }, ...[...LEVEL_IDS, ...GOD_IDS].flatMap((l) => (["standard", "legendary"] as const).map((tier) => ({ tier, level: l as string })))];
  const lines: string[] = [];
  for (const c of combos) {
    const L = badgeLayers({ uid: "r", tier: c.tier, level: c.level as never, tech: "JS", size: 320 });
    for (const [part, svg] of [["back", L.back], ["front", L.front]] as const) {
      const name = `${c.tier}_${c.level}_${part}`;
      await sharp(Buffer.from(svg), { density: 72 * SCALE }).resize(W, H).png({ palette: true, quality: 92, compressionLevel: 9, effort: 8 }).toFile(`assets/badges/${name}.png`);
      lines.push(`  "${name}": require("../../assets/badges/${name}.png"),`);
    }
  }
  // foil (satu per warna tema) + bintang latar
  const foil: string[] = [], seen = new Set<string>();
  for (const l of [...LEVEL_IDS, ...GOD_IDS]) {
    const th = anyTheme(l as never), id = th.main.slice(1); if (seen.has(id)) continue; seen.add(id);
    await sharp(Buffer.from(foilXml(th.main, th.accent, 300)), { density: 144 }).resize(300, 300).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(`assets/badges/foil_${id}.png`);
    foil.push(`  "${id}": require("../../assets/badges/foil_${id}.png"),`);
  }
  await sharp(Buffer.from(STARS_SVG), { density: 400 }).resize(400, 800, { fit: "fill" }).png({ palette: true, compressionLevel: 9 }).toFile("assets/badges/stars.png");
  writeFileSync("src/lib/badge-images.ts", `// OTOMATIS dari scripts/render-badges.ts — jangan diedit tangan.\ndeclare const require: (id: string) => number;\nexport const BADGE_IMG: Record<string, number> = {\n${lines.join("\n")}\n};\nexport const BADGE_PX = { w: ${W}, h: ${H} };\nexport const FOIL_IMG: Record<string, number> = {\n${foil.join("\n")}\n};\nexport const STARS_IMG: number = require("../../assets/badges/stars.png");\n`);
  console.log("selesai:", combos.length * 2, "gambar");
}
main();
