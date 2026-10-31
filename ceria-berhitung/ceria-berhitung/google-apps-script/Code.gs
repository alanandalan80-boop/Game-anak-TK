/**
 * Ceria Berhitung API
 * Setup:
 * 1. Buat Google Spreadsheet baru.
 * 2. Extensions > Apps Script, tempel seluruh file ini.
 * 3. Isi SPREADSHEET_ID di Project Settings > Script Properties.
 * 4. Jalankan setupDatabase() satu kali dan berikan izin.
 * 5. Deploy > New deployment > Web app.
 */
const PROPERTY_KEY = "SPREADSHEET_ID";
const MAX_BODY_LENGTH = 12000;
const ALLOWED_GAMES = ["numbers", "count", "addition", "subtraction", "match", "challenge"];

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "health";
  try {
    if (action === "health") {
      return json_({ success: true, message: "Ceria Berhitung API aktif." });
    }
    if (action === "getPlayerProgress") {
      const playerId = String((e.parameter && e.parameter.playerId) || "");
      if (!validPlayerId_(playerId)) return json_({ success: false, message: "ID pemain tidak valid." });
      return json_(getPlayerProgress(playerId));
    }
    return json_({ success: false, message: "Aksi GET tidak dikenal." });
  } catch (err) {
    console.error(err);
    return json_({ success: false, message: "Terjadi kesalahan pada server." });
  }
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > MAX_BODY_LENGTH) {
      return json_({ success: false, message: "Data kosong atau terlalu besar." });
    }
    const request = JSON.parse(raw);
    if (!request || request.action !== "saveGameResult") {
      return json_({ success: false, message: "Aksi tidak dikenal." });
    }
    return json_(saveGameResult(request.data || {}));
  } catch (err) {
    console.error(err);
    return json_({ success: false, message: "Permintaan tidak valid atau terjadi kesalahan server." });
  }
}

function setupDatabase() {
  const ss = getSpreadsheet_();
  const definitions = {
    "Pemain": ["player_id", "nama_panggilan", "tanggal_pertama_bermain", "terakhir_bermain"],
    "RiwayatPermainan": ["timestamp", "client_session_id", "player_id", "nama_panggilan", "jenis_permainan", "level", "jumlah_soal", "jawaban_benar", "jawaban_salah", "skor", "jumlah_bintang", "durasi_detik"],
    "ProgresBelajar": ["player_id", "nama_panggilan", "level_tertinggi", "total_permainan", "total_soal_dijawab", "total_jawaban_benar", "total_bintang", "terakhir_diperbarui"]
  };
  Object.keys(definitions).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, definitions[name].length).setValues([definitions[name]]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, definitions[name].length).setFontWeight("bold");
    }
  });
  return "Database Ceria Berhitung siap.";
}

function saveGameResult(data) {
  const clean = validateSession_(data);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = getSpreadsheet_();
    const history = ss.getSheetByName("RiwayatPermainan");
    const players = ss.getSheetByName("Pemain");
    const progress = ss.getSheetByName("ProgresBelajar");
    if (!history || !players || !progress) throw new Error("Jalankan setupDatabase() terlebih dahulu.");

    // Idempotensi dasar: mencegah sesi yang sama masuk dua kali saat retry.
    const lastRow = history.getLastRow();
    if (clean.clientSessionId && lastRow > 1) {
      const ids = history.getRange(2, 2, lastRow - 1, 1).getDisplayValues().flat();
      if (ids.indexOf(clean.clientSessionId) !== -1) {
        return { success: true, message: "Hasil ini sudah tersimpan.", duplicate: true };
      }
    }

    const now = new Date();
    history.appendRow([now, clean.clientSessionId, clean.playerId, clean.name, clean.game, clean.level, clean.questions, clean.correct, clean.wrong, clean.score, clean.stars, clean.durationSeconds]);

    const playerRows = players.getDataRange().getDisplayValues();
    let playerRow = -1;
    for (let i = 1; i < playerRows.length; i++) {
      if (playerRows[i][0] === clean.playerId) { playerRow = i + 1; break; }
    }
    if (playerRow < 0) {
      players.appendRow([clean.playerId, clean.name, now, now]);
    } else {
      players.getRange(playerRow, 2).setValue(clean.name);
      players.getRange(playerRow, 4).setValue(now);
    }

    const progressRows = progress.getDataRange().getDisplayValues();
    let progressRow = -1;
    for (let i = 1; i < progressRows.length; i++) {
      if (progressRows[i][0] === clean.playerId) { progressRow = i + 1; break; }
    }
    if (progressRow < 0) {
      progress.appendRow([clean.playerId, clean.name, clean.level, 1, clean.questions, clean.correct, clean.stars, now]);
    } else {
      const row = progress.getRange(progressRow, 1, 1, 8).getValues()[0];
      progress.getRange(progressRow, 2, 1, 7).setValues([[
        clean.name,
        Math.max(Number(row[2]) || 1, clean.level),
        (Number(row[3]) || 0) + 1,
        (Number(row[4]) || 0) + clean.questions,
        (Number(row[5]) || 0) + clean.correct,
        (Number(row[6]) || 0) + clean.stars,
        now
      ]]);
    }
    return { success: true, message: "Hasil permainan berhasil disimpan.", data: { playerId: clean.playerId } };
  } finally {
    lock.releaseLock();
  }
}

function getPlayerProgress(playerId) {
  if (!validPlayerId_(playerId)) return { success: false, message: "ID pemain tidak valid." };
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName("ProgresBelajar");
  if (!sheet) return { success: false, message: "Database belum disiapkan." };
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === playerId) {
      return { success: true, data: {
        playerId: String(rows[i][0]), name: String(rows[i][1]), highestLevel: Number(rows[i][2]) || 1,
        sessions: Number(rows[i][3]) || 0, questions: Number(rows[i][4]) || 0,
        correct: Number(rows[i][5]) || 0, stars: Number(rows[i][6]) || 0,
        updatedAt: rows[i][7] ? new Date(rows[i][7]).toISOString() : null
      }};
    }
  }
  return { success: true, data: null, message: "Belum ada progres online." };
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty(PROPERTY_KEY);
  if (!id) throw new Error("Script Property SPREADSHEET_ID belum diatur.");
  return SpreadsheetApp.openById(id);
}
function validateSession_(d) {
  const playerId = String(d.playerId || "");
  const name = String(d.name || "Teman").trim().slice(0, 24);
  const game = String(d.game || "");
  const clientSessionId = String(d.clientSessionId || "").slice(0, 80);
  const level = numberInRange_(d.level, 1, 6, "level");
  const questions = numberInRange_(d.questions, 1, 20, "jumlah soal");
  const correct = numberInRange_(d.correct, 0, questions, "jawaban benar");
  const wrong = numberInRange_(d.wrong, 0, questions, "jawaban salah");
  const score = numberInRange_(d.score, 0, 200, "skor");
  const stars = numberInRange_(d.stars, 0, 20, "bintang");
  const durationSeconds = numberInRange_(d.durationSeconds, 1, 7200, "durasi");
  if (!validPlayerId_(playerId)) throw new Error("ID pemain tidak valid.");
  if (ALLOWED_GAMES.indexOf(game) === -1) throw new Error("Jenis permainan tidak valid.");
  if (correct + wrong !== questions) throw new Error("Jumlah jawaban tidak cocok.");
  return { playerId, name: name || "Teman", game, clientSessionId, level, questions, correct, wrong, score, stars, durationSeconds };
}
function numberInRange_(value, min, max, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error("Nilai " + label + " tidak valid.");
  return n;
}
function validPlayerId_(id) {
  return typeof id === "string" && /^[a-zA-Z0-9-]{8,80}$/.test(id);
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
