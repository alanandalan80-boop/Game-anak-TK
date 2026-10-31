/**
 * Backend opsional untuk Petualangan Keluarga Ceria.
 * 1) Buat Google Sheet, salin ID-nya ke SPREADSHEET_ID.
 * 2) Deploy > New deployment > Web app.
 * 3) Batasi akses sesuai kebutuhan. Jangan simpan data identitas anak.
 */
const SPREADSHEET_ID = "GANTI_DENGAN_ID_GOOGLE_SHEETS";
const RESULTS_SHEET = "HASIL_PERMAINAN";

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  if (action === "health") return json_({ ok: true, service: "Keluarga Ceria" });
  return json_({ ok: true, message: "Keluarga Ceria API aktif. Data pribadi tidak diperlukan." });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error("Data tidak ditemukan.");
    const data = JSON.parse(e.postData.contents);
    validateRequest_(data);
    const sheet = getSheet_();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([
        new Date(),
        String(data.sessionId || Utilities.getUuid()).slice(0, 80),
        String(data.game).slice(0, 80),
        Number(data.questionCount),
        Number(data.correct),
        Number(data.points),
        Number(data.durationSeconds)
      ]);
    } finally { lock.releaseLock(); }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || "Terjadi kesalahan.") });
  }
}

function validateRequest_(data) {
  if (!data || typeof data !== "object") throw new Error("Format data tidak valid.");
  if (typeof data.game !== "string" || data.game.length < 1 || data.game.length > 80) throw new Error("Nama permainan tidak valid.");
  ["questionCount", "correct", "points", "durationSeconds"].forEach(function(key) {
    if (!Number.isFinite(Number(data[key])) || Number(data[key]) < 0) throw new Error("Angka tidak valid: " + key);
  });
  if (Number(data.questionCount) > 100 || Number(data.correct) > Number(data.questionCount) ||
      Number(data.points) > 10000 || Number(data.durationSeconds) > 86400) throw new Error("Nilai di luar batas.");
}

function getSheet_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf("GANTI_") === 0) throw new Error("SPREADSHEET_ID belum diatur.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(RESULTS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(RESULTS_SHEET);
    sheet.appendRow(["Waktu", "ID_Sesi_Acak", "Nama_Permainan", "Jumlah_Pertanyaan", "Jumlah_Jawaban_Benar", "Total_Poin", "Durasi_Detik"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
