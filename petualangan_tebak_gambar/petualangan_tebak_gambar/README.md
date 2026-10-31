> **Integrasi paket Ruang Ceria (internet + satu Google Sheets):** Jika game ini dijalankan dari portal utama, ikuti `README-PORTAL.md` di folder utama. Gunakan `AppsScript_Central.gs` dan konfigurasi Environment Variables pada server Node.js. Jangan isi URL Apps Script langsung di frontend dan jangan deploy backend per-game untuk integrasi portal ini. File `Code.gs` di folder game hanya untuk mode mandiri/arsip.

# Petualangan Tebak Gambar

Website game edukasi sederhana untuk anak TK (4–6 tahun). Frontend menggunakan HTML, CSS, JavaScript vanilla. Backend opsional menggunakan Google Apps Script + Google Sheets.

## Jalankan demo lokal
1. Ekstrak ZIP.
2. Buka `index.html` di browser. Untuk pengalaman terbaik, jalankan dengan ekstensi Live Server di VS Code.
3. Pilih kategori dan mainkan. Mode demo menggunakan soal contoh di `js/app.js`.
4. Skor bintang dan riwayat hasil lokal disimpan di `localStorage` browser.

> Mode demo tidak membutuhkan Google Sheets. Jika membuka langsung dengan `file://`, beberapa fitur browser mungkin terbatas. Live Server direkomendasikan.

## Hubungkan ke Google Sheets
1. Buat Google Spreadsheet baru.
2. Salin ID spreadsheet dari URL: `https://docs.google.com/spreadsheets/d/ID_SPREADSHEET/edit`.
3. Buka **Extensions > Apps Script**.
4. Tempel isi `Code.gs` ke editor Apps Script.
5. Di **Project Settings > Script Properties**, tambahkan:
   - Property: `SPREADSHEET_ID`
   - Value: ID spreadsheet yang disalin.
6. Jalankan fungsi `setupDatabase()` dari editor, lalu izinkan akses yang diminta. Fungsi ini membuat sheet dan header.
7. Jalankan fungsi `addSampleQuestion()` untuk menambahkan contoh soal awal.
8. Deploy > **New deployment** > pilih **Web app**.
9. Atur eksekusi sebagai akun pemilik dan akses sesuai kebutuhan organisasi. Endpoint baca soal dan simpan hasil pada contoh ini memang dirancang publik; jangan simpan data pribadi anak.
10. Salin URL Web App yang berakhiran `/exec`.
11. Buka `js/app.js`, isi `API_URL` dengan URL tersebut.
12. Muat ulang website dan periksa tab Questions serta GameResults di spreadsheet.

## Struktur sheet
- `Questions`: bank soal dan pilihan jawaban.
- `Categories`: daftar kategori.
- `GameResults`: hasil permainan anonim.
- `Achievements`: struktur awal untuk pencapaian.
- `Settings`: pengaturan aplikasi.

Header dibuat otomatis oleh `setupDatabase()`. Tambahkan soal ke sheet `Questions`, satu baris per soal. Kolom `is_active` diisi `TRUE` untuk soal yang aktif.

## Penting tentang gambar
Demo awal menggunakan emoji sebagai ilustrasi agar bisa langsung dimainkan tanpa mengunduh aset. Untuk menggunakan foto/ilustrasi sungguhan, isi `image_url` dengan URL gambar yang dapat diakses browser dan sesuaikan fungsi `renderQuestion()` di `js/app.js` agar menampilkan elemen gambar `<img>` alih-alih emoji. Untuk akses Google Drive, pastikan pengaturan berbagi gambar mengizinkan tampilan yang diperlukan; jangan gunakan URL berbagi Drive mentah tanpa menguji apakah URL tersebut dapat ditampilkan sebagai gambar.

## Keamanan dan batasan versi awal
- Halaman admin penuh belum dibuat pada versi starter ini.
- Endpoint publik hanya menyediakan baca kategori/soal aktif dan menyimpan hasil anonim.
- Fungsi tambah/edit/hapus soal melalui API admin belum dibuka; edit soal sementara dapat dilakukan langsung di Google Sheets oleh pemilik.
- Jangan menaruh kata sandi, token rahasia, atau kredensial di JavaScript frontend.
- Sebelum dipakai secara luas, tambahkan otorisasi admin server-side dan pembatasan penyalahgunaan endpoint.
- Karena Google Apps Script ContentService memiliki perilaku redirect dan pembatasan browser, uji integrasi dari hosting yang dipilih. Jika muncul masalah CORS, gunakan arsitektur HTML Service dengan `google.script.run` atau hosting frontend dan backend dengan strategi autentikasi yang konsisten.

## Pengujian cepat
- Buka beranda di HP dan desktop.
- Pilih kategori.
- Pastikan pertanyaan, opsi, dan feedback tampil.
- Pilih jawaban salah lalu coba jawaban lain.
- Pilih jawaban benar dan pastikan tombol lanjut aktif.
- Selesaikan ronde dan periksa skor.
- Setelah backend terpasang, pastikan soal dibaca dari sheet dan hasil muncul di `GameResults`.
