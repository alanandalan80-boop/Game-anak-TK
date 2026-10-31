/**
 * Backend opsional untuk Belajar Tulis Ceria.
 * Buat spreadsheet sendiri, lalu masukkan ID ke Script Properties:
 * SPREADSHEET_ID = ID spreadsheet.
 *
 * Catatan: jangan menyebarkan URL endpoint sebagai pengganti autentikasi.
 * Untuk aplikasi publik bagi anak, pertimbangkan menyimpan progres secara lokal
 * atau menambahkan mekanisme autentikasi dan pembatasan akses.
 */
function doGet(e) {
  return json_({ ok: true, app: 'Belajar Tulis Ceria', message: 'Backend aktif. Gunakan HTML Service/google.script.run atau endpoint yang telah diuji.' });
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action !== 'saveProgress') return json_({ ok: false, error: 'Aksi tidak dikenal.' });
    var profileId = safeText_(body.profile_id, 80);
    var activityType = safeText_(body.activity_type, 30);
    var itemCode = safeText_(body.item_code, 30);
    var score = Number(body.score || 0);
    var stars = Number(body.stars || 0);
    var attempts = Number(body.attempts || 1);
    if (!profileId || !activityType || !itemCode) return json_({ ok: false, error: 'Data wajib belum lengkap.' });
    if (![score, stars, attempts].every(function(n){ return Number.isFinite(n); })) return json_({ ok: false, error: 'Nilai angka tidak valid.' });
    score = Math.max(0, Math.min(100, score));
    stars = Math.max(0, Math.min(3, Math.floor(stars)));
    attempts = Math.max(1, Math.min(1000, Math.floor(attempts)));
    var ss = getSpreadsheet_();
    var sheet = getOrCreateSheet_(ss, 'Progress', ['record_id','profile_id','activity_type','item_code','completion_status','score','stars','attempts','created_at']);
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([Utilities.getUuid(), profileId, activityType, itemCode, 'completed', score, stars, attempts, new Date()]);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'Terjadi kesalahan saat menyimpan data.' });
  }
}

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum diatur.');
  return SpreadsheetApp.openById(id);
}
function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}
function safeText_(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max).replace(/[<>]/g, '');
}
function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

/** Jalankan sekali secara manual untuk membuat struktur awal spreadsheet. */
function setupSheets() {
  var ss = getSpreadsheet_();
  getOrCreateSheet_(ss, 'Profiles', ['profile_id','nickname','created_at','updated_at']);
  getOrCreateSheet_(ss, 'Progress', ['record_id','profile_id','activity_type','item_code','completion_status','score','stars','attempts','created_at']);
  getOrCreateSheet_(ss, 'Settings', ['setting_key','setting_value','updated_at']);
}
