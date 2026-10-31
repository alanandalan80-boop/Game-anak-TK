> **Integrasi paket Ruang Ceria (internet + satu Google Sheets):** Jika game ini dijalankan dari portal utama, ikuti `README-PORTAL.md` di folder utama. Gunakan `AppsScript_Central.gs` dan konfigurasi Environment Variables pada server Node.js. Jangan isi URL Apps Script langsung di frontend dan jangan deploy backend per-game untuk integrasi portal ini. File `Code.gs` di folder game hanya untuk mode mandiri/arsip.

# Dunia Hewan 3D

Starter website edukasi anak TK bertema macam-macam hewan. Frontend menggunakan HTML, CSS, JavaScript vanilla; backend opsional menggunakan Google Apps Script dan Google Sheets.

## Isi proyek
- `index.html`: area permainan anak.
- `teacher.html`: dashboard guru demo dan ekspor CSV.
- `css/style.css`: gaya responsif.
- `js/app.js`: galeri hewan, navigasi, dan tujuh mini game.
- `js/teacher.js`: dashboard dan laporan demo.
- `js/config.js`: konfigurasi endpoint.
- `google-apps-script/Code.gs`: backend starter.
- `google-apps-script/appsscript.json`: konfigurasi Apps Script.

## Jalankan lokal
1. Ekstrak folder proyek.
2. Buka `index.html` di browser modern. Sebagian fitur frontend dapat dicoba langsung; untuk pengalaman yang lebih konsisten, jalankan melalui server statis lokal.
3. Buka `teacher.html`. Untuk demo dashboard, isi email apa saja dan kode `DEMO-GURU`.
4. Hasil permainan disimpan pada LocalStorage browser. Data lokal bukan database bersama dan tidak otomatis muncul di perangkat lain.

## Google Sheets dan Apps Script
1. Buat Google Spreadsheet baru.
2. Salin ID spreadsheet dari URL: bagian di antara `/d/` dan `/edit`.
3. Buka Extensions > Apps Script.
4. Tempel isi `google-apps-script/Code.gs` ke editor Apps Script.
5. Di Project Settings > Script Properties, tambahkan `SPREADSHEET_ID` dengan nilai ID spreadsheet.
6. Simpan lalu jalankan `initializeDatabase` dari editor Apps Script. Berikan izin Google yang diminta.
7. Deploy > New deployment > Web app. Pilih pengaturan akses sesuai kebijakan sekolah. Jangan membuat data siswa publik.
8. Salin URL Web App yang berakhir `/exec`, lalu isi `API_URL` di `js/config.js`.

## Catatan integrasi dan keamanan
- Backend ini merupakan starter: menyimpan sesi dasar dan menyediakan daftar hewan dari sheet.
- Autentikasi guru produksi belum diimplementasikan. Kode `DEMO-GURU` hanya untuk dashboard demo lokal, jangan dipakai untuk data sekolah nyata.
- Endpoint laporan/manajemen siswa belum dibuka karena harus dilindungi autentikasi server yang benar.
- Untuk produksi, gunakan identitas Google atau provider autentikasi yang dapat diverifikasi server, lalu lakukan otorisasi setiap request guru.
- Skor yang dikirim dari browser bisa dimanipulasi. Untuk nilai resmi, simpan jawaban per soal dan hitung ulang skor di server.
- Jika frontend dan Apps Script berbeda origin, uji permintaan `fetch` pada deployment aktual. Apps Script Web App memiliki batasan CORS; jangan menggunakan `no-cors` dengan asumsi respons JSON dapat dibaca.
- Aset karakter saat ini memakai emoji sebagai fallback visual, bukan model 3D interaktif. Untuk 3D sesungguhnya, tambahkan model GLB/GLTF yang lisensinya sesuai dan integrasikan renderer seperti Three.js.

## Uji cepat
- Buka setiap menu.
- Filter galeri hewan.
- Mainkan semua mini game dan cek layar hasil.
- Refresh browser dan pastikan progres lokal masih ada.
- Buka dashboard demo dan ekspor CSV.
- Setelah Apps Script dikonfigurasi, periksa sheet `GameSessions` untuk sesi baru.
