# Kode Tebak Mobile (Offline) — React Native + TypeScript

Versi mobile **100% offline** dari Kode Tebak v2.5 (sinkron dengan web v2.5) (**Expo SDK 57** · React Native 0.86 · React 19.2 · TypeScript 6).
Tidak ada login, leaderboard, teman, atau panggilan jaringan apa pun: soal, profil, poin, gelar, dan riwayat tersimpan di perangkat.

## Fitur yang ikut
Profil lokal (pengganti register/login) · Mode Easy–Hell (Biasa, Maraton 100, Speedrun) · Daily Challenge (tanggal perangkat) · God Mode (Demi God–Primordial God, hint 3 tahap) ·
Developer Mode (Frontend/Backend/Full Stack + gelar Master) · Gelar (standar, legendaris, SEPUH CODING) + pemilih **bingkai Master** · Lencana beranimasi ·
Profil (statistik, progres gelar, achievement, riwayat, ubah profil + foto) · Review soal salah · Informasi (3 tab: 238 bahasa/framework · 90 tools keamanan · peran Frontend/Backend/Full Stack) ·
Pengaturan (bahasa ID/EN, getar, hapus data) · Kontak developer (**teks saja**, edit di `src/contact.ts`).

## Yang sengaja tidak ada (butuh internet)
Login/daftar/lupa sandi, Peringkat (leaderboard), Teman, riwayat teman, tautan luar. Pengganti offline: kartu *Peringkat per tingkat* di profil menjadi **Statistik per tingkat**
(poin pribadi + akurasi untuk Easy–Hell, God Mode, dan Developer Mode). Efek suara Web Audio diganti **getar (haptics)**. Ekspor PDF diganti tombol **Bagikan profil**.

## Jika muncul "Cannot find module 'babel-preset-expo'" / "reading 'transformFile'"
Instalasi `node_modules` bercampur versi (SDK 52 + 57) sehingga `babel-preset-expo` hanya ada bersarang di `node_modules/expo/node_modules`.
Perbaikan: jalankan `fix-install.bat` (Windows) atau `npm run fix -- --apply`. Intinya: hapus `node_modules` + `package-lock.json` + `.expo`,
`npm install`, `npx expo install --fix`, `npx expo install babel-preset-expo`, lalu `npx expo start -c`. `babel-preset-expo` kini juga tercantum di `devDependencies`,
dan `babel.config.js` punya cadangan pencarian lewat paket `expo`. Jangan menjalankan `npm audit fix --force`.

## Menjalankan (Expo SDK 57)
Syarat: **Node.js 22.13+**.
```bash
npm install
npm run setup          # = npx expo install <paket native> + npx expo install --fix
                       #   (Expo memilihkan versi react-native-svg, screens, safe-area, async-storage, dll. yang cocok dengan SDK 57)
npx expo-doctor        # cek ketidakcocokan versi
npx expo start -c      # -c = bersihkan cache Metro
npm run typecheck      # tsc --noEmit
npm run test:engine    # uji mesin permainan offline di Node (2.415 soal divalidasi)
```
Buka dengan Expo Go yang **versinya cocok dengan SDK 57** (jika Expo Go di toko sudah pindah ke SDK 58, pakai development build: `npx expo run:android`).
APK untuk dibagikan: `npx eas build -p android --profile preview` (akun Expo gratis; hasilnya bisa dipasang offline).
Font (Space Grotesk, JetBrains Mono, Fraunces) dibundel lewat `@expo-google-fonts/*`, jadi tidak ada unduhan saat runtime.

### Catatan upgrade dari SDK 52 → 57
- **File yang diubah:** `package.json` (versi expo/react/react-native/TypeScript + skrip `setup`), `app.json` (splash dipindah ke plugin `expo-splash-screen`; `assetBundlePatterns` dihapus), `src/lib/bank.ts` (JSON diimpor statis, bukan `require`).
- Dari SDK 55 ke atas **hanya New Architecture** yang didukung (kunci `newArchEnabled` sudah tidak ada di app.json). Proyek ini tidak memakai Reanimated, jadi tidak terkena regresi memori Hermes V1 yang dilaporkan di SDK 56/57.
- Android edge-to-edge sudah default; layar memakai `react-native-safe-area-context` sehingga konten tetap berada di luar status bar dan navigation bar.
- `@expo/vector-icons` **deprecated sejak SDK 56** dan tidak lagi dibawa paket `expo`; proyek ini memasangnya eksplisit lewat `npm run setup` dan masih berfungsi. Migrasi ke ikon SVG sendiri bisa dilakukan nanti bila paket itu dihentikan (semua ikon lewat satu komponen `Icon` di `src/components/ui.tsx`).
- iOS minimum 16.4 dan Android 7+; build iOS lokal butuh Xcode 26.4+ (EAS Build sudah menanganinya).

## Arsitektur (padanan dengan web)
| Web | Mobile |
|---|---|
| `/api/game/*` + SQL (`serve_question`, skor, streak, hint) | `src/lib/engine.ts` (fungsi murni, diuji di Node) |
| Supabase (profil, user_stats, riwayat, review) | `src/lib/store.ts` (zustand + AsyncStorage `kt_save_v1`) |
| `supabase/seed/*.sql` | `src/data/q/*.json` (dibuat `scripts/sql_to_json.py`) |
| `config.ts`, `learn.ts`, `i18n.ts` | disalin; i18n memakai AsyncStorage |
| `badge-svg.ts` (SVG + animasi CSS) | `src/lib/badge-svg.ts` → lapisan SVG statis; animasi native di `components/Badge.tsx` |
| `Master.tsx` + CSS conic-gradient | `components/MasterFrame.tsx` (cincin konik dari busur SVG, diputar native) |
| shiki | `components/CodeBlock.tsx` (penyorot ringan, offline) |
| canvas-confetti / three.js | `components/Confetti.tsx`, `components/Backdrop.tsx` |

Memperbarui bank soal: ubah SQL di proyek web, lalu `npm run data` (soal diidentifikasi `tingkat:indeks`, jadi tambahkan soal baru di **akhir** berkas agar riwayat "salah" lama tetap valid).

## Catatan jujur
Kode ditulis dan diuji di lingkungan tanpa emulator: mesin permainan lulus uji Node, SVG lencana divalidasi & dirender di browser, tetapi **UI React Native belum dijalankan di perangkat/emulator**.
Coba di Expo Go dulu dan laporkan jika ada tampilan yang bergeser.
Daily Challenge memakai tanggal perangkat (mengubah jam HP bisa mengakalinya — wajar untuk aplikasi offline). Data hilang bila aplikasi dihapus.
