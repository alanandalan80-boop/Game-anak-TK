/**
 * Backend Google Apps Script untuk Petualangan Tebak Gambar.
 * Setup: buat Google Spreadsheet -> Extensions > Apps Script -> tempel file ini.
 * Isi Script Property SPREADSHEET_ID dengan ID spreadsheet.
 *
 * Keamanan:
 * - Jangan membuka fungsi tulis/admin tanpa autentikasi.
 * - Untuk produksi, lindungi aksi admin memakai akun Google/identitas pengguna
 *   atau token server-side yang dikelola dengan benar.
 * - Endpoint publik ini hanya mengizinkan membaca kategori/soal aktif dan
 *   menyimpan hasil anonim dengan validasi dasar.
 */

const SHEETS = {
  Questions: ["question_id","category_id","question_text","image_url","correct_answer","option_1","option_2","option_3","option_4","hint_text","audio_url","difficulty","is_active","created_at","updated_at"],
  Categories: ["category_id","category_name","category_description","category_icon","cover_image_url","sort_order","is_active"],
  GameResults: ["result_id","participant_code","category_id","total_questions","correct_answers","total_stars","accuracy_percentage","duration_seconds","played_at"],
  Achievements: ["achievement_id","achievement_name","description","icon","minimum_stars","is_active"],
  Settings: ["setting_key","setting_value","description"]
};

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "health";
  try {
    initializeDatabase();
    if (action === "health") return json_({success:true,message:"Petualangan Tebak Gambar API aktif."});
    if (action === "getCategories") return json_({success:true,data:getCategories_()});
    if (action === "getQuestions") {
      const categoryId = String(e.parameter.categoryId || "");
      const data = getQuestions_(categoryId);
      return json_({success:true,data:data});
    }
    // Endpoint admin sengaja tidak diekspos sebagai endpoint publik tanpa autentikasi.
    return json_({success:false,message:"Aksi tidak dikenal."});
  } catch (err) {
    return json_({success:false,message:"Terjadi kesalahan pada server."});
  }
}

function doPost(e) {
  try {
    initializeDatabase();
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (body.action === "saveGameResult") {
      const result = sanitizeResult_(body.payload || {});
      saveGameResult_(result);
      return json_({success:true,message:"Hasil tersimpan.",data:{result_id:result.result_id}});
    }
    // CRUD admin harus ditambahkan dengan autentikasi yang diverifikasi server-side.
    return json_({success:false,message:"Aksi tidak dikenal atau tidak diizinkan."});
  } catch (err) {
    return json_({success:false,message:"Permintaan tidak valid atau server mengalami kesalahan."});
  }
}

function initializeDatabase() {
  const ss = getSpreadsheet_();
  Object.keys(SHEETS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1,1,1,SHEETS[name].length).setValues([SHEETS[name]]);
      sheet.setFrozenRows(1);
    }
  });
  seedCategories_(ss);
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Script Property SPREADSHEET_ID belum diatur.");
  return SpreadsheetApp.openById(id);
}

function seedCategories_(ss) {
  const sheet = ss.getSheetByName("Categories");
  if (sheet.getLastRow() > 1) return;
  const rows = [
    ["hewan","Hewan","Kenali teman berbulu","🐾","","1",true],
    ["buah","Buah-buahan","Buah segar dan lezat","🍎","","2",true],
    ["sayur","Sayur-sayuran","Sayur sehat setiap hari","🥕","","3",true],
    ["kendaraan","Kendaraan","Ayo jalan-jalan","🚗","","4",true],
    ["warna","Warna","Warna-warni ceria","🎨","","5",true],
    ["tubuh","Anggota Tubuh","Kenali tubuh kita","👀","","6",true],
    ["rumah","Benda di Rumah","Benda di sekitar kita","🏠","","7",true],
    ["alam","Alam & Lingkungan","Indahnya alam","🌳","","8",true],
    ["sekolah","Alat Sekolah","Teman belajar","🎒","","9",true],
    ["campuran","Campuran","Semua jadi satu","🎁","","10",true]
  ];
  sheet.getRange(2,1,rows.length,rows[0].length).setValues(rows);
}

function getCategories_() {
  const rows = readRows_("Categories");
  return rows.filter(r => isActive_(r.is_active)).sort((a,b)=>Number(a.sort_order)-Number(b.sort_order));
}

function getQuestions_(categoryId) {
  const rows = readRows_("Questions").filter(r => isActive_(r.is_active));
  return rows.filter(r => !categoryId || categoryId === "campuran" || String(r.category_id) === categoryId)
    .map(r => ({
      question_id:String(r.question_id),
      category_id:String(r.category_id),
      question_text:String(r.question_text || ""),
      image_url:String(r.image_url || ""),
      image_emoji:"❔",
      correct_answer:String(r.correct_answer || ""),
      options:[r.option_1,r.option_2,r.option_3,r.option_4].filter(v=>String(v||"").trim()!=="").map(String),
      hint_text:String(r.hint_text || ""),
      audio_url:String(r.audio_url || ""),
      difficulty:String(r.difficulty || "mudah")
    })).filter(q => q.question_text && q.correct_answer && q.options.length >= 2);
}

function saveGameResult_(r) {
  const sheet = getSpreadsheet_().getSheetByName("GameResults");
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const existing = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues().flat() : [];
    if (existing.includes(r.result_id)) return; // idempotency dasar
    sheet.appendRow([
      r.result_id,r.participant_code,r.category_id,r.total_questions,r.correct_answers,
      r.total_stars,r.accuracy_percentage,r.duration_seconds,new Date(r.played_at)
    ]);
  } finally { lock.releaseLock(); }
}

function sanitizeResult_(p) {
  const total = boundedInt_(p.total_questions,1,100);
  const correct = boundedInt_(p.correct_answers,0,total);
  const stars = boundedInt_(p.total_stars,0,100);
  const duration = boundedInt_(p.duration_seconds,0,86400);
  const accuracy = Math.round(correct / total * 100);
  return {
    result_id:String(p.result_id || Utilities.getUuid()).slice(0,100),
    participant_code:"ANONIM",
    category_id:String(p.category_id || "campuran").slice(0,80),
    total_questions:total,correct_answers:correct,total_stars:stars,
    accuracy_percentage:accuracy,duration_seconds:duration,
    played_at:new Date()
  };
}
function boundedInt_(v,min,max) {
  const n=Number(v);
  if (!Number.isFinite(n)) throw new Error("Angka tidak valid");
  return Math.max(min,Math.min(max,Math.floor(n)));
}
function isActive_(v) {
  return v === true || String(v).toLowerCase() === "true" || String(v) === "1" || String(v).toLowerCase() === "ya";
}
function readRows_(sheetName) {
  const sheet=getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow()<2) return [];
  const values=sheet.getDataRange().getValues();
  const headers=values.shift().map(String);
  return values.filter(row=>row.some(v=>v!=="")).map(row=>{
    const obj={};headers.forEach((h,i)=>obj[h]=row[i]);return obj;
  });
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Jalankan sekali dari editor Apps Script untuk menyiapkan sheet dan kategori.
 * Pastikan Script Property SPREADSHEET_ID sudah diset.
 */
function setupDatabase() {
  initializeDatabase();
}

/**
 * Contoh memasukkan satu soal. Jalankan manual setelah setupDatabase().
 * Tambahkan soal lain melalui Google Sheets dengan kolom yang sama.
 */
function addSampleQuestion() {
  const sheet=getSpreadsheet_().getSheetByName("Questions");
  if (sheet.getLastRow()>1) return;
  const now=new Date();
  const rows=[
    ["q-hewan-001","hewan","Manakah gambar kucing?","","Kucing","Anjing","Kucing","Ikan","Ayam","Kucing suka mengeong.","","mudah",true,now,now],
    ["q-buah-001","buah","Buah apa yang berwarna kuning dan panjang?","","Pisang","Apel","Anggur","Pisang","Semangka","Monyet sering digambarkan menyukai buah ini.","","mudah",true,now,now],
    ["q-sayur-001","sayur","Sayur apa yang berwarna oranye?","","Wortel","Bayam","Terong","Wortel","Timun","Kelinci di kartun suka sayur ini.","","mudah",true,now,now],
    ["q-kendaraan-001","kendaraan","Kendaraan apa yang terbang di langit?","","Pesawat","Bus","Kapal","Sepeda","Pesawat","Kendaraan ini punya sayap.","","mudah",true,now,now]
  ];
  sheet.getRange(2,1,rows.length,rows[0].length).setValues(rows);
}
