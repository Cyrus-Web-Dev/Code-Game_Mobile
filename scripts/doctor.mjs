// Diagnosa cepat instalasi:  npm run fix        (hanya memeriksa)
//                            npm run fix -- --apply   (hapus node_modules + lockfile lalu pasang ulang yang benar)
import { createRequire } from "node:module";
import { existsSync, rmSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const require = createRequire(import.meta.url);
const apply = process.argv.includes("--apply");
const ok = (m) => console.log("  ✔", m), bad = (m) => { console.log("  ✖", m); problems.push(m); };
const problems = [];
console.log("Kode Tebak Mobile — diagnosa instalasi\n");
const [maj, min] = process.versions.node.split(".").map(Number);
maj > 22 || (maj === 22 && min >= 13) ? ok(`Node ${process.versions.node}`) : bad(`Node ${process.versions.node} terlalu lama (butuh >= 22.13)`);
const has = (m) => { try { require.resolve(m + "/package.json"); return true; } catch { return false; } };
for (const m of ["expo", "react", "react-native", "babel-preset-expo"]) has(m) ? ok(`${m} terpasang di level atas`) : bad(`${m} TIDAK ditemukan di level atas node_modules (penyebab "Cannot find module '${m}'")`);
if (has("expo")) {
  const v = require("expo/package.json").version; ok(`expo ${v}`);
  const declared = JSON.parse(readFileSync("package.json", "utf8")).dependencies.expo;
  if (existsSync("node_modules/@expo/cli") && has("@expo/cli")) { const top = require("@expo/cli/package.json").version, nested = existsSync("node_modules/expo/node_modules/@expo/cli"); if (nested) bad(`dua salinan @expo/cli (level atas ${top} + bersarang di expo) — instalan bercampur versi SDK`); }
  if (!String(v).startsWith(String(declared).replace(/[~^]/g, "").split(".")[0] + ".")) bad(`versi expo terpasang (${v}) tidak sama dengan package.json (${declared})`);
}
console.log();
if (!problems.length) { console.log("Semua sehat. Jalankan:  npx expo start -c"); process.exit(0); }
if (!apply) { console.log(`${problems.length} masalah. Perbaiki otomatis dengan:  npm run fix -- --apply`); process.exit(1); }
console.log("Menerapkan perbaikan: hapus node_modules, package-lock.json, .expo …");
for (const p of ["node_modules", "package-lock.json", ".expo"]) existsSync(p) && rmSync(p, { recursive: true, force: true });
const run = (c) => spawnSync(c, { stdio: "inherit", shell: true }).status === 0;
if (run("npm install") && run("npx expo install --fix") && run("npx expo install babel-preset-expo")) console.log("\nSelesai. Jalankan:  npx expo start -c"); else { console.log("\nSalah satu langkah gagal — kirim pesan error di atas."); process.exit(1); }
