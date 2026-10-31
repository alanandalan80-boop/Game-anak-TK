/**
 * Dunia Ceria — Belajar Baca
 * Google Apps Script backend + Google Sheets database.
 *
 * SETUP:
 * 1. Buat project Apps Script.
 * 2. Tambahkan file Code.gs, Index.html, Styles.html, Scripts.html.
 * 3. Jalankan setupDuniaCeria() sekali dari editor, lalu izinkan akses.
 * 4. Di Project Settings > Script Properties, tambahkan TEACHER_PIN (PIN unik Anda).
 * 5. Deploy sebagai Web app.
 *
 * FUNGSI BANTU (jalankan dari editor bila perlu):
 * - resetMateriContoh(): mengganti isi sheet Materi dengan materi contoh terbaru.
 * - hapusCacheMateri(): memaksa game memuat ulang sheet Materi segera.
 */

const APP_NAME = 'Dunia Ceria — Belajar Baca';
const PROP_SHEET_ID = 'DUNIA_CERIA_SHEET_ID';
const PROP_TEACHER_PIN = 'TEACHER_PIN';
const CACHE_MATERI = 'materi_v2';
const VALID_MODULES = ['huruf', 'suku', 'kata', 'susun', 'kalimat', 'kuis'];
const PIN_MAX_FAILS = 5;
const PIN_LOCK_SECONDS = 15 * 60;

const HEADERS = {
  Materi: ['id', 'kategori', 'materi', 'jawaban', 'gambar', 'pilihan', 'urutan'],
  Progres: ['kodeSiswa', 'bintang', 'modulSelesai', 'terakhirAktif', 'totalSoal', 'jawabanBenar'],
  HasilKuis: ['waktu', 'kodeSiswa', 'kategori', 'jumlahSoal', 'jawabanBenar', 'persentase']
};

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** Jalankan sekali untuk membuat spreadsheet dan menyiapkan sheet. */
function setupDuniaCeria() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty(PROP_SHEET_ID);
  let ss = null;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create('Database Dunia Ceria - Belajar Baca');
    props.setProperty(PROP_SHEET_ID, ss.getId());
  }
  Object.keys(HEADERS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold');
    }
  });
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }
  seedMaterials_(ss);
  hapusCacheMateri();
  return 'Selesai. Database: ' + ss.getUrl() +
    '\nTambahkan Script Property TEACHER_PIN sebelum membagikan dashboard guru.';
}

/** Mengganti seluruh isi sheet Materi dengan materi contoh terbaru. */
function resetMateriContoh() {
  const ss = getDatabase_();
  const sheet = ss.getSheetByName('Materi');
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.Materi.length).clearContent();
  seedMaterials_(ss);
  hapusCacheMateri();
  return 'Materi contoh dipulihkan.';
}

function hapusCacheMateri() {
  try { CacheService.getScriptCache().remove(CACHE_MATERI); } catch (e) { /* abaikan */ }
}

/** Tidak pernah melempar error: game tetap jalan dengan materi bawaan bila database belum siap. */
function getInitialData() {
  let materials = [];
  try { materials = getMaterials_(); } catch (e) { materials = []; }
  return { appName: APP_NAME, materials: materials, serverTime: new Date().toISOString() };
}

function getMaterials_() {
  const cache = CacheService.getScriptCache();
  try {
    const hit = cache.get(CACHE_MATERI);
    if (hit) return JSON.parse(hit);
  } catch (e) { /* lanjut baca sheet */ }

  const sheet = getDatabase_().getSheetByName('Materi');
  if (!sheet || sheet.getLastRow() < 2) return [];
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.Materi.length).getValues();
  const list = rows.filter(r => r[0]).map(r => ({
    id: String(r[0]).slice(0, 60),
    kategori: String(r[1]).slice(0, 30),
    materi: String(r[2]).slice(0, 120),
    jawaban: String(r[3]).slice(0, 120),
    gambar: String(r[4]).slice(0, 12),
    pilihan: String(r[5]).slice(0, 200),
    urutan: Number(r[6]) || 0
  }));
  try { cache.put(CACHE_MATERI, JSON.stringify(list), 300); } catch (e) { /* terlalu besar: lewati */ }
  return list;
}

function saveProgress(payload) {
  validateStudentPayload_(payload);
  const code = String(payload.kodeSiswa);
  if (!throttle_('p:' + code, 60, 600)) return { ok: false, message: 'Terlalu sering, coba sebentar lagi.' };
  const stars = clampInt_(payload.bintang, 0, 100000);
  const modules = Array.isArray(payload.modulSelesai)
    ? payload.modulSelesai.map(String).filter(m => VALID_MODULES.indexOf(m) >= 0)
        .filter((m, i, a) => a.indexOf(m) === i).join(',')
    : '';
  const total = clampInt_(payload.totalSoal, 0, 1000000);
  const correct = clampInt_(payload.jawabanBenar, 0, total);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getDatabase_().getSheetByName('Progres');
    const last = sheet.getLastRow();
    let rowNumber = -1;
    if (last > 1) {
      const codes = sheet.getRange(2, 1, last - 1, 1).getValues();
      for (let i = 0; i < codes.length; i++) {
        if (String(codes[i][0]) === code) { rowNumber = i + 2; break; }
      }
    }
    const row = [code, stars, modules, new Date(), total, correct];
    if (rowNumber > 0) sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
    return { ok: true, message: 'Progres tersimpan.' };
  } finally {
    lock.releaseLock();
  }
}

function saveQuizResult(payload) {
  validateStudentPayload_(payload);
  const code = String(payload.kodeSiswa);
  if (!throttle_('q:' + code, 40, 600)) return { ok: false, message: 'Terlalu sering, coba sebentar lagi.' };
  const category = String(payload.kategori || 'Latihan').replace(/^[=+@\-]+/, '').slice(0, 40);
  const total = clampInt_(payload.jumlahSoal, 1, 100);
  const correct = clampInt_(payload.jawabanBenar, 0, total);
  const percent = Math.round(correct / total * 100);
  getDatabase_().getSheetByName('HasilKuis').appendRow([
    new Date(), code, category, total, correct, percent
  ]);
  return { ok: true, persentase: percent };
}

/** Data dashboard hanya dikirim jika PIN guru cocok. Dilindungi pembatasan percobaan. */
function getDashboard(pin) {
  const expected = PropertiesService.getScriptProperties().getProperty(PROP_TEACHER_PIN);
  if (!expected) throw new Error('PIN guru belum diatur. Tambahkan Script Property TEACHER_PIN.');

  const cache = CacheService.getScriptCache();
  const failKey = 'pinfail';
  const fails = Number(cache.get(failKey) || 0);
  if (fails >= PIN_MAX_FAILS) throw new Error('Terlalu banyak percobaan. Coba lagi dalam 15 menit.');
  if (!safeEqual_(String(pin || ''), expected)) {
    cache.put(failKey, String(fails + 1), PIN_LOCK_SECONDS);
    throw new Error('PIN guru tidak cocok.');
  }
  cache.remove(failKey);

  const ss = getDatabase_();
  const progressSheet = ss.getSheetByName('Progres');
  const quizSheet = ss.getSheetByName('HasilKuis');
  const progress = progressSheet && progressSheet.getLastRow() > 1
    ? progressSheet.getRange(2, 1, progressSheet.getLastRow() - 1, HEADERS.Progres.length).getValues() : [];
  const quizzes = quizSheet && quizSheet.getLastRow() > 1
    ? quizSheet.getRange(2, 1, quizSheet.getLastRow() - 1, HEADERS.HasilKuis.length).getValues() : [];

  const byCategory = {};
  quizzes.forEach(r => {
    const k = String(r[2]);
    if (!byCategory[k]) byCategory[k] = { kategori: k, percobaan: 0, soal: 0, benar: 0 };
    byCategory[k].percobaan += 1;
    byCategory[k].soal += Number(r[3]) || 0;
    byCategory[k].benar += Number(r[4]) || 0;
  });

  const students = progress.map(r => ({
    kodeSiswa: String(r[0]),
    bintang: Number(r[1]) || 0,
    modulSelesai: String(r[2] || '').split(',').filter(Boolean),
    terakhirAktif: r[3] instanceof Date ? r[3].toISOString() : String(r[3] || ''),
    totalSoal: Number(r[4]) || 0,
    jawabanBenar: Number(r[5]) || 0
  })).sort((a, b) => String(b.terakhirAktif).localeCompare(String(a.terakhirAktif))).slice(0, 50);

  return {
    jumlahSiswa: progress.length,
    totalBintang: progress.reduce((s, r) => s + (Number(r[1]) || 0), 0),
    totalSoal: progress.reduce((s, r) => s + (Number(r[4]) || 0), 0),
    jawabanBenar: progress.reduce((s, r) => s + (Number(r[5]) || 0), 0),
    kategori: Object.keys(byCategory).map(k => byCategory[k]),
    siswa: students,
    riwayat: quizzes.slice(-30).reverse().map(r => ({
      waktu: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      kodeSiswa: String(r[1]), kategori: String(r[2]),
      jumlahSoal: Number(r[3]) || 0, jawabanBenar: Number(r[4]) || 0,
      persentase: Number(r[5]) || 0
    }))
  };
}

function getDatabase_() {
  const id = PropertiesService.getScriptProperties().getProperty(PROP_SHEET_ID);
  if (!id) throw new Error('Database belum dibuat. Jalankan setupDuniaCeria() dari editor Apps Script.');
  return SpreadsheetApp.openById(id);
}

function validateStudentPayload_(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Data tidak valid.');
  const code = String(payload.kodeSiswa || '');
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(code)) throw new Error('Kode belajar tidak valid.');
}

function clampInt_(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

/** Pembatas sederhana: maksimal `limit` panggilan per `seconds` untuk satu kunci. */
function throttle_(key, limit, seconds) {
  try {
    const cache = CacheService.getScriptCache();
    const n = Number(cache.get(key) || 0);
    if (n >= limit) return false;
    cache.put(key, String(n + 1), seconds);
  } catch (e) { /* bila cache gagal, jangan blokir anak yang sedang belajar */ }
  return true;
}

/** Perbandingan string tanpa bocor waktu. */
function safeEqual_(a, b) {
  const x = String(a), y = String(b);
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  return diff === 0;
}

function seedMaterials_(ss) {
  const sheet = ss.getSheetByName('Materi');
  if (sheet.getLastRow() > 1) return;
  const rows = [];
  const letters = [
    ['A','a','Ayam','🐔'],['B','b','Bola','⚽'],['C','c','Cicak','🦎'],['D','d','Dadu','🎲'],
    ['E','e','Elang','🦅'],['F','f','Foto','📷'],['G','g','Gajah','🐘'],['H','h','Hati','❤️'],
    ['I','i','Ikan','🐟'],['J','j','Jeruk','🍊'],['K','k','Kuda','🐴'],['L','l','Lilin','🕯️'],
    ['M','m','Mobil','🚗'],['N','n','Nanas','🍍'],['O','o','Obat','🧴'],['P','p','Pisang','🍌'],
    ['Q','q','Quran','📘'],['R','r','Roti','🍞'],['S','s','Sapi','🐮'],['T','t','Topi','🧢'],
    ['U','u','Ular','🐍'],['V','v','Vas','🏺'],['W','w','Wortel','🥕'],['X','x','Xilofon','🎼'],
    ['Y','y','Yoyo','🪀'],['Z','z','Zebra','🦓']
  ];
  letters.forEach((a, i) => rows.push([
    'huruf-' + a[0].toLowerCase(), 'huruf', a[0] + ' / ' + a[1] + ' — ' + a[2],
    a[0], a[3], '', i + 1
  ]));
  const syllables = ['BA','BI','BU','BE','BO','CA','CI','CU','CE','CO','DA','DI','DU','DE','DO',
    'MA','MI','MU','ME','MO','PA','PI','PU','PE','PO','SA','SI','SU','SE','SO'];
  syllables.forEach((s, i) => rows.push(['suku-' + s.toLowerCase(), 'suku kata', s, s, '🔤', '', i + 1]));
  // Format kolom materi untuk kategori "kata": SUKU-SUKU = KATA (suku kata dipakai game "Susun Kata").
  const words = [
    ['BOLA','⚽','BO-LA'],['BUKU','📚','BU-KU'],['BAJU','👕','BA-JU'],['SAPI','🐮','SA-PI'],
    ['KUDA','🐴','KU-DA'],['MAMA','👩','MA-MA'],['PAPA','👨','PA-PA'],['ROTI','🍞','RO-TI'],
    ['TOPI','🧢','TO-PI'],['MEJA','🪑','ME-JA'],['SUSU','🥛','SU-SU'],['IKAN','🐟','I-KAN'],
    ['BEBEK','🦆','BE-BEK'],['BUNGA','🌸','BU-NGA'],['APEL','🍎','A-PEL'],['BULAN','🌙','BU-LAN'],
    ['LAMPU','💡','LAM-PU'],['PAYUNG','☂️','PA-YUNG'],['SEPEDA','🚲','SE-PE-DA'],
    ['SEPATU','👟','SE-PA-TU'],['KELINCI','🐰','KE-LIN-CI']
  ];
  words.forEach((w, i) => rows.push(['kata-' + w[0].toLowerCase(), 'kata', w[2] + ' = ' + w[0], w[0], w[1], '', i + 1]));
  const sentences = [
    ['INI BOLA.','⚽'],['INI BUKU.','📚'],['IBU MEMBACA.','📖'],['BUDI MAKAN ROTI.','🍞'],
    ['SITI MINUM SUSU.','🥛'],['AYAH MEMAKAI TOPI.','🧢'],['IKAN BERENANG.','🐟'],
    ['KUDA BERLARI.','🐴'],['BUNGA ITU CANTIK.','🌸'],['HUJAN TURUN.','🌧️'],['SAYA SUKA APEL.','🍎']
  ];
  sentences.forEach((s, i) => rows.push(['kalimat-' + i, 'kalimat', s[0], s[0], s[1], '', i + 1]));
  sheet.getRange(2, 1, rows.length, HEADERS.Materi.length).setValues(rows);
}
