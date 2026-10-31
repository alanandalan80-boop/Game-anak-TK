/**
 * Dunia Hewan 3D — Google Apps Script starter backend.
 * PENTING: Ini adalah starter backend, bukan sistem autentikasi produksi lengkap.
 * Konfigurasikan spreadsheet ID di Project Settings > Script Properties:
 * SPREADSHEET_ID = ID spreadsheet Anda.
 *
 * Untuk produksi, lindungi Web App dengan autentikasi yang diverifikasi server.
 * Jangan memakai token statis dari frontend sebagai autentikasi produksi.
 */
const SHEETS = {
  Students: ["student_id","nickname","class_id","player_code_hash","active","created_at","updated_at"],
  Classes: ["class_id","class_name","teacher_id","active","created_at","updated_at"],
  Animals: ["animal_id","name","category","habitat","food","description","image_url","model_url","sound_url","active","updated_at"],
  Questions: ["question_id","game_type","animal_id","prompt","options_json","correct_answer","difficulty","active","updated_at"],
  GameSessions: ["session_id","student_id","game_type","level","started_at","completed_at","total_questions","correct_answers","wrong_answers","score","duration_seconds","status"],
  GameEvents: ["event_id","session_id","question_id","answer_status","event_time"],
  Teachers: ["teacher_id","email","display_name","active","created_at"],
  Settings: ["setting_key","setting_value","updated_at"]
};

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "health";
    if (action === "health") return json_({success:true,data:{service:"Dunia Hewan 3D API",status:"ready"}});
    if (action === "getAnimals") return json_({success:true,data:readRows_("Animals").filter(r => String(r.active).toLowerCase() !== "false")});
    return json_({success:false,error:"Aksi GET tidak dikenal."});
  } catch (err) {
    return json_({success:false,error:"Permintaan gagal diproses."});
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = String(body.action || "");
    if (action === "saveGameSession") return json_(saveGameSession_(body.session || {}));
    if (action === "teacherLogin") {
      // Tidak mengaktifkan login produksi dengan token statis.
      // Tambahkan validasi identitas Google / provider autentikasi yang benar.
      return json_({success:false,error:"Autentikasi guru produksi belum dikonfigurasi. Jangan gunakan kode demo untuk data nyata."});
    }
    if (action === "getTeacherDashboard" || action === "getTeacherReport") {
      return json_({success:false,error:"Endpoint laporan harus dilindungi autentikasi guru yang diverifikasi server sebelum digunakan di produksi."});
    }
    return json_({success:false,error:"Aksi POST tidak dikenal."});
  } catch (err) {
    return json_({success:false,error:"Data tidak valid atau server gagal memproses permintaan."});
  }
}

function initializeDatabase() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Tambahkan SPREADSHEET_ID di Script Properties terlebih dahulu.");
  const ss = SpreadsheetApp.openById(id);
  Object.keys(SHEETS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) sheet.getRange(1,1,1,SHEETS[name].length).setValues([SHEETS[name]]);
    sheet.setFrozenRows(1);
  });
  return "Database siap.";
}

function saveGameSession_(session) {
  const required = ["sessionId","gameId","date","correct","total"];
  if (!session || required.some(k => session[k] === undefined)) return {success:false,error:"Data sesi belum lengkap."};
  const total = Number(session.total), correct = Number(session.correct);
  if (!Number.isInteger(total) || total < 1 || total > 100 || !Number.isInteger(correct) || correct < 0 || correct > total) {
    return {success:false,error:"Skor sesi tidak valid."};
  }
  // Catatan: skor frontend tidak dapat dipercaya sebagai sumber nilai resmi.
  // Untuk penggunaan sekolah, simpan event jawaban dan hitung ulang skor di server.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const existing = readRows_("GameSessions").some(r => String(r.session_id) === String(session.sessionId));
    if (existing) return {success:true,data:{duplicate:true,message:"Sesi sudah pernah diterima."}};
    appendRow_("GameSessions", [
      String(session.sessionId), "", "", "", String(session.date), new Date().toISOString(),
      total, correct, total-correct, correct, "", "Selesai"
    ]);
    return {success:true,data:{saved:true}};
  } finally {
    lock.releaseLock();
  }
}

function readRows_(sheetName) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(row => row.some(v => v !== "")).map(row => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = row[i] instanceof Date ? row[i].toISOString() : row[i]);
    return obj;
  });
}
function appendRow_(sheetName, values) { getSheet_(sheetName).appendRow(values); }
function getSheet_(name) {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("SPREADSHEET_ID belum diatur.");
  const sheet = SpreadsheetApp.openById(id).getSheetByName(name);
  if (!sheet) throw new Error("Sheet tidak ditemukan: " + name);
  return sheet;
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
