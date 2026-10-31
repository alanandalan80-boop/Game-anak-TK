> **Integrasi paket Ruang Ceria (internet + satu Google Sheets):** Jika game ini dijalankan dari portal utama, ikuti `README-PORTAL.md` di folder utama. Gunakan `AppsScript_Central.gs` dan konfigurasi Environment Variables pada server Node.js. Jangan isi URL Apps Script langsung di frontend dan jangan deploy backend per-game untuk integrasi portal ini. File `Code.gs` di folder game hanya untuk mode mandiri/arsip.

# Dunia Ceria — Belajar Baca (v2)

Website game edukasi anak TK berbasis Google Apps Script + Google Sheets.

## File
- `google-apps-script/Code.gs`: backend dan database.
- `google-apps-script/Index.html`, `Styles.html`, `Scripts.html`: UI, CSS, logika game.
- `Preview.html`: versi satu file untuk melihat tampilan di komputer (tanpa Sheets; dashboard guru tidak aktif).

## Yang baru di v2
- **Materi dinamis**: game kini membaca sheet `Materi` (huruf, suku kata, kata, kalimat). Jika kategori kurang dari 4 baris, dipakai materi bawaan.
- **Soal lebih bervariasi**: huruf (pilih huruf awal, huruf kecil, tebak dari suara), suku kata (lihat/dengar), baca kata (dengan/tanpa bantuan suku kata, pilih gambar dari kata), kalimat bergambar dengan sorotan kata saat dibacakan. Materi contoh bertambah (21 kata, 11 kalimat).
- **Latih yang salah**, bintang 1–3, efek suara, konfeti, jawaban benar dibacakan.
- **Profil anak** (nama panggilan + teman belajar, hanya di perangkat), **8 lencana**, **hari beruntun**, level, skor terbaik per modul.
- **Offline aman**: hasil latihan masuk antrean dan dikirim ulang saat online; penyimpanan tidak error bila localStorage diblokir.
- **Dashboard guru**: akurasi per materi, daftar peserta, riwayat; PIN dibatasi 5 kali salah (kunci 15 menit); semua teks di-escape.
- **Backend**: cache materi 5 menit, pembatas kirim data, validasi modul.
- **Aksesibilitas**: skip link, label ARIA, navigasi keyboard (angka 1–4, Enter), dukungan reduced-motion.

## Instalasi
1. Buka https://script.google.com/ → proyek baru bernama `Dunia Ceria - Belajar Baca`.
2. Tempel `Code.gs`; buat tiga file HTML bernama tepat `Index`, `Styles`, `Scripts`.
3. Jalankan fungsi `setupDuniaCeria` sekali (setujui izin).
4. **Project Settings > Script Properties**: tambah `TEACHER_PIN` (PIN rahasia Anda).
5. **Deploy > New deployment > Web app**; Execute as: Me; atur akses sesuai kebutuhan.
6. Setelah mengubah kode: **Deploy > Manage deployments > Edit > versi baru**.

## Upgrade dari v1
Sheet `Materi` lama berisi materi contoh lama. Untuk memakai materi baru jalankan `resetMateriContoh()` (menimpa isi sheet Materi). Bila Anda sudah mengedit materi sendiri, jangan dijalankan; cukup tambah baris baru.

## Format sheet Materi
| kategori | materi | jawaban | gambar |
|---|---|---|---|
| huruf | `A / a — Ayam` | `A` | 🐔 |
| suku kata | `BA` | `BA` | 🔤 |
| kata | `BO-LA = BOLA` | `BOLA` | ⚽ |
| kalimat | `INI BOLA.` | `INI BOLA.` | ⚽ |

Untuk `kata`, bagian sebelum `=` adalah pemisahan suku kata (dipakai game Susun Kata). Pakai emoji berbeda untuk tiap baris agar pilihan gambar tidak ambigu. Perubahan tampil maksimal 5 menit kemudian, atau jalankan `hapusCacheMateri()`.

## Catatan
- `google.script.run` hanya bekerja di halaman yang disajikan Apps Script.
- PIN adalah perlindungan sederhana. Jangan menyimpan data pribadi anak; yang tersimpan hanya kode acak dan skor.
- Suara memakai Web Speech API; ketersediaan suara `id-ID` bergantung perangkat. Mode "tebak dari suara" otomatis diganti bila suara tidak didukung.
