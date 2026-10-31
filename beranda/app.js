/* RUANG CERIA — Portal statis GitHub Pages. Login guru sederhana berbasis konfigurasi lokal. */

const games = [
  { title: "Belajar Tulis Ceria", description: "Ayo berlatih menulis huruf, angka, dan kata dengan cara yang menyenangkan.", emoji: "✍️", tint: "#fff0c9", button: "#e9a82b", shadow: "#c78919", path: "../belajar-tulis-ceria/index.html", keywords: "menulis huruf angka tracing" },
  { title: "Ceria Berhitung", description: "Kenali angka, hitung benda, dan pecahkan tantangan matematika sederhana.", emoji: "🔢", tint: "#e8e2ff", button: "#7b61df", shadow: "#5c43bd", path: "../ceria-berhitung/ceria-berhitung/index.html", keywords: "angka matematika hitung tambah kurang" },
  { title: "Dunia Hewan 3D", description: "Kenali hewan dan temukan hal menarik dari dunia binatang.", emoji: "🐘", tint: "#dff6e9", button: "#36ad87", shadow: "#248363", path: "../dunia-hewan-3d/index.html", keywords: "hewan binatang alam" },
  { title: "Dunia Ceria — Belajar Baca", description: "Mulai dari mengenal huruf hingga membaca kata dan kalimat sederhana.", emoji: "📚", tint: "#ffe2eb", button: "#e86e9a", shadow: "#c34d78", path: "../DuniaCeria_BelajarBaca/Preview.html", keywords: "membaca baca huruf suku kata kata kalimat", note: "Versi pratinjau; hasil dikirim ke pusat saat login" },
  { title: "Dunia Warna Ceria", description: "Jelajahi warna, kenali benda, dan asah kreativitas sambil bermain.", emoji: "🎨", tint: "#ffead8", button: "#f28a50", shadow: "#cf6836", path: "../Dunia_Warna_Ceria_Website/Dunia_Warna_Ceria/index.html", keywords: "warna mewarnai kreativitas" },
  { title: "Petualangan Keluarga Ceria", description: "Kenali anggota keluarga melalui kuis dan permainan interaktif.", emoji: "👨‍👩‍👧‍👦", tint: "#dff2ff", button: "#4e9fda", shadow: "#3279ad", path: "../petualangan-keluarga-ceria/index.html", keywords: "keluarga ayah ibu kakak adik kakek nenek" },
  { title: "Petualangan Tebak Gambar", description: "Amati gambar, pilih jawaban, dan kumpulkan bintang dari setiap tantangan.", emoji: "🧩", tint: "#f0e4ff", button: "#a36be0", shadow: "#7c49b5", path: "../petualangan_tebak_gambar/petualangan_tebak_gambar/index.html", keywords: "tebak gambar kuis teka teki" }
];

const loginView = document.getElementById("loginView");
const appView = document.getElementById("appView");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const gameGrid = document.getElementById("gameGrid");
const searchInput = document.getElementById("gameSearch");
const studentNameInput = document.getElementById("studentName");
const studentClassInput = document.getElementById("studentClass");
const profileStatus = document.getElementById("profileStatus");

function loadStudentProfile() {
  studentNameInput.value = localStorage.getItem("ruangCeriaStudentName") || "";
  studentClassInput.value = localStorage.getItem("ruangCeriaStudentClass") || "";
}
document.getElementById("saveStudentProfile").addEventListener("click", () => {
  const name = studentNameInput.value.trim().slice(0,24);
  const className = studentClassInput.value.trim().slice(0,30);
  if (!name) { profileStatus.textContent = "Masukkan nama panggilan atau inisial siswa."; return; }
  const changed = name !== (localStorage.getItem("ruangCeriaStudentName") || "") ||
    className !== (localStorage.getItem("ruangCeriaStudentClass") || "");
  localStorage.setItem("ruangCeriaStudentName", name);
  localStorage.setItem("ruangCeriaStudentClass", className);
  if (changed) localStorage.removeItem("ruangCeriaPlayerId_v1");
  profileStatus.textContent = "Profil tersimpan. Hasil permainan berikutnya memakai profil ini.";
});

function renderGames(query = "") {
  const q = query.trim().toLocaleLowerCase("id");
  const filtered = games.filter(g => `${g.title} ${g.description} ${g.keywords}`.toLocaleLowerCase("id").includes(q));
  gameGrid.innerHTML = filtered.map((g) => {
    const originalIndex = games.indexOf(g) + 1;
    return `<article class="game-card" style="--tint:${g.tint};--button:${g.button};--shadow:${g.shadow}">
      <div class="card-top"><div class="game-emoji" aria-hidden="true">${g.emoji}</div><span class="game-number">GAME ${String(originalIndex).padStart(2,"0")}</span></div>
      <h3>${escapeHTML(g.title)}</h3><p>${escapeHTML(g.description)}${g.note ? `<br><strong>${escapeHTML(g.note)}</strong>` : ""}</p>
      <a class="play-link" href="${g.path}" target="_blank" rel="noopener">Mulai bermain <span>↗</span></a>
    </article>`;
  }).join("");
  document.getElementById("emptyState").classList.toggle("hidden", filtered.length !== 0);
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function showDashboard(username) {
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  document.getElementById("displayUser").textContent = username;
  loadStudentProfile();
  renderGames();
}
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const config = window.RUANG_CERIA_CONFIG || {};
  const expectedUser = String(config.TEACHER_USERNAME || "guru");
  const expectedPass = String(config.TEACHER_PASSWORD || "ceria123");
  if (username === expectedUser && password === expectedPass) {
    localStorage.setItem("ruangCeriaTeacherSession", username);
    loginError.textContent = "";
    showDashboard(username);
  } else {
    loginError.textContent = "Nama pengguna atau kata sandi belum tepat.";
  }
});
document.getElementById("togglePassword").addEventListener("click", () => {
  const input = document.getElementById("password");
  input.type = input.type === "password" ? "text" : "password";
});
document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("ruangCeriaTeacherSession");
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
  loginForm.reset();
  document.getElementById("username").focus();
});
searchInput.addEventListener("input", event => renderGames(event.target.value));
(function restoreSession() {
  const username = localStorage.getItem("ruangCeriaTeacherSession");
  if (username) showDashboard(username);
})();
