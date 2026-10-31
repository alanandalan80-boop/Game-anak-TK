> **Integrasi paket Ruang Ceria (internet + satu Google Sheets):** Jika game ini dijalankan dari portal utama, ikuti `README-PORTAL.md` di folder utama. Gunakan `AppsScript_Central.gs` dan konfigurasi Environment Variables pada server Node.js. Jangan isi URL Apps Script langsung di frontend dan jangan deploy backend per-game untuk integrasi portal ini. File `Code.gs` di folder game hanya untuk mode mandiri/arsip.

# Dunia Warna Ceria

Website game edukasi sederhana untuk anak TK usia 4–6 tahun. Dibuat dengan HTML, CSS, JavaScript vanilla, dan backend opsional Google Apps Script + Google Sheets.

## Isi proyek

- `index.html` — struktur halaman, game, dan area pendamping.
- `style.css` — desain responsif.
- `script.js` — logika permainan, suara, bintang, riwayat, dan sinkronisasi.
- `config.js` — konfigurasi URL Apps Script.
- `Code.gs` — backend Apps Script.
- `README.md` — petunjuk ini.

## Menjalankan lokal

1. Ekstrak file ZIP.
2. Buka `index.html` dengan browser modern.
3. Untuk pengalaman terbaik, jalankan melalui server lokal (misalnya ekstensi Live Server di VS Code).
4. Game bisa dimainkan tanpa backend; progres disimpan di `localStorage` browser.

## Menyiapkan Google Sheets

1. Buat Google Spreadsheet baru.
2. Salin ID spreadsheet dari URL. ID adalah bagian di antara `/d/` dan `/edit`.
3. Buka **Extensions / Ekstensi → Apps Script**.
4. Salin isi `Code.gs` ke editor Apps Script.
5. Ganti `GANTI_DENGAN_ID_GOOGLE_SHEETS` pada konstanta `SHEET_ID` dengan ID spreadsheet.
6. Simpan proyek.
7. Pilih fungsi `setupSheets` lalu tekan Run. Berikan izin Google yang diminta. Ini membuat tab `HasilBelajar` dan `Aktivitas`.
8. Pilih **Deploy → New deployment → Web app**.
9. Atur eksekusi sebagai akun pemilik/deployer. Pilih akses sesuai kebijakan akun dan kebutuhan sekolah; jangan membuka laporan sensitif kepada publik.
10. Tekan Deploy dan salin URL Web App yang berakhir dengan `/exec`.
11. Buka website, masuk **Area Guru / Orang Tua**, masukkan URL, lalu tekan **Simpan URL**.

## Cara sinkronisasi

Setelah game selesai, hasil disimpan ke perangkat dan dimasukkan ke antrean. Jika URL Apps Script sudah diatur, website akan mencoba mengirim hasil ke Google Sheets. Jika gagal, hasil tetap ada secara lokal; tekan **Kirim data tertunda** setelah koneksi pulih.

Request menggunakan `POST` dengan `Content-Type: text/plain` agar tidak memicu preflight JSON biasa pada browser. Apps Script tetap harus dideploy dengan benar. Jika lingkungan browser atau kebijakan organisasi memblokir respons, uji endpoint deployment dan periksa log Apps Script.

## Catatan keamanan penting

- Validasi backend membantu menjaga format data, tetapi tidak membuktikan skor yang dikirim browser benar; klien dapat dimodifikasi.
- Web App yang dapat menerima kiriman publik berisiko menerima spam. Tambahkan pembatasan dan autentikasi yang sesuai sebelum penggunaan luas.
- Jangan menyimpan nama lengkap, alamat, foto, atau data sensitif anak.
- Halaman Area Guru di demo ini bukan autentikasi kuat. Jangan menambahkan endpoint laporan privat tanpa pemeriksaan identitas dan otorisasi server-side.
- URL Apps Script bukan rahasia. Jangan menanam token rahasia di `config.js`.
- Apps Script dan Google Sheets memiliki kuota penggunaan.

## Fitur saat ini

- Belajar 10 warna dengan contoh benda dan pengucapan (jika Web Speech API didukung).
- Tebak warna dengan 5 soal per sesi.
- Cari benda sesuai warna dengan 5 tantangan.
- Mewarnai bagian gambar SVG.
- Bintang, riwayat lokal, dan sinkronisasi hasil ke Google Sheets.
- Area Guru/Orang Tua dengan ringkasan lokal.

## Checklist pengujian

- [ ] Beranda dan navigasi dapat digunakan.
- [ ] Kartu warna membuka detail dan pengucapan.
- [ ] Tebak Warna: jawaban benar/salah, soal selanjutnya, dan hasil akhir.
- [ ] Cari Benda: pilihan, skor, dan hasil akhir.
- [ ] Mewarnai: pilih palet, warnai bagian SVG, reset, dan selesai.
- [ ] Bintang dan riwayat tetap ada setelah refresh.
- [ ] Tanpa URL backend, game tetap dapat dimainkan.
- [ ] Dengan URL backend yang benar, hasil masuk ke tab `HasilBelajar`.
- [ ] Uji tampilan di ponsel, tablet, dan desktop.
- [ ] Periksa log Apps Script jika sinkronisasi gagal.
