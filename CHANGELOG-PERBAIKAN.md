# Catatan Perbaikan — Ruang Ceria 1.1.0

## Perbaikan yang disertakan
- Satu jalur sinkronisasi untuk hasil dari ketujuh game melalui server Node.js.
- Server memvalidasi sesi portal sebelum meneruskan hasil ke Google Apps Script pusat.
- Token server-to-server disimpan pada Environment Variables dan Script Properties, bukan di browser.
- Apps Script pusat menyiapkan tab per game, `Log_Permainan`, `Rekap_Nilai`, `Questions`, dan `Categories`.
- Antrean hasil lokal pada jembatan browser untuk mengirim ulang saat koneksi pulih.
- Profil pemain memakai nama panggilan/inisial dan kelas opsional; perubahan profil membuat ID pemain anonim baru.
- Halaman `laporan.html` menampilkan rekap lintas game dan hingga 500 sesi terbaru.
- Cookie sesi `HttpOnly`, `SameSite=Lax`, dan `Secure` saat production; proteksi same-origin pada login, logout, dan penyimpanan hasil.
- Mode production menolak startup jika username, password kuat, URL Apps Script, atau token pusat belum dikonfigurasi.

## Pemeriksaan yang dilakukan
- 25 file JavaScript dan 8 file Google Apps Script lulus pemeriksaan sintaks.
- Tujuh halaman game berhasil dimuat dan menerima injeksi jembatan API pada pengujian lokal.
- Alur login, proxy penyimpanan, pembacaan bank soal, rekap, dan laporan diuji dengan layanan Google Apps Script tiruan (mock).
- Tidak ada URL deployment Google Apps Script yang tertanam pada JavaScript/HTML browser.

## Yang masih harus dilakukan pemilik akun
- Membuat Google Spreadsheet pusat.
- Memasang `AppsScript_Central.gs`, mengatur `SPREADSHEET_ID` dan `SERVER_API_TOKEN`, menjalankan setup, lalu deploy Web App.
- Mengatur Environment Variables pada hosting Node.js dan mengaktifkan HTTPS.
- Menguji satu hasil nyata dari masing-masing game setelah deployment.

## Batasan
- Ini belum terhubung ke Google account atau spreadsheet pemilik secara otomatis.
- ID pemain anonim per profil browser, bukan akun siswa terverifikasi.
- Skor dikirim oleh browser dan belum dihitung ulang dari jawaban per soal di server; gunakan sebagai catatan latihan, bukan nilai resmi.
- `Dunia Ceria — Belajar Baca` menggunakan `Preview.html` statis; progres modul lokal tetap lokal, tetapi hasil sesi dikirim ke pusat.


## Versi GitHub Pages + Cloudflare Worker
- Ditambahkan Worker API dengan login token HMAC, CORS allowlist, dan proxy Google Apps Script.
- Ditambahkan bridge browser lintas origin berbasis Bearer token.
- Semua halaman HTML memuat konfigurasi dan bridge pusat.
- Ditambahkan panduan deployment GitHub Pages, Worker secrets, dan Google Sheets.
