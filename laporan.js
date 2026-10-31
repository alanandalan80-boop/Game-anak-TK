(() => {
  const $ = id => document.getElementById(id);
  let logs = [];
  let recap = [];
  const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function formatDate(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("id-ID");
  }
  function render() {
    const game = $("gameFilter").value;
    const query = $("playerFilter").value.trim().toLocaleLowerCase("id");
    const rows = logs.filter(r => (!game || r.game_id === game) &&
      (!query || String(r.nama_siswa || "").toLocaleLowerCase("id").includes(query) ||
       String(r.user_id || "").toLocaleLowerCase("id").includes(query)));
    $("reportRows").innerHTML = rows.length ? rows.map(r => `<tr>
      <td>${esc(formatDate(r.timestamp))}</td>
      <td>${esc(r.nama_siswa || "Pemain")}<small class="report-id">${esc(r.user_id || "")}</small></td>
      <td>${esc(r.kelas || "—")}</td>
      <td>${esc(r.game_name || r.game_id || "—")}<small class="report-id">${esc(r.aktivitas || "")}</small></td>
      <td>${Number(r.benar || 0)}/${Number(r.total_soal || 0)}</td>
      <td>${Number(r.skor || 0)}</td>
      <td>${Number(r.bintang || 0)} ⭐</td>
    </tr>`).join("") : '<tr><td colspan="7">Belum ada hasil yang cocok.</td></tr>';
  }
  async function load() {
    const authResponse = await fetch("/api/me", {cache:"no-store"});
    const authData = await authResponse.json();
    if (!authData.authenticated) { window.location.href = "./beranda/index.html"; return; }
    $("reportStatus").textContent = "Mengambil data dari Google Sheets...";
    $("reportStatus").classList.remove("error");
    try {
      const [logResponse, recapResponse] = await Promise.all([
        fetch("/api/game-log?limit=500", {credentials:"same-origin",cache:"no-store"}),
        fetch("/api/game-recap", {credentials:"same-origin",cache:"no-store"})
      ]);
      const [logData, recapData] = await Promise.all([logResponse.json(),recapResponse.json()]);
      if (logResponse.status === 401 || recapResponse.status === 401) {
        window.location.href = "./beranda/index.html";
        return;
      }
      if (!logResponse.ok || !recapResponse.ok || !logData.success || !recapData.success) {
        throw new Error(logData.error || recapData.error || "Gagal membaca laporan.");
      }
      logs = Array.isArray(logData.records) ? logData.records : [];
      recap = Array.isArray(recapData.records) ? recapData.records : [];
      const sessions = recap.reduce((n,r)=>n+Number(r.jumlah_sesi||0),0);
      const correct = recap.reduce((n,r)=>n+Number(r.total_benar||0),0);
      const stars = recap.reduce((n,r)=>n+Number(r.total_bintang||0),0);
      $("metricSessions").textContent = sessions.toLocaleString("id-ID");
      $("metricPlayers").textContent = recap.length.toLocaleString("id-ID");
      $("metricCorrect").textContent = correct.toLocaleString("id-ID");
      $("metricStars").textContent = stars.toLocaleString("id-ID");
      const games = [...new Map(logs.map(r=>[r.game_id,r.game_name || r.game_id])).entries()];
      const selected = $("gameFilter").value;
      $("gameFilter").innerHTML = '<option value="">Semua game</option>' + games.map(([id,name])=>`<option value="${esc(id)}">${esc(name)}</option>`).join("");
      $("gameFilter").value = selected;
      $("reportStatus").textContent = `Rekap keseluruhan: ${sessions} sesi. Menampilkan ${logs.length} sesi terbaru pada tabel.`;
      render();
    } catch (error) {
      $("reportStatus").textContent = error.message || "Laporan belum dapat dimuat.";
      $("reportStatus").classList.add("error");
      $("reportRows").innerHTML = '<tr><td colspan="7">Periksa koneksi, konfigurasi server, dan deployment Apps Script.</td></tr>';
    }
  }
  $("refreshReport").addEventListener("click",load);
  $("gameFilter").addEventListener("change",render);
  $("playerFilter").addEventListener("input",render);
  $("reportLogout").addEventListener("click",async()=>{try{await fetch("/api/logout",{method:"POST",credentials:"same-origin"});}finally{window.location.href="./beranda/index.html";}});
  load();
})();
