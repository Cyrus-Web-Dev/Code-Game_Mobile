# Changelog — Kode Tebak Mobile

## 2.5.3 — performa: freeze saat membuka Menu / Mode Permainan / Gelar
- **Penyebab**: lencana digambar sebagai SVG vektor; di Android setiap elemen SVG jadi satu view native. Satu lencana legendaris = 100–400 view; layar Game (5 lencana), Gelar (puluhan), Backdrop (40 bintang per layar) dan Foil (72 path per kartu) membuat ribuan view sekaligus → aplikasi terasa hang.
- **Perbaikan**: lapisan lencana (latar + badan), foil, dan bintang latar kini **PNG yang dirender sekali** (`assets/badges/`, dibuat `scripts/render-badges.ts`) → 2 view gambar per lencana. Hanya teks singkatan bahasa pemain yang tetap SVG kecil (1–3 elemen). Hasil layar & animasi tetap sama.
- Cincin/disc bingkai Master: segmen konik dikurangi (90/120 → 48/60). `badgeLayers` di-cache lintas instance.
- Perbaikan kecil: clip-path hujan angka lencana Normal kini memakai id yang benar.

## 2.5.2 — performa (lanjutan, setelah uji di APK rilis)
- **Penyebab utama patah-patah**: layar yang dibekukan (freezeOnBlur) tetap menjalankan efek animasinya, jadi lencana/partikel di tab belakang terus bergerak saat menjawab soal. Kini ada **gerbang animasi global** (`src/lib/loop.ts`): semua animasi dekoratif berhenti otomatis saat layar Play terbuka atau aplikasi di latar belakang.
- Semua loop dibuat **100% native** (satu timing yang di-loop native + interpolasi bolak-balik), tanpa `sequence`/`delay` yang dijalankan ulang dari JS tiap siklus.
- **Maks. 5 lencana beranimasi bersamaan** (sisanya statis) agar halaman Gelar tidak membebani GPU.
- Mode efek "Otomatis" di Android = **Hemat** (animasi inti lencana saja; tanpa partikel, orbit, foil, konfeti besar, efek Master, bintang berkedip). Pilih "Penuh" di Pengaturan bila HP kuat.
- Kode soal tidak lagi `selectable` di layar permainan (teks selectable di Android lebih berat).

## 2.5.1 — performa
- **Jawab soal tidak lagi lag**: layar yang tertutup (tab di bawah layar Play) dibekukan (`enableFreeze` + `freezeOnBlur`) sehingga tidak ikut di-render ulang di setiap jawaban; sebelumnya semua tab (termasuk halaman Gelar penuh lencana SVG) dirender ulang tiap kali menjawab.
- Bar waktu memakai native driver (`scaleX`) — dulu animasi `width` berjalan di thread JS 60×/detik.
- Latar bintang: 46 View per layar → 1 SVG statis + 6 bintang berkedip.
- Bank soal dimuat lazy (tidak mem-parse ±2,8 MB JSON saat aplikasi dibuka).
- Penyimpanan: tidak menyalin foto profil di tiap aksi, simpan ke disk ditunda 900 ms.
- **Animasi gelar legendaris**: mode "Otomatis" tidak lagi mati karena "Hapus animasi" Android; lencana legendaris yang masih terkunci kini juga beranimasi (pratinjau); animasi berhenti otomatis di layar yang tidak terlihat.
- Skrip `npm run start:fast` (mode produksi di Expo Go: jauh lebih cepat daripada mode dev).

## 2.5.0 (sinkron dengan web v2.4 + v2.5)
**Perbaikan error**
- Metro: `babel-preset-expo` jadi dependensi langsung + cadangan resolusi di `babel.config.js`; `package-lock.json` yang rusak dihapus; skrip `fix-install.bat` & `npm run fix`.
- TypeScript TS2739 di `MasterFrame.tsx`: aura radial kini string SVG (`SvgXml`), bukan `<RadialGradient>` + `.map()`.
- `App.tsx`: bila font gagal dimuat, aplikasi tetap tampil (sebelumnya layar kosong selamanya).
- `Titles.tsx`: komponen `Section` dibuat di dalam render → seluruh lencana di-remount & animasinya reset; diganti fungsi biasa.
- `Play.tsx`: mengganti bahasa tidak lagi bisa memulai ulang sesi; akurasi saat "Keluar" kini benar.
- `Review.tsx`: soal usang tidak lagi memakan jatah 60 item. `store`: guard saat sesi null; `resetAll` ikut menghapus `kt_title`.
- Simpanan: `migrate()` (v1→v2) tahan data rusak/lama; daftar "salah" Developer Mode lama dibuang karena bank soal diganti.

**Sinkron web v2.4 (Developer Hard Mode)** — bank 800 soal/peran (dulu 250); Master = 500 soal & akurasi ≥ 90% (dulu 50/85%);
soal yang belum pernah dijawab diprioritaskan (`save.seen`); teks UI baru; kartu "Semua gelar yang diraih" di Profil.

**Sinkron web v2.5** — Info 3 tab (Bahasa · Tools Keamanan 90 entri dengan grup, peta tahap, peringatan etis · Peran Developer);
konfeti khas tiap tingkat (ketuk lencana legendaris), orbit/partikel God Mode, foil & kilau nama legendaris, efek Master (kilap pil, scanline/aurora, titik orbit, animasi masuk);
anggaran efek (Pengaturan → Efek visual: Otomatis/Penuh/Hemat/Mati; mengikuti "Kurangi gerakan" sistem).

**Logo baru**: monitor komputer `< ? >` (icon, adaptive, monochrome, splash, favicon).
