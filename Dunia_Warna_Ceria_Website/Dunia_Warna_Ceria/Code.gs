/**
 * Backend Dunia Warna Ceria.
 * Buat Google Sheet dengan tab HasilBelajar dan Aktivitas.
 * Deploy sebagai Web App. Untuk penggunaan nyata, batasi akses laporan guru
 * dan jangan menyimpan informasi pribadi anak.
 */
const SHEET_ID = "GANTI_DENGAN_ID_GOOGLE_SHEETS";
const RESULT_SHEET = "HasilBelajar";
const ACTIVITY_SHEET = "Aktivitas";

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "health";
  if (action === "health") return json_({ok:true, service:"Dunia Warna Ceria", message:"Backend aktif"});
  // Jangan buka data laporan ke publik tanpa autentikasi guru.
  return json_({ok:false, error:"Aksi tidak tersedia melalui GET."});
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ok:false,error:"Data permintaan kosong."});
    }
    const payload = JSON.parse(e.postData.contents);
    if (payload.action !== "saveResult") return json_({ok:false,error:"Aksi tidak dikenal."});
    const r = payload.record || {};
    const valid = validateRecord_(r);
    if (!valid.ok) return json_({ok:false,error:valid.error});
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = getOrCreateSheet_(ss, RESULT_SHEET, [
      "timestamp","sessionId","namaPermainan","jumlahSoal","jumlahBenar",
      "jumlahSalah","persentase","bintang","durasiDetik"
    ]);
    // Idempotency sederhana untuk menghindari duplikasi pada pengiriman ulang.
    const key = String(r.timestamp) + "|" + String(r.sessionId) + "|" + String(r.namaPermainan);
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty("saved_" + Utilities.base64EncodeWebSafe(key))) {
      return json_({ok:true,duplicate:true});
    }
    sheet.appendRow([
      new Date(r.timestamp), r.sessionId, r.namaPermainan, r.jumlahSoal,
      r.jumlahBenar, r.jumlahSalah, r.persentase, r.bintang,
      r.durasiDetik === null ? "" : r.durasiDetik
    ]);
    props.setProperty("saved_" + Utilities.base64EncodeWebSafe(key), "1");
    return json_({ok:true});
  } catch (err) {
    return json_({ok:false,error:"Gagal menyimpan data: " + String(err.message || err)});
  }
}

function validateRecord_(r) {
  if (!r || typeof r !== "object") return {ok:false,error:"Format data tidak valid."};
  if (typeof r.sessionId !== "string" || r.sessionId.length < 3 || r.sessionId.length > 80) return {ok:false,error:"sessionId tidak valid."};
  const allowed = ["Tebak Warna","Cari Benda","Ayo Mewarnai"];
  if (!allowed.includes(r.namaPermainan)) return {ok:false,error:"Nama permainan tidak dikenal."};
  const nums = ["jumlahSoal","jumlahBenar","jumlahSalah","persentase","bintang"];
  for (const k of nums) {
    if (!Number.isInteger(r[k]) || r[k] < 0 || r[k] > 100) return {ok:false,error:"Nilai " + k + " tidak valid."};
  }
  if (r.jumlahSoal < 1 || r.jumlahBenar > r.jumlahSoal || r.jumlahSalah > r.jumlahSoal ||
      r.jumlahBenar + r.jumlahSalah !== r.jumlahSoal) return {ok:false,error:"Jumlah jawaban tidak konsisten."};
  if (r.persentase !== Math.round(r.jumlahBenar / r.jumlahSoal * 100)) return {ok:false,error:"Persentase tidak konsisten."};
  if (typeof r.timestamp !== "string" || isNaN(Date.parse(r.timestamp))) return {ok:false,error:"Waktu tidak valid."};
  if (r.durasiDetik !== null && r.durasiDetik !== undefined &&
      (!Number.isInteger(r.durasiDetik) || r.durasiDetik < 0 || r.durasiDetik > 86400)) return {ok:false,error:"Durasi tidak valid."};
  return {ok:true};
}

function getOrCreateSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Jalankan sekali dari editor Apps Script untuk membuat tab hasil. */
function setupSheets() {
  if (SHEET_ID === "GANTI_DENGAN_ID_GOOGLE_SHEETS") {
    throw new Error("Isi SHEET_ID terlebih dahulu.");
  }
  const ss = SpreadsheetApp.openById(SHEET_ID);
  getOrCreateSheet_(ss, RESULT_SHEET, [
    "timestamp","sessionId","namaPermainan","jumlahSoal","jumlahBenar",
    "jumlahSalah","persentase","bintang","durasiDetik"
  ]);
  getOrCreateSheet_(ss, ACTIVITY_SHEET, [
    "timestamp","sessionId","aktivitas","warnaDipilih","hasil","skor"
  ]);
}
