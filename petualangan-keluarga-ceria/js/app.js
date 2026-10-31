(() => {
  const $ = (s,root=document)=>root.querySelector(s);
  const screens=[...document.querySelectorAll(".screen")];
  let lastGame="guess";
  function show(id){screens.forEach(s=>s.classList.toggle("active",s.id===id));window.scrollTo({top:0,behavior:"smooth"});if(id==="adultScreen")renderAdult();if(id==="gamesScreen")renderStats();}
  function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2500);}
  function renderLearn(){
    $("#learnGrid").innerHTML=[
      {id:"ayah",name:"Ayah",emoji:"👨",desc:"Ayah adalah anggota keluarga yang kita sayangi."},
      {id:"ibu",name:"Ibu",emoji:"👩",desc:"Ibu adalah anggota keluarga yang kita sayangi."},
      {id:"kakak",name:"Kakak",emoji:"🧑",desc:"Kakak adalah saudara yang lebih tua."},
      {id:"adik",name:"Adik",emoji:"👧",desc:"Adik adalah saudara yang lebih muda."},
      {id:"kakek",name:"Kakek",emoji:"👴",desc:"Kakek adalah orang tua dari ayah atau ibu."},
      {id:"nenek",name:"Nenek",emoji:"👵",desc:"Nenek adalah orang tua dari ayah atau ibu."}
    ].map(x=>`<article class="learn-card"><span class="learn-art" role="img" aria-label="${x.name}">${x.emoji}</span><h3>${x.name}</h3><p>${x.desc}</p><button class="listen-button" data-learn="${x.id}">🔊 Dengarkan</button></article>`).join("");
    $("#learnGrid").querySelectorAll("[data-learn]").forEach(b=>b.onclick=()=>{const card=b.closest(".learn-card");KCAudio.speak(card.querySelector("h3").textContent+". "+card.querySelector("p").textContent);});
  }
  function renderStats(){const d=KCStorage.read();$("#homeStars").textContent=d.totalPoints;$("#homePlayed").textContent=d.sessions.length;}
  function renderAdult(){
    const d=KCStorage.read();$("#adultSessions").textContent=d.sessions.length;$("#adultPoints").textContent=d.totalPoints;$("#adultCorrect").textContent=d.totalCorrect;
    const rows=$("#historyRows");
    rows.innerHTML=d.sessions.length?d.sessions.map(s=>`<tr><td>${new Date(s.savedAt).toLocaleString("id-ID")}</td><td>${escapeHtml(s.title)}</td><td>${s.correct}/${s.total}</td><td>${s.points}</td></tr>`).join(""):`<tr><td colspan="4">Belum ada riwayat permainan.</td></tr>`;
  }
  function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function beginGame(type){
    lastGame=type;show("playScreen");$("#liveScore").textContent="0";
    KCGames.start(type,{
      score:value=>$("#liveScore").textContent=value,
      speak:text=>KCAudio.speak(text),
      correct:()=>KCAudio.correct(),
      wrong:()=>KCAudio.wrong(),
      finish:result=>{
        KCStorage.saveSession(result);
        $("#resultPoints").textContent=result.points;$("#resultCorrect").textContent=`${result.correct}/${result.total}`;
        $("#resultStars").textContent=Math.floor(result.points/10);
        $("#resultMessage").textContent=result.correct===result.total?"Sempurna! Kamu mengenal anggota keluarga dengan hebat!":"Terima kasih sudah mencoba. Setiap permainan membuatmu semakin pintar!";
        show("resultScreen");renderStats();
      }
    });
  }
  document.addEventListener("click",e=>{
    const nav=e.target.closest("[data-screen]");
    if(nav){show(nav.dataset.screen);return;}
    if(e.target.closest("[data-home]")){e.preventDefault();show("homeScreen");}
    const game=e.target.closest("[data-game]");if(game)beginGame(game.dataset.game);
  });
  $("#soundToggle").onclick=()=>{const enabled=KCAudio.setEnabled(!KCAudio.isEnabled());$("#soundToggle").textContent=enabled?"🔊 Suara":"🔇 Suara mati";toast(enabled?"Suara diaktifkan":"Suara dimatikan");};
  $("#adultEntry").onclick=()=>{const answer=window.prompt("Untuk guru/orang tua: berapa 3 + 2?");if(answer==="5")show("adultScreen");else if(answer!==null)toast("Coba minta bantuan orang dewasa ya.");};
  $("#exitGame").onclick=()=>show("gamesScreen");
  $("#playAgain").onclick=()=>beginGame(lastGame);
  $("#exportCsv").onclick=()=>KCStorage.exportCSV();
  $("#clearHistory").onclick=()=>{const ok=window.confirm("Hapus semua riwayat dan progres pada perangkat ini?");if(ok){KCStorage.clear();renderAdult();renderStats();toast("Riwayat lokal telah dihapus.");}};
  renderLearn();renderStats();
})();
