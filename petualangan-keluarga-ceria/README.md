> **Integrasi paket Ruang Ceria (internet + satu Google Sheets):** Jika game ini dijalankan dari portal utama, ikuti `README-PORTAL.md` di folder utama. Gunakan `AppsScript_Central.gs` dan konfigurasi Environment Variables pada server Node.js. Jangan isi URL Apps Script langsung di frontend dan jangan deploy backend per-game untuk integrasi portal ini. File `Code.gs` di folder game hanya untuk mode mandiri/arsip.

# Petualangan Keluarga Ceria

Website game edukasi anak TK usia 4–6 tahun tentang anggota keluarga. Dibuat menggunakan HTML, CSS, dan JavaScript murni. Permainan inti berjalan tanpa backend; Google Apps Script + Google Sheets bersifat opsional.

## Fitur
- Materi belajar: Ayah, Ibu, Kakak, Adik, Kakek, Nenek.
- Lima mode: Tebak Gambar, Pasangkan Gambar, Siapakah yang Kucari?, Kelompokkan Keluarga, Kuis Keluarga Ceria.
- Suara bahasa Indonesia melalui Web Speech API jika didukung browser.
- Efek suara ringan, poin, bintang, dan ringkasan hasil.
- Penyimpanan lokal di browser menggunakan LocalStorage.
- Dashboard pendamping dengan riwayat dan ekspor CSV.
- Responsif untuk ponsel, tablet, dan komputer.
- Backend Google Apps Script opsional.

## Menjalankan website
Cara termudah:
1. Ekstrak ZIP.
2. Buka folder `keluarga-ceria`.
3. Buka `index.html` di browser modern.

Untuk hasil lebih konsisten, jalankan melalui server lokal:
- Jika Python tersedia, buka terminal di folder proyek lalu jalankan `python -m http.server 8000`.
- Buka `http://localhost:8000`.

## Integrasi Google Sheets (opsional)
1. Buat Google Spreadsheet baru.
2. Salin ID dari URL spreadsheet. ID adalah bagian di antara `/d/` dan `/edit`.
3. Buka Extensions > Apps Script.
4. Salin isi `google-apps-script/Code.gs` ke editor Apps Script.
5. Ganti `GANTI_DENGAN_ID_GOOGLE_SHEETS` dengan ID spreadsheet.
6. Simpan, lalu pilih Deploy > New deployment > Web app.
7. Pilih konfigurasi akses yang sesuai kebijakan organisasi dan kebutuhan privasi. Pahami bahwa deployment yang dapat diakses publik dapat menerima data dari orang lain; jangan menyimpan data pribadi anak.
8. Salin URL Web App.
9. Buka `js/config.js`, isi `GAS_WEB_APP_URL` dengan URL deployment dan ubah `ENABLE_CLOUD_SYNC` menjadi `true`.
10. Simpan lalu muat ulang website.

### Catatan backend
- Frontend menggunakan permintaan `no-cors` untuk mengirim data tanpa membaca respons backend. Karena itu, browser tidak dapat memastikan apakah penyimpanan berhasil; periksa spreadsheet saat pengujian.
- Endpoint contoh ini hanya menyimpan hasil sesi dan tidak menyediakan riwayat terpusat ke frontend.
- Untuk penggunaan nyata di kelas, pertimbangkan pembatasan akses, kuota, spam, kebijakan sekolah, dan review keamanan sebelum deployment publik.
- Jangan menaruh password, token rahasia, atau data identitas anak di frontend.
- `LocalStorage` hanya tersedia pada browser/perangkat yang sama dan dapat terhapus saat data browser dibersihkan.

## Pengujian manual
1. Buka halaman utama, tekan Belajar Dulu dan dengarkan kartu.
2. Mainkan kelima mode.
3. Pastikan poin bertambah untuk jawaban benar.
4. Selesaikan satu permainan lalu periksa halaman Guru (jawaban gerbang: 5 untuk 3 + 2).
5. Unduh CSV.
6. Uji tombol suara aktif/nonaktif.
7. Uji di lebar layar ponsel.
8. Jika mengaktifkan Apps Script, lakukan uji dengan data non-pribadi dan periksa tab `HASIL_PERMAINAN`.

## Catatan desain pembelajaran
- Permainan tidak memberi hukuman poin untuk jawaban salah.
- Gunakan sebagai pendamping belajar, bukan penilaian perkembangan anak secara formal.
- Struktur keluarga berbeda-beda; materi dirancang sederhana dan tidak menyatakan bahwa semua keluarga harus sama.
