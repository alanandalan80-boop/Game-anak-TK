(() => {
  const $ = id => document.getElementById(id);
  const screens = ["homeScreen","dashboardScreen","playScreen","resultScreen","adultScreen"];
  const names = { numbers:"Kenali Angka", count:"Hitung Benda", addition:"Ayo Menjumlah", subtraction:"Ayo Mengurangi", match:"Pasangkan", challenge:"Tantangan Ceria" };
  let playerName = "", currentGame = "count", questionIndex = 0, totalQuestions = 5, correctCount = 0, sessionStars = 0, currentQuestion = null, answered = false, sessionStart = 0, soundOn = true, lastGame = "count", level = 1;
  function showScreen(id) { screens.forEach(s => $(s).classList.toggle("hidden", s !== id)); window.scrollTo({top:0,behavior:"smooth"}); }
  function toast(message) { const el = $("toast"); el.textContent = message; el.classList.remove("hidden"); clearTimeout(toast.timer); toast.timer = setTimeout(()=>el.classList.add("hidden"),2800); }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function renderDashboard() {
    const state = CeriaStorage.getState(), totals = CeriaStorage.totals();
    $("welcomeName").textContent = playerName || "Teman";
    $("starCount").textContent = totals.stars;
    $("progressText").textContent = `${totals.sessions} sesi selesai`;
    $("progressBar").style.width = Math.min(100, totals.sessions * 10) + "%";
    showScreen("dashboardScreen");
  }
  function beginGame(mode) {
    currentGame = mode; lastGame = mode; questionIndex = 0; correctCount = 0; sessionStars = 0; sessionStart = Date.now();
    totalQuestions = mode === "numbers" ? 5 : mode === "challenge" ? 5 : 5;
    $("gameModeLabel").textContent = names[mode].toUpperCase();
    showScreen("playScreen"); renderQuestion();
  }
  function renderQuestion() {
    answered = false;
    currentQuestion = CeriaGames.makeQuestion(currentGame === "challenge" ? "challenge" : currentGame, level);
    $("questionCounter").textContent = `Soal ${questionIndex + 1} dari ${totalQuestions}`;
    $("sessionStars").textContent = sessionStars;
    $("questionProgressBar").style.width = `${questionIndex / totalQuestions * 100}%`;
    $("questionTitle").textContent = currentQuestion.title;
    $("questionHint").textContent = currentQuestion.hint;
    $("questionVisual").innerHTML = currentQuestion.visual;
    $("feedback").className = "feedback hidden"; $("feedback").textContent = "";
    $("nextQuestion").classList.add("hidden");
    $("answerGrid").innerHTML = "";
    currentQuestion.options.forEach(option => {
      const button = document.createElement("button");
      button.className = "answer-button"; button.type = "button"; button.textContent = option;
      button.setAttribute("aria-label", "Jawaban " + option);
      button.addEventListener("click", () => chooseAnswer(option, button));
      $("answerGrid").appendChild(button);
    });
    if (currentGame === "numbers") CeriaAudio.speak(currentQuestion.say);
  }
  function chooseAnswer(option, button) {
    if (answered) return;
    answered = true;
    const correct = Number(option) === Number(currentQuestion.answer);
    [...$("answerGrid").children].forEach(b => {
      b.disabled = true;
      if (Number(b.textContent) === Number(currentQuestion.answer)) b.classList.add("correct");
    });
    const feedback = $("feedback");
    if (correct) {
      correctCount++; sessionStars++; CeriaAudio.correct();
      feedback.textContent = ["Hebat! Jawabanmu benar! 🌟","Pintar sekali! 🎉","Kamu berhasil! ⭐"][Math.floor(Math.random()*3)];
      feedback.className = "feedback good";
    } else {
      button.classList.add("wrong"); CeriaAudio.tryAgain();
      feedback.textContent = `Hampir benar! Jawabannya ${currentQuestion.answer}. Ayo coba soal berikutnya!`;
      feedback.className = "feedback try";
    }
    $("sessionStars").textContent = sessionStars;
    $("nextQuestion").textContent = questionIndex + 1 >= totalQuestions ? "Lihat hasil 🎉" : "Lanjut →";
    $("nextQuestion").classList.remove("hidden");
  }
  async function finishGame() {
    const elapsed = Math.max(1, Math.round((Date.now()-sessionStart)/1000));
    const result = { game: currentGame, gameName: names[currentGame], level, questions: totalQuestions, correct: correctCount, wrong: totalQuestions-correctCount, score: correctCount*10, stars: sessionStars, durationSeconds: elapsed };
    const saved = CeriaStorage.addSession(result);
    $("resultCorrect").textContent = `${correctCount}/${totalQuestions}`;
    $("resultStars").textContent = `${sessionStars} ⭐`;
    $("resultMessage").textContent = correctCount === totalQuestions ? "Sempurna! Terus jaga semangat belajarmu!" : "Terima kasih sudah berlatih. Setiap percobaan membuatmu makin hebat!";
    $("saveStatus").textContent = "Hasil tersimpan di perangkat ini.";
    showScreen("resultScreen");
    if (CeriaAPI.isConfigured() && navigator.onLine) {
      $("saveStatus").textContent = "Sedang menyinkronkan hasil...";
      const response = await CeriaAPI.saveSession({
        playerId: saved.playerId, name: saved.name, game: saved.game, level: saved.level,
        questions: saved.questions, correct: saved.correct, wrong: saved.wrong, score: saved.score,
        stars: saved.stars, durationSeconds: saved.durationSeconds, clientSessionId: saved.localId
      });
      if (response.success) {
        CeriaStorage.markSynced(saved.localId);
        $("saveStatus").textContent = "Hasil berhasil disimpan ke Google Sheets. ✓";
      } else {
        $("saveStatus").textContent = "Tersimpan di perangkat. Sinkronisasi online belum berhasil.";
      }
    } else {
      $("saveStatus").textContent = "Tersimpan di perangkat ini. Hubungkan API untuk menyimpan ke Google Sheets.";
    }
  }
  function openAdult() {
    const answer = prompt("Area orang tua/guru. Untuk memastikan, berapa 3 + 4?");
    if (answer === null) return;
    if (answer.trim() !== "7") { toast("Coba lagi bersama orang tua atau guru."); return; }
    renderAdult(); showScreen("adultScreen");
  }
  function renderAdult() {
    const totals = CeriaStorage.totals(), state = CeriaStorage.getState();
    $("adultSessions").textContent = totals.sessions; $("adultCorrect").textContent = totals.correct; $("adultStars").textContent = totals.stars;
    const list = $("historyList");
    if (!state.sessions.length) { list.innerHTML = '<p class="muted">Belum ada sesi. Ayo mulai bermain!</p>'; return; }
    list.innerHTML = state.sessions.slice(0,20).map(s => `<div class="history-item"><div><strong>${escapeHTML(s.gameName || names[s.game] || s.game)}</strong><small>${new Date(s.savedAt).toLocaleString("id-ID")} · ${s.synced ? "Tersinkron" : "Di perangkat"}</small></div><div class="history-score">${Number(s.correct||0)}/${Number(s.questions||0)} benar<br><small>${Number(s.stars||0)} ⭐</small></div></div>`).join("");
  }
  async function syncPending() {
    if (!CeriaAPI.isConfigured()) { toast("URL Google Apps Script belum diatur di js/api.js."); return; }
    if (!navigator.onLine) { toast("Perangkat sedang offline."); return; }
    const pending = CeriaStorage.getPending();
    if (!pending.length) { toast("Tidak ada hasil yang menunggu sinkronisasi."); return; }
    let count = 0;
    for (const s of pending) {
      const res = await CeriaAPI.saveSession({ playerId:s.playerId, name:s.name, game:s.game, level:s.level, questions:s.questions, correct:s.correct, wrong:s.wrong, score:s.score, stars:s.stars, durationSeconds:s.durationSeconds, clientSessionId:s.localId });
      if (res.success) { CeriaStorage.markSynced(s.localId); count++; }
    }
    renderAdult();
    toast(`${count} dari ${pending.length} hasil berhasil disinkronkan.`);
  }
  $("startForm").addEventListener("submit", e => {
    e.preventDefault(); playerName = $("playerName").value.trim().slice(0,24); CeriaStorage.setName(playerName); renderDashboard();
  });
  $("brandHome").addEventListener("click", e => { e.preventDefault(); renderDashboard(); });
  $("gameGrid").addEventListener("click", e => { const card = e.target.closest("[data-game]"); if (card) beginGame(card.dataset.game); });
  $("backToGames").addEventListener("click", renderDashboard);
  $("nextQuestion").addEventListener("click", () => { questionIndex++; if (questionIndex >= totalQuestions) finishGame(); else renderQuestion(); });
  $("playAgain").addEventListener("click", () => beginGame(lastGame));
  $("resultHome").addEventListener("click", renderDashboard);
  $("showAwards").addEventListener("click", () => { renderAdult(); showScreen("adultScreen"); });
  $("adultButton").addEventListener("click", openAdult);
  $("closeAdult").addEventListener("click", renderDashboard);
  $("refreshProgress").addEventListener("click", renderAdult);
  $("syncButton").addEventListener("click", syncPending);
  $("clearLocalButton").addEventListener("click", () => {
    if (confirm("Hapus semua progres yang tersimpan di perangkat ini? Data Google Sheets tidak ikut terhapus.")) {
      CeriaStorage.clear(); playerName = ""; $("playerName").value = ""; renderAdult(); toast("Progres lokal dihapus.");
    }
  });
  $("soundToggle").addEventListener("click", () => {
    soundOn = !soundOn; CeriaAudio.setEnabled(soundOn);
    $("soundToggle").innerHTML = `${soundOn ? "🔊" : "🔇"} <span class="hide-mobile">Suara</span>`;
    $("soundToggle").setAttribute("aria-pressed", String(soundOn));
  });
  window.addEventListener("online", () => toast("Koneksi kembali tersedia. Kamu bisa sinkronkan hasil."));
  // Mulai dari beranda; nama panggilan sebelumnya tidak dipaksakan.
  const state = CeriaStorage.getState();
  if (state.name) $("playerName").value = state.name;
})();
