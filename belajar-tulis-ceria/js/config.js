// Konfigurasi aplikasi. Backend online opsional; versi ini tetap berfungsi secara lokal.
window.APP_CONFIG = {
  appName: "Belajar Tulis Ceria",
  googleAppsScriptUrl: "", // Backend terpusat diakses melalui server portal.
  useOnlineStorage: false
};
window.LESSON_DATA = {
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((value, i) => ({
    value, label: "Huruf " + value,
    word: ["Apel","Bola","Cicak","Dadu","Elang","Foto","Gajah","Harimau","Ikan","Jeruk","Kuda","Lampu","Mangga","Nanas","Obat","Pisang","Qari","Roti","Sapi","Topi","Ular","Vas","Wortel","Xilofon","Yoyo","Zebra"][i] || value
  })),
  numbers: Array.from({length: 21}, (_, i) => ({value: String(i), label: "Angka " + i, word: angkaKata(i)})),
  words: ["IBU","AYAH","BOLA","BUKU","SUSU","MATA","SAPI","IKAN","KUE","TOPI"].map(value => ({value, label: "Kata " + value, word: value}))
};
function angkaKata(n) {
  const names = ["Nol","Satu","Dua","Tiga","Empat","Lima","Enam","Tujuh","Delapan","Sembilan","Sepuluh","Sebelas","Dua belas","Tiga belas","Empat belas","Lima belas","Enam belas","Tujuh belas","Delapan belas","Sembilan belas","Dua puluh"];
  return names[n] || String(n);
}
