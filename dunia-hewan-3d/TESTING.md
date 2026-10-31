# Checklist Pengujian — Dunia Hewan 3D

## Frontend
- [ ] Beranda tampil dan navigasi bekerja.
- [ ] Filter kategori galeri hewan bekerja.
- [ ] Tombol Dengarkan membacakan nama jika Web Speech API tersedia.
- [ ] Semua tujuh mini game dapat dimulai dan diselesaikan.
- [ ] Jawaban benar/salah memberikan umpan balik.
- [ ] Hasil permainan menambah bintang dan masuk riwayat lokal.
- [ ] Main lagi dan kembali ke menu berfungsi.
- [ ] Progres tetap tersedia setelah refresh pada browser yang sama.
- [ ] Tampilan dapat digunakan pada layar ponsel dan desktop.
- [ ] Mode reduced motion dihormati.

## Dashboard demo
- [ ] Kode DEMO-GURU membuka dashboard demo.
- [ ] Filter nama dan permainan bekerja.
- [ ] Ekspor CSV menghasilkan file yang bisa dibuka di spreadsheet.
- [ ] Dashboard memberi label jelas bahwa data contoh bukan data produksi.

## Apps Script
- [ ] Script Property SPREADSHEET_ID telah diatur.
- [ ] initializeDatabase membuat semua sheet dan header.
- [ ] URL /exec mengembalikan status health.
- [ ] Sesi baru ditulis ke GameSessions.
- [ ] Sesi duplikat tidak ditambahkan dua kali.
- [ ] Input dengan jumlah soal/skor tidak valid ditolak.
- [ ] Autentikasi guru produksi diuji sebelum endpoint sensitif dibuka.

## Produksi dan privasi
- [ ] Data anak diminimalkan dan tidak dibuka ke publik.
- [ ] Hak akses diverifikasi di backend.
- [ ] Tidak ada rahasia di file frontend.
- [ ] Uji koneksi terputus dan respons server gagal.
- [ ] Uji pada perangkat dan browser target sekolah.
