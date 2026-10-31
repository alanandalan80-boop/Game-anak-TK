# Ruang Ceria — Portal 7 Game + Google Sheets Pusat

## Arsitektur
Semua game disajikan dari satu aplikasi Node.js. Browser tidak lagi menghubungi Google Apps Script secara langsung:
1. Guru masuk ke portal.
2. Game mengirim hasil ke endpoint same-origin `/api/game-result`.
3. Server Node.js memeriksa sesi login dan meneruskan permintaan ke Apps Script pusat.
4. Apps Script memvalidasi token server lalu menyimpan hasil ke satu Google Spreadsheet.

Bank soal Petualangan Tebak Gambar dapat dibaca dari tab `Questions` melalui endpoint `/api/game-questions`. Jika bank soal belum diisi, game menggunakan soal demo bawaan.

## Game yang terhubung
- Belajar Tulis Ceria
- Ceria Berhitung
- Dunia Hewan 3D
- Dunia Ceria — Belajar Baca (versi `Preview.html` yang disajikan portal)
- Dunia Warna Ceria
- Petualangan Keluarga Ceria
- Petualangan Tebak Gambar

Pada portal tersedia profil pemain berupa nama panggilan/inisial dan kelas opsional. Saat profil diubah, browser membuat ID pemain anonim baru agar rekap terpisah. Gunakan nama panggilan/inisial, bukan nama lengkap. Jika siswa yang sama memakai perangkat berbeda, masing-masing perangkat memiliki ID berbeda.

## Struktur tab Google Sheets
`setupRuangCeria()` menyiapkan tab:
- `Pengguna`, `Guru`
- `Questions`, `Categories`
- `Game_Tulis`, `Game_Berhitung`, `Game_Hewan`, `Game_Baca`, `Game_Warna`, `Game_Keluarga`, `Game_Tebak_Gambar`
- `Log_Permainan` — gabungan seluruh hasil
- `Rekap_Nilai` — rekap agregat per ID pemain

Untuk Petualangan Tebak Gambar, isi bank soal di tab `Questions`. Kolom yang digunakan:
`question_id, category_id, question_text, image_url, correct_answer, option_1, option_2, option_3, option_4, hint_text, audio_url, difficulty, is_active, created_at, updated_at`.
Isi `is_active` dengan `TRUE` agar soal dipakai.

## A. Siapkan Google Spreadsheet
1. Buat satu Google Spreadsheet baru khusus Ruang Ceria.
2. Buka **Extensions / Ekstensi → Apps Script** dari spreadsheet tersebut.
3. Ganti isi file `Code.gs` dengan seluruh isi `AppsScript_Central.gs` dari ZIP ini.
4. Di **Project Settings → Script Properties**, tambahkan:
   - `SERVER_API_TOKEN` = token acak panjang (minimal 32 karakter; buat unik dan jangan dibagikan). Buat token dari terminal dengan `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `SPREADSHEET_ID` akan diisi otomatis oleh fungsi setup bila proyek Apps Script dibuat dari spreadsheet. Jika tidak, isi dengan ID spreadsheet secara manual.
5. Simpan. Pilih fungsi `setupRuangCeria`, klik **Run**, dan berikan izin Google. Fungsi ini membuat tab dan header.
6. Deploy → **New deployment** → pilih **Web app**:
   - Execute as: **Me**.
   - Who has access: pilih opsi yang memungkinkan server hosting mengakses Web App. Pada akun yang menyediakan opsi **Anyone**, endpoint tetap dilindungi token server. Ikuti kebijakan Google Workspace/sekolah; jika akses anonim dilarang admin, deployment publik ini tidak dapat dipakai tanpa mekanisme autentikasi Google yang disetujui.
7. Salin URL Web App yang berakhir `/exec`. Jangan gunakan URL `/dev`.

**Penting:** `SERVER_API_TOKEN` harus sama persis dengan `RUANG_CERIA_GAS_TOKEN` pada hosting Node.js. Token tidak boleh ditulis di JavaScript frontend, file publik, atau dibagikan kepada pengguna.

## B. Siapkan hosting Node.js
Hosting harus mendukung Node.js 18+ dan menjalankan proses server, bukan hanya hosting file statis.
1. Unggah/ekstrak seluruh folder `Game Taman kanak Kanak` ke hosting.
2. Atur Start Command: `node server.js`.
3. Atur Environment Variables berikut (lihat `.env.example`):
   - `NODE_ENV=production`
   - `PORT` (biasanya diberikan otomatis oleh hosting)
   - `RUANG_CERIA_USER` = username guru/admin
   - `RUANG_CERIA_PASSWORD` = password panjang dan unik
   - `RUANG_CERIA_GAS_URL` = URL Web App `/exec`
   - `RUANG_CERIA_GAS_TOKEN` = token yang sama dengan Script Property `SERVER_API_TOKEN`
   - `COOKIE_SECURE=true`
4. Aktifkan HTTPS pada domain. Jangan publikasikan website melalui HTTP biasa.
5. Mode production sengaja menolak startup jika kredensial atau konfigurasi Apps Script pusat belum diisi.

Jangan unggah file `.env` berisi rahasia ke GitHub. Masukkan nilai rahasia melalui menu Environment Variables hosting.

## C. Jalankan lokal untuk uji tampilan
1. Instal Node.js 18 atau lebih baru.
2. Buka terminal pada folder utama proyek.
3. Untuk uji portal tanpa Google Sheets, jalankan `node server.js` dalam mode development.
4. Buka `http://localhost:3000`. Akun demo lokal: `guru` / `ceria2026`.
5. Untuk menguji integrasi Google Sheets dari lokal, atur `RUANG_CERIA_GAS_URL` dan `RUANG_CERIA_GAS_TOKEN` di environment sebelum menjalankan server. Jangan gunakan akun demo di internet.

Contoh PowerShell untuk konfigurasi lokal:
```powershell
$env:RUANG_CERIA_USER="admin-sekolah"
$env:RUANG_CERIA_PASSWORD="Password-Lokal-Yang-Kuat"
$env:RUANG_CERIA_GAS_URL="https://script.google.com/macros/s/ID_DEPLOYMENT/exec"
$env:RUANG_CERIA_GAS_TOKEN="TOKEN_YANG_SAMA_DENGAN_SCRIPT_PROPERTIES"
node server.js
```

## D. Pengujian setelah deploy
1. Login melalui portal.
2. Isi nama panggilan/inisial dan kelas pada panel Profil Pemain, lalu simpan. Ulangi bila perangkat dipakai siswa lain.
3. Mainkan satu sesi di setiap game dan selesaikan sampai layar hasil.
4. Buka Google Sheets:
   - Periksa baris gabungan di `Log_Permainan`.
   - Periksa tab game masing-masing.
   - Periksa `Rekap_Nilai`.
5. Petualangan Tebak Gambar: isi minimal beberapa baris aktif di `Questions`, lalu coba kategori yang sesuai.
6. Matikan koneksi sebentar, mainkan game yang mendukung antrean lokal, sambungkan kembali, dan pastikan hasil tersinkron.
7. Jika hasil tidak masuk, lihat log aplikasi Node.js dan **Apps Script → Executions**.

## Batasan dan keamanan yang perlu diketahui
- ID pemain anonim dibuat per profil pada browser, bukan akun siswa terverifikasi. Ubah profil saat perangkat dipakai anak berbeda. Siswa yang sama pada perangkat berbeda akan memiliki ID berbeda.
- Nilai dikirim dari browser. Token melindungi endpoint dari akses langsung tanpa melalui server, tetapi tidak membuktikan bahwa skor yang dikirim klien benar. Gunakan sebagai catatan latihan, bukan nilai resmi/penilaian formal.
- Dashboard `Laporan Nilai` tersedia dari portal dan menampilkan ringkasan serta hingga 500 sesi terakhir dengan filter game/pemain. Data bersumber dari tab `Log_Permainan` dan `Rekap_Nilai`. Pengelolaan akun siswa/guru belum termasuk.
- `Dunia Ceria — Belajar Baca` menggunakan `Preview.html` versi statis. Progres modul tetap tersimpan lokal; hasil sesi permainan dikirim ke pusat. Fitur guru khusus versi Google Apps Script tidak berjalan pada preview statis.
- Server menyimpan sesi login di memori. Jika hosting restart, pengguna harus login kembali.
- Jangan menyimpan nama lengkap, tanggal lahir, alamat, foto, atau informasi sensitif anak tanpa dasar dan persetujuan yang sesuai.
- Google Apps Script dan Sheets memiliki kuota; penggunaan banyak kelas/sekolah perlu pengujian kapasitas dan pemantauan.

## File penting
- `server.js` — login, sesi, proteksi file, proxy aman ke Apps Script.
- `ruang-ceria-client.js` — ID pemain anonim dan antrean hasil.
- `AppsScript_Central.gs` — backend pusat Google Sheets.
- `.env.example` — daftar environment variables tanpa nilai rahasia.
- `beranda/` — halaman login dan dashboard 7 game.
- `laporan.html`, `laporan.js`, `laporan.css` — dashboard laporan guru lintas game.


## Alternatif GitHub Pages
Untuk hosting statis GitHub Pages, ikuti `README-GITHUB-PAGES-CLOUDFLARE.md`. `server.js` tidak dijalankan oleh GitHub Pages.
