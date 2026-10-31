> **Integrasi paket Ruang Ceria (internet + satu Google Sheets):** Jika game ini dijalankan dari portal utama, ikuti `README-PORTAL.md` di folder utama. Gunakan `AppsScript_Central.gs` dan konfigurasi Environment Variables pada server Node.js. Jangan isi URL Apps Script langsung di frontend dan jangan deploy backend per-game untuk integrasi portal ini. File `Code.gs` di folder game hanya untuk mode mandiri/arsip.

# Belajar Tulis Ceria

Website latihan menulis sederhana untuk anak TK. Frontend menggunakan HTML, CSS, JavaScript murni dan Canvas. Progres dasar disimpan di `localStorage`, sehingga aplikasi dapat digunakan tanpa backend online.

## Menjalankan di komputer
1. Ekstrak ZIP.
2. Buka `index.html` dengan browser modern.
3. Untuk hasil lebih konsisten, jalankan folder melalui ekstensi Live Server di VS Code atau server lokal statis.

Font Nunito diambil dari Google Fonts jika internet tersedia; fallback font tetap disediakan.

## Fitur
- Huruf A–Z, angka 0–20, kata sederhana.
- Latihan menelusuri bentuk target dengan mouse atau sentuhan.
- Suara panduan jika browser mendukung Web Speech API.
- Bintang dan progres tersimpan di perangkat.
- Kanvas menggambar bebas, pilihan warna/ukuran, undo, hapus, dan simpan PNG.

**Catatan pembelajaran:** skor bintang saat ini adalah indikator sederhana berdasarkan aktivitas menggambar, bukan penilaian akurasi tulisan yang tervalidasi secara pedagogis.

## Menyiapkan Google Sheets + Apps Script (opsional)
1. Buat Google Spreadsheet baru.
2. Salin ID spreadsheet dari URL.
3. Buka Extensions → Apps Script.
4. Salin isi `google-apps-script/Code.gs` ke proyek Apps Script.
5. Di Project Settings → Script Properties, tambahkan `SPREADSHEET_ID` dengan nilai ID spreadsheet.
6. Jalankan fungsi `setupSheets` sekali dari editor dan berikan izin yang diminta.
7. Deploy → New deployment → Web app. Pilih izin akses dengan hati-hati sesuai kebutuhan organisasi.
8. Jangan membuka spreadsheet langsung ke publik. Endpoint publik tanpa autentikasi dapat disalahgunakan; jangan simpan data pribadi anak.
9. Untuk frontend terpisah, `ContentService` dapat mengalami kendala CORS/preflight. Jangan menganggap `fetch` lintas origin pasti berhasil. Pola yang lebih sederhana adalah menyajikan frontend melalui Apps Script HTML Service dan memanggil fungsi server dengan `google.script.run`; backend perlu diadaptasi untuk fungsi callable tersebut.

Backend contoh ini adalah titik awal dan belum terhubung otomatis ke UI frontend. Versi frontend tetap bekerja secara lokal tanpa konfigurasi backend.

## Privasi dan penggunaan
Gunakan nickname lokal saja. Tidak ada login, analitik, iklan, atau pengiriman data otomatis. Untuk penggunaan nyata di sekolah, lakukan peninjauan privasi dan keamanan sebelum mengaktifkan sinkronisasi online.
