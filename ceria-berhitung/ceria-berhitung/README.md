> **Integrasi paket Ruang Ceria (internet + satu Google Sheets):** Jika game ini dijalankan dari portal utama, ikuti `README-PORTAL.md` di folder utama. Gunakan `AppsScript_Central.gs` dan konfigurasi Environment Variables pada server Node.js. Jangan isi URL Apps Script langsung di frontend dan jangan deploy backend per-game untuk integrasi portal ini. File `Code.gs` di folder game hanya untuk mode mandiri/arsip.

# Ceria Berhitung

Website game edukasi berhitung anak TK. Frontend statis (HTML/CSS/JavaScript) terpisah dari Google Apps Script dan Google Sheets.

## Fitur
- Kenali angka 1–10, hitung benda, penjumlahan, pengurangan, pasangkan angka/jumlah, tantangan campuran.
- Layout responsif dan ramah layar sentuh.
- Suara sederhana dan instruksi Text-to-Speech bila browser mendukung.
- Skor, bintang, riwayat lokal, dan antrean sinkronisasi.
- API Google Apps Script untuk menyimpan hasil dan membaca progres.
- Nama panggilan opsional; tidak meminta identitas sensitif.

## Struktur
- `index.html`: struktur halaman
- `css/style.css`: desain responsif
- `js/app.js`: navigasi dan alur permainan
- `js/games.js`: pembuat soal
- `js/audio.js`: suara dan ucapan
- `js/storage.js`: LocalStorage dan antrean sinkronisasi
- `js/api.js`: komunikasi dengan API
- `google-apps-script/Code.gs`: backend

## A. Menjalankan secara lokal
1. Ekstrak folder proyek.
2. Buka `index.html` di browser modern. Untuk hasil paling konsisten, gunakan server lokal statis, misalnya ekstensi Live Server pada VS Code.
3. Masukkan nama panggilan atau kosongkan, lalu mulai bermain.
4. Tanpa konfigurasi API, game tetap berjalan dan hasil disimpan di LocalStorage pada browser/perangkat yang sama.

## B. Membuat database Google Sheets
1. Buat Google Spreadsheet baru, misalnya `Database Ceria Berhitung`.
2. Salin ID spreadsheet dari URL: bagian di antara `/d/` dan `/edit`.
3. Di spreadsheet pilih **Extensions > Apps Script**.
4. Ganti kode awal dengan isi `google-apps-script/Code.gs`.
5. Buka **Project Settings** (ikon roda gigi) > **Script Properties** > Add script property.
6. Isi:
   - Property: `SPREADSHEET_ID`
   - Value: ID spreadsheet yang disalin tadi.
7. Simpan. Dari dropdown fungsi, pilih `setupDatabase`, lalu klik Run.
8. Ikuti permintaan izin Google. Fungsi ini membuat sheet `Pemain`, `RiwayatPermainan`, dan `ProgresBelajar` beserta headernya.

## C. Deploy Apps Script sebagai Web App
1. Di Apps Script klik **Deploy > New deployment**.
2. Pilih jenis **Web app**.
3. Atur **Execute as**: akun pemilik/deployer agar script menulis ke spreadsheet milikmu.
4. Atur akses sesuai kebutuhan organisasi dan kebijakan Google Workspace. Untuk percobaan pribadi, gunakan akses paling terbatas yang masih memungkinkan browser pengguna mengakses API. Jika memilih akses publik/anonymous, pahami bahwa endpoint dapat dipanggil siapa pun yang mengetahui URL; validasi pada kode bukan pengganti autentikasi.
5. Klik Deploy dan salin URL yang berakhir dengan `/exec`. Jangan gunakan URL `/dev` untuk website publik.
6. Simpan URL tersebut untuk langkah berikutnya.

## D. Hubungkan website ke API
1. Buka `js/api.js`.
2. Ubah baris `const API_URL = "";` menjadi:
   ```js
   const API_URL = "https://script.google.com/macros/s/ID_DEPLOYMENT_ANDA/exec";
   ```
3. Simpan dan unggah ulang file frontend ke hosting.
4. Uji permainan sampai hasil selesai, lalu periksa sheet `RiwayatPermainan`.
5. Hasil lokal yang belum tersinkron dapat dikirim melalui Area Orang Tua/Guru > Sinkronkan data lokal.

## E. Hosting frontend
Pilihan hosting statis:
- GitHub Pages
- Netlify
- Firebase Hosting
- Hosting web sekolah sendiri

Unggah seluruh folder frontend (`index.html`, `css/`, `js/`, `assets/`). File Google Apps Script tidak perlu diunggah ke hosting frontend.

## F. Pengujian minimum
- Buka website di desktop dan ponsel.
- Mainkan setiap mode dan pastikan jawaban benar/salah memberi umpan balik.
- Pastikan jumlah benar, bintang, dan hasil akhir sesuai.
- Mainkan saat API belum diatur: hasil harus tersimpan lokal.
- Atur API dan uji sinkronisasi.
- Coba offline, lalu online kembali dan tekan Sinkronkan data lokal.
- Pastikan baris hasil masuk ke `RiwayatPermainan`.
- Pastikan progres pemain diperbarui di `ProgresBelajar`.

## Catatan integrasi lintas domain
Browser dapat membatasi respons lintas domain (CORS), dan perilaku deployment Apps Script dapat berbeda menurut akun, kebijakan Workspace, serta redirect Google. Kode frontend hanya menandai hasil tersinkron jika menerima respons JSON sukses. Jika browser melaporkan CORS atau redirect error:
1. Periksa Console/Network browser dan deployment Web App.
2. Pastikan URL `/exec` benar dan akses deployment sesuai.
3. Untuk produksi, pertimbangkan proxy backend pada domain yang sama dengan website atau backend terautentikasi; jangan menganggap `mode: "no-cors"` sebagai solusi karena responsnya tidak dapat dibaca dan keberhasilan tidak bisa diverifikasi.

## Keamanan dan privasi
- ID pemain acak dan nama panggilan bukan autentikasi. Pengguna dapat memodifikasi permintaan dari browser.
- Jangan gunakan skor dari klien sebagai data penilaian resmi tanpa validasi tambahan.
- Endpoint publik dapat disalahgunakan. Untuk penggunaan banyak kelas, pertimbangkan autentikasi guru, rate limiting/proxy, serta pemisahan akses tiap kelas.
- Jangan masukkan nama lengkap, tanggal lahir, alamat, foto, atau data sensitif anak.
- Tombol hapus progres hanya menghapus data lokal; data Google Sheets harus dikelola terpisah oleh pemilik spreadsheet.
- Prompt soal dan jawaban diproses di browser; ini game latihan, bukan sistem ujian anti-kecurangan.

## Keterbatasan versi awal
- Ringkasan orang tua/guru saat ini menampilkan riwayat lokal perangkat. Fungsi API pembacaan progres sudah disediakan untuk pengembangan dashboard online lanjutan.
- Mode “Pasangkan” saat ini memakai pola pilihan jumlah, bukan drag-and-drop, supaya lebih mudah digunakan di layar sentuh.
- Tantangan campuran belum memakai batas waktu dan tidak memberi penalti atas jawaban salah.
