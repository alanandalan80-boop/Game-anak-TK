/**
 * RUANG CERIA — Central API untuk 7 game.
 * Jalankan setupRuangCeria() sekali, lalu deploy sebagai Web App.
 * Script Properties: SPREADSHEET_ID (otomatis diisi saat setup dari spreadsheet).
 * API ini dibuat sederhana untuk proyek pendidikan; hasil permainan dapat dikirim publik.
 */
const RC_GAME_SHEETS = {
  "belajar-tulis-ceria": "Game_Tulis",
  "ceria-berhitung": "Game_Berhitung",
  "dunia-hewan-3d": "Game_Hewan",
  "dunia-ceria-belajar-baca": "Game_Baca",
  "dunia-warna-ceria": "Game_Warna",
  "petualangan-keluarga-ceria": "Game_Keluarga",
  "petualangan-tebak-gambar": "Game_Tebak_Gambar"
};
const RC_HEADERS = [
  "record_id","timestamp","user_id","nama_siswa","kelas","game_id","game_name",
  "aktivitas","skor","benar","total_soal","bintang","durasi_detik","detail_json"
];
const RC_LOG_HEADERS = RC_HEADERS.concat(["source"]);
const RC_QUESTION_HEADERS = [
  "question_id","category_id","question_text","image_url","correct_answer",
  "option_1","option_2","option_3","option_4","hint_text","audio_url",
  "difficulty","is_active","created_at","updated_at"
];
const RC_CATEGORY_HEADERS = [
  "category_id","category_name","category_description","category_icon",
  "cover_image_url","sort_order","is_active"
];

function doGet(e) {
  const p = (e && e.parameter) || {};
  const action = String(p.action || "health");
  let result;
  try {
    if (action === "health") result = {success:true, app:"Ruang Ceria Central API", version:3};
    else if (action === "getQuestions") result = {success:true, data:rcGetQuestions_(String(p.categoryId || ""))};
    else if (action === "getPlayerProgress") result = {success:true, playerId:String(p.playerId || ""), records:rcGetProgress_(String(p.playerId || ""))};
    else if (action === "getRecap") result = {success:true, records:rcGetRecap_()};
    else if (action === "getLogs") result = {success:true, records:rcGetRecentLogs_(p.limit)};
    else result = {success:false, error:"Aksi tidak dikenal."};
  } catch (err) { result = {success:false, error:String(err && err.message || "Permintaan tidak valid.")}; }
  const callback = String(p.callback || "");
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return rcJson_(result);
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = String(body.action || "saveGameResult");
    // API publik sederhana: hanya menerima penyimpanan hasil permainan.
    // Jangan menaruh data rahasia atau informasi pribadi sensitif pada payload.
    if (action === "saveGameResult" || action === "saveResult" || action === "saveGameSession" || action === "saveQuizResult" || action === "save") {
      const payload = body.record || body.payload || body.data || body.session || body;
      return rcJson_(rcSaveResult_(payload, body.gameId || body.game_id || body.game || ""));
    }
    return rcJson_({success:false, error:"Aksi tidak dikenal."});
  } catch (err) {
    return rcJson_({success:false, error:String(err && err.message || "Permintaan tidak valid.")});
  }
}

function setupRuangCeria() {
  const props = PropertiesService.getScriptProperties();
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  const configuredId = props.getProperty("SPREADSHEET_ID");
  if (!ss && configuredId) ss = SpreadsheetApp.openById(configuredId);
  if (!ss) throw new Error("Buka Apps Script dari spreadsheet pusat atau atur Script Property SPREADSHEET_ID.");
  props.setProperty("SPREADSHEET_ID", ss.getId());
  const schemas = {
    "Pengguna": ["user_id","username","nama_siswa","kelas","role","status","created_at","updated_at"],
    "Guru": ["guru_id","nama_guru","email","kelas_diampu","status","created_at","updated_at"],
    "Questions": RC_QUESTION_HEADERS,
    "Categories": RC_CATEGORY_HEADERS,
    "Game_Tulis": RC_HEADERS,
    "Game_Berhitung": RC_HEADERS,
    "Game_Hewan": RC_HEADERS,
    "Game_Baca": RC_HEADERS,
    "Game_Warna": RC_HEADERS,
    "Game_Keluarga": RC_HEADERS,
    "Game_Tebak_Gambar": RC_HEADERS,
    "Log_Permainan": RC_LOG_HEADERS,
    "Rekap_Nilai": ["user_id","nama_siswa","kelas","jumlah_sesi","total_skor","total_benar","total_soal","total_bintang","terakhir_bermain"]
  };
  Object.keys(schemas).forEach(name => {
    const sh = rcEnsureSheet_(ss, name, schemas[name]);
    sh.setFrozenRows(1);
    sh.getRange(1,1,1,schemas[name].length).setFontWeight("bold").setBackground("#2878b5").setFontColor("#ffffff");
    sh.autoResizeColumns(1, schemas[name].length);
  });
  rcSeedCategories_(ss);
  return "Setup Ruang Ceria selesai. Spreadsheet: " + ss.getName();
}

function rcRequireServerToken_(received) {
  const expected = PropertiesService.getScriptProperties().getProperty("SERVER_API_TOKEN");
  if (!expected || String(received || "") !== expected) throw new Error("Akses API tidak diizinkan.");
}

function rcSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Script Property SPREADSHEET_ID belum diatur.");
  return SpreadsheetApp.openById(id);
}

function rcSaveResult_(p, explicitGameId) {
  p = p || {};
  const gameId = rcNormalizeGameId_(explicitGameId || p.gameId || p.game_id || p.game || p.gameName || p.namaPermainan || p.title || "");
  const gameName = rcSafeText_(p.gameName || p.game_name || p.namaPermainan || p.title || rcGameName_(gameId), 120);
  const now = new Date();
  const total = rcNum_(p.totalQuestions ?? p.total_questions ?? p.total_soal ?? p.jumlahSoal ?? p.questions ?? p.total ?? p.questionCount, 0, 10000);
  const correct = rcNum_(p.correct ?? p.benar ?? p.jawabanBenar ?? p.correct_answers ?? p.jumlahBenar ?? p.score, 0, 10000);
  const stars = rcNum_(p.stars ?? p.bintang ?? p.totalStars ?? p.total_stars ?? p.roundStars, 0, 10000);
  const score = rcNum_(p.score ?? p.skor ?? p.points ?? p.poin ?? correct, 0, 1000000);
  const playerId = rcSafeText_(p.playerId || p.player_id || p.userId || p.user_id || p.kodeSiswa || p.participant_code || "anon-" + Utilities.getUuid(), 100);
  const timestamp = p.timestamp || p.date || p.played_at || p.savedAt || now.toISOString();
  const duration = rcNum_(p.durationSeconds ?? p.duration_seconds ?? p.durasi_detik ?? p.duration, 0, 86400);
  const recordId = rcSafeText_(p.recordId || p.record_id || p.sessionId || p.session_id || p.localId || p.clientSessionId || p.result_id || Utilities.getUuid(), 120);
  const rowObj = {
    record_id:recordId,
    timestamp:String(timestamp),
    user_id:playerId,
    nama_siswa:rcSafeText_(p.studentName || p.nama_siswa || p.name || p.nama || p.playerName || p.nick || p.nickname || "Pemain", 80),
    kelas:rcSafeText_(p.className || p.kelas || "", 40),
    game_id:gameId,
    game_name:gameName,
    aktivitas:rcSafeText_(p.activity || p.aktivitas || p.status || "Selesai", 80),
    skor:score,
    benar:Math.min(correct, total || correct),
    total_soal:total || 1,
    bintang:stars,
    durasi_detik:duration,
    detail_json:JSON.stringify(p).slice(0,45000)
  };
  const ss = rcSpreadsheet_();
  const log = rcEnsureSheet_(ss, "Log_Permainan", RC_LOG_HEADERS);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const last = log.getLastRow();
    if (last > 1) {
      const ids = log.getRange(2,1,last-1,1).getValues().flat().map(String);
      if (ids.includes(recordId)) return {success:true, duplicate:true, recordId:recordId, message:"Hasil sudah pernah diterima."};
    }
    log.appendRow(RC_LOG_HEADERS.map(h => h === "source" ? "portal-web" : rowObj[h]));
    const targetName = RC_GAME_SHEETS[gameId];
    if (targetName) {
      const target = rcEnsureSheet_(ss, targetName, RC_HEADERS);
      target.appendRow(RC_HEADERS.map(h => rowObj[h]));
    }
    rcRefreshRecap_(ss);
  } finally {
    lock.releaseLock();
  }
  return {success:true, recordId:recordId, gameId:gameId, message:"Hasil tersimpan."};
}

function rcGetQuestions_(categoryId) {
  const rows = rcReadRows_("Questions").filter(r => rcIsActive_(r.is_active));
  return rows.filter(r => !categoryId || categoryId === "campuran" || String(r.category_id) === categoryId)
    .map(r => ({
      question_id:String(r.question_id || ""),
      category_id:String(r.category_id || ""),
      question_text:String(r.question_text || ""),
      image_url:String(r.image_url || ""),
      image_emoji:"❔",
      correct_answer:String(r.correct_answer || ""),
      options:[r.option_1,r.option_2,r.option_3,r.option_4].filter(v => String(v || "").trim() !== "").map(String),
      hint_text:String(r.hint_text || ""),
      audio_url:String(r.audio_url || ""),
      difficulty:String(r.difficulty || "mudah")
    })).filter(q => q.question_text && q.correct_answer && q.options.length >= 2);
}

function rcGetProgress_(playerId) {
  const sh = rcSpreadsheet_().getSheetByName("Log_Permainan");
  if (!sh || sh.getLastRow() < 2) return [];
  return rcRowsAsObjects_(sh).filter(r => String(r.user_id || "") === playerId);
}

function rcGetRecap_() {
  const sh = rcSpreadsheet_().getSheetByName("Rekap_Nilai");
  return rcRowsAsObjects_(sh);
}
function rcGetRecentLogs_(limit) {
  const sh = rcSpreadsheet_().getSheetByName("Log_Permainan");
  const rows = rcRowsAsObjects_(sh);
  const maxRows = Math.max(1, Math.min(1000, Number(limit) || 500));
  return rows.slice(-maxRows).reverse();
}

function rcRefreshRecap_(ss) {
  const log = ss.getSheetByName("Log_Permainan");
  const recap = rcEnsureSheet_(ss, "Rekap_Nilai", ["user_id","nama_siswa","kelas","jumlah_sesi","total_skor","total_benar","total_soal","total_bintang","terakhir_bermain"]);
  const rows = rcRowsAsObjects_(log);
  const groups = {};
  rows.forEach(r => {
    const id = String(r.user_id || "tanpa-id");
    if (!groups[id]) groups[id] = {id, name:String(r.nama_siswa || "Pemain"), kelas:String(r.kelas || ""), sessions:0, score:0, correct:0, total:0, stars:0, last:""};
    const g = groups[id];
    g.sessions++;
    g.score += Number(r.skor || 0);
    g.correct += Number(r.benar || 0);
    g.total += Number(r.total_soal || 0);
    g.stars += Number(r.bintang || 0);
    if (String(r.timestamp || "") > g.last) g.last = String(r.timestamp || "");
  });
  if (recap.getLastRow() > 1) recap.getRange(2,1,recap.getLastRow()-1,recap.getLastColumn()).clearContent();
  Object.keys(groups).forEach(id => {
    const g = groups[id];
    recap.appendRow([g.id,g.name,g.kelas,g.sessions,g.score,g.correct,g.total,g.stars,g.last]);
  });
}

function rcSeedCategories_(ss) {
  const sh = ss.getSheetByName("Categories");
  if (sh.getLastRow() > 1) return;
  const rows = [
    ["hewan","Hewan","Kenali teman berbulu","🐾","",1,true],
    ["buah","Buah-buahan","Buah segar dan lezat","🍎","",2,true],
    ["sayur","Sayur-sayuran","Sayur sehat setiap hari","🥕","",3,true],
    ["kendaraan","Kendaraan","Ayo jalan-jalan","🚗","",4,true],
    ["warna","Warna","Warna-warni ceria","🎨","",5,true],
    ["tubuh","Anggota Tubuh","Kenali tubuh kita","👀","",6,true],
    ["rumah","Benda di Rumah","Benda di sekitar kita","🏠","",7,true],
    ["alam","Alam & Lingkungan","Indahnya alam","🌳","",8,true],
    ["sekolah","Alat Sekolah","Teman belajar","🎒","",9,true],
    ["campuran","Campuran","Semua jadi satu","🎁","",10,true]
  ];
  sh.getRange(2,1,rows.length,rows[0].length).setValues(rows);
}

function rcEnsureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}
function rcReadRows_(name) {
  const sh = rcSpreadsheet_().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);
  return values.filter(row => row.some(v => v !== "")).map(row => {
    const o = {}; headers.forEach((h,i) => o[h] = row[i]); return o;
  });
}
function rcRowsAsObjects_(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const headers = values.shift().map(String);
  return values.filter(row => row.some(v => v !== "")).map(row => {
    const o = {}; headers.forEach((h,i) => o[h] = row[i]); return o;
  });
}
function rcNormalizeGameId_(v) {
  const s = String(v || "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  if (s.includes("tulis")) return "belajar-tulis-ceria";
  if (s.includes("berhitung") || s.includes("hitung")) return "ceria-berhitung";
  if (s.includes("hewan")) return "dunia-hewan-3d";
  if (s.includes("baca") || s.includes("read")) return "dunia-ceria-belajar-baca";
  if (s.includes("warna") || s.includes("color")) return "dunia-warna-ceria";
  if (s.includes("keluarga") || s.includes("family")) return "petualangan-keluarga-ceria";
  if (s.includes("tebak") || s.includes("gambar")) return "petualangan-tebak-gambar";
  return s || "unknown-game";
}
function rcGameName_(id) {
  const names = {
    "belajar-tulis-ceria":"Belajar Tulis Ceria",
    "ceria-berhitung":"Ceria Berhitung",
    "dunia-hewan-3d":"Dunia Hewan 3D",
    "dunia-ceria-belajar-baca":"Dunia Ceria — Belajar Baca",
    "dunia-warna-ceria":"Dunia Warna Ceria",
    "petualangan-keluarga-ceria":"Petualangan Keluarga Ceria",
    "petualangan-tebak-gambar":"Petualangan Tebak Gambar"
  };
  return names[id] || id || "Game Ruang Ceria";
}
function rcNum_(v,min,max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min,Math.min(max,Math.floor(n)));
}
function rcSafeText_(value,max) {
  let s = String(value == null ? "" : value).replace(/[\u0000-\u001F\u007F]/g," ").trim().slice(0,max);
  if (/^[=+@\-]/.test(s)) s = "'" + s;
  return s;
}
function rcIsActive_(v) {
  return v === true || String(v).toLowerCase() === "true" || String(v) === "1" || String(v).toLowerCase() === "ya";
}
function rcJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
