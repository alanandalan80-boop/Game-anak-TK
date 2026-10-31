# RUANG CERIA — GitHub Pages + Google Sheets (versi sederhana)

## Gambaran
Website statis di GitHub Pages. Google Apps Script menjadi API, Google Sheets menjadi database. Tidak memakai Cloudflare Worker, Wrangler, Node.js, atau Git Bash untuk menjalankan website.

## 1. Siapkan Google Sheets
1. Buat satu Google Spreadsheet baru, misalnya `Database Ruang Ceria`.
2. Dari spreadsheet pilih **Ekstensi → Apps Script**.
3. Hapus kode contoh, lalu salin seluruh isi file `AppsScript_Central.gs` ke editor Apps Script.
4. Simpan. Pilih fungsi `setupRuangCeria` lalu klik **Jalankan** dan izinkan akses. Fungsi ini membuat tab database.

## 2. Deploy Google Apps Script sekali saja
1. Klik **Deploy → New deployment**.
2. Pilih jenis **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone** (jika kebijakan akun Google mengizinkan).
5. Klik Deploy, salin URL yang berakhiran `/exec`.
6. Buka `ruang-ceria-config.js`, tempel URL pada `GOOGLE_APPS_SCRIPT_URL`.

## 3. Upload ke GitHub
1. Upload seluruh isi folder proyek ini ke repository GitHub (jangan hanya file HTML).
2. Buka **Settings → Pages**.
3. Pada Build and deployment pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu Save.
4. Tunggu alamat GitHub Pages muncul. Buka alamat tersebut.

## 4. Login portal guru
Login sederhana bawaan: username `guru`, password `ceria123`. Ubah di `ruang-ceria-config.js` sebelum upload jika diperlukan. Ini hanya pengunci tampilan, bukan keamanan kuat; jangan gunakan untuk data rahasia.

## Catatan penting
- Hasil permainan dikirim ke Google Sheets melalui Apps Script.
- API baca laporan/soal menggunakan JSONP; penyimpanan hasil memakai POST sederhana.
- Karena API publik dibuat sederhana, siapa pun yang mengetahui URL Apps Script berpotensi mengirim data atau membaca data yang disediakan endpoint laporan. Jangan simpan data sensitif anak (alamat, nomor identitas, informasi kesehatan, dan sejenisnya).
- Jangan hapus file `ruang-ceria-config.js`, `ruang-ceria-client.js`, atau `AppsScript_Central.gs`.
- Jika URL Apps Script berubah, perbarui `GOOGLE_APPS_SCRIPT_URL`, lalu upload ulang file tersebut ke GitHub.

## Tes URL Apps Script
Buka URL `/exec` di browser. Harus muncul JSON berisi `success:true` dan `Ruang Ceria Central API`.


## Suara Bahasa Indonesia
Semua modul suara menggunakan locale `id-ID` dan akan memilih voice browser berbahasa Indonesia (`id-*`) jika tersedia. Jika suara masih terdengar asing, pasang/aktifkan voice Bahasa Indonesia pada sistem operasi atau browser; pilihan suara TTS disediakan perangkat, bukan oleh file HTML.
