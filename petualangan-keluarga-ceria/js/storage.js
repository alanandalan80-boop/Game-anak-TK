(() => {
  const KEY = "keluarga_ceria_v1";
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "{}");
      return { totalPoints: Number(value.totalPoints)||0, totalCorrect: Number(value.totalCorrect)||0,
        sessions: Array.isArray(value.sessions)?value.sessions:[], badges:Array.isArray(value.badges)?value.badges:[] };
    } catch (_) { return {totalPoints:0,totalCorrect:0,sessions:[],badges:[]}; }
  }
  function write(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
  function saveSession(session) {
    const data = read();
    data.totalPoints += Number(session.points)||0;
    data.totalCorrect += Number(session.correct)||0;
    data.sessions.unshift({...session, savedAt:new Date().toISOString()});
    data.sessions = data.sessions.slice(0,100);
    if (session.points >= 30 && !data.badges.includes("Bintang Ceria")) data.badges.push("Bintang Ceria");
    if (session.game === "guess" && session.correct >= 3 && !data.badges.includes("Jago Tebak Gambar")) data.badges.push("Jago Tebak Gambar");
    write(data);
    if (window.RuangCeria) {
      window.RuangCeria.saveResult({
        ...session,
        recordId: session.sessionId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
        gameName: "Petualangan Keluarga Ceria", activity: session.title || "Selesai",
        totalQuestions: session.total, correct: session.correct,
        score: session.points, stars: Math.floor((Number(session.points) || 0) / 10),
        durationSeconds: session.duration, timestamp: new Date().toISOString()
      }, "petualangan-keluarga-ceria").then(result => {
        if (!result.success) console.warn("Hasil Petualangan Keluarga masuk antrean sinkronisasi.");
      });
    }
    return data;
  }
  function clear() { localStorage.removeItem(KEY); }
  function exportCSV() {
    const data = read();
    const rows = [["Tanggal","Permainan","Jumlah Pertanyaan","Jawaban Benar","Poin","Durasi (detik)"]];
    data.sessions.forEach(s=>rows.push([new Date(s.savedAt).toLocaleString("id-ID"),s.title,s.total,s.correct,s.points,s.duration]));
    const csv = rows.map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");
    const blob = new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href=url; a.download="rekap-keluarga-ceria.csv"; a.click(); URL.revokeObjectURL(url);
  }
  window.KCStorage = {read,saveSession,clear,exportCSV};
})();
