(() => {
  const FAMILY = [
    {id:"ayah",name:"Ayah",emoji:"👨",desc:"Ayah adalah anggota keluarga yang kita sayangi.",group:"dewasa"},
    {id:"ibu",name:"Ibu",emoji:"👩",desc:"Ibu adalah anggota keluarga yang kita sayangi.",group:"dewasa"},
    {id:"kakak",name:"Kakak",emoji:"🧑",desc:"Kakak adalah saudara yang lebih tua.",group:"anak"},
    {id:"adik",name:"Adik",emoji:"👧",desc:"Adik adalah saudara yang lebih muda.",group:"anak"},
    {id:"kakek",name:"Kakek",emoji:"👴",desc:"Kakek adalah orang tua dari ayah atau ibu.",group:"lansia"},
    {id:"nenek",name:"Nenek",emoji:"👵",desc:"Nenek adalah orang tua dari ayah atau ibu.",group:"lansia"}
  ];
  const TITLES = {guess:"Tebak Gambar",match:"Pasangkan Gambar",find:"Siapakah yang Kucari?",sort:"Kelompokkan Keluarga",quiz:"Kuis Keluarga Ceria"};
  let state = null;
  const $ = (s,root=document)=>root.querySelector(s);
  const shuffle = arr => [...arr].sort(()=>Math.random()-.5);
  function start(type, callbacks) {
    state = {type,title:TITLES[type],callbacks,points:0,correct:0,total:0,started:Date.now(),index:0,questions:[]};
    if(type==="guess" || type==="find" || type==="quiz") {
      const count=type==="quiz"?5:5;
      state.questions=shuffle(FAMILY).slice(0,count);
      if(type==="quiz") state.questions=shuffle([...FAMILY,...FAMILY]).slice(0,5);
      renderQuestion();
    } else if(type==="match") renderMatch();
    else renderSort();
  }
  function progress() {
    const total=state.type==="match"?FAMILY.length:state.type==="sort"?4:state.questions.length;
    return `<div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,(state.total/total)*100)}%"></div></div>`;
  }
  function base(title,instruction) {
    return `<h2 class="game-title">${title}</h2><p class="game-instruction">${instruction}</p>${progress()}`;
  }
  function updateScore(){state.callbacks.score(state.points);}
  function renderQuestion() {
    const item=state.questions[state.index];
    if(!item){finish();return;}
    state.total=Math.max(state.total,state.index+1);
    const options=shuffle([item,...shuffle(FAMILY.filter(x=>x.id!==item.id)).slice(0,2)]);
    const prompt=state.type==="find" ? `Carilah ${item.name.toLowerCase()}!` : state.type==="guess" ? "Siapakah anggota keluarga ini?" : `Pilih jawaban yang tepat: ${item.name} adalah...`;
    const art=state.type==="find"?"🔎":item.emoji;
    $("#gameArea").innerHTML=base(state.title, state.type==="find"?"Dengarkan petunjuk, lalu sentuh gambar yang sesuai.":"Amati gambar dan pilih jawaban yang benar.")+
      `<div class="question-art" aria-label="${item.name}">${art}</div><div class="question-text">${prompt}</div>
      <div class="answer-grid">${options.map(o=>`<button class="answer-btn" data-answer="${o.id}"><span class="match-emoji">${o.emoji}</span><br>${o.name}</button>`).join("")}</div>
      <div id="feedback" class="feedback" aria-live="polite"></div><div class="next-row"><button id="repeatPrompt" class="btn btn-secondary">🔊 Ulangi suara</button> <button id="nextQuestion" class="btn btn-primary" hidden>Lanjut ➜</button></div>`;
    const questionText=state.type==="find"?`Carilah ${item.name}`:state.type==="guess"?"Siapakah ini?":`Pilih jawaban yang tepat untuk ${item.name}`;
    state.callbacks.speak(questionText);
    $("#repeatPrompt").onclick=()=>state.callbacks.speak(questionText);
    $("#gameArea").querySelectorAll("[data-answer]").forEach(btn=>btn.onclick=()=>answer(btn,item));
    $("#nextQuestion").onclick=()=>{state.index++;renderQuestion();};
  }
  function answer(btn,item) {
    if($("#nextQuestion").hidden===false)return;
    const feedback=$("#feedback");
    if(btn.dataset.answer===item.id){
      btn.classList.add("correct"); state.correct++;state.points+=10;updateScore();
      feedback.textContent=shuffle(["Hebat sekali! ⭐","Pintar! Kamu benar! 🎉","Bagus! Terus semangat! 💛"])[0];feedback.className="feedback good";
      state.callbacks.correct();state.callbacks.speak("Hebat sekali! Jawabanmu benar.");
      $("#gameArea").querySelectorAll("[data-answer]").forEach(b=>b.disabled=true);
      $("#nextQuestion").hidden=false;$("#repeatPrompt").hidden=true;
    }else{
      btn.classList.add("wrong");btn.disabled=true;
      feedback.textContent="Hampir benar! Ayo coba pilihan lain 😊";feedback.className="feedback try";
      state.callbacks.wrong();state.callbacks.speak("Ayo coba lagi.");
    }
  }
  function renderMatch() {
    state.total=FAMILY.length; state.matchSelected=null;state.matched=new Set();
    const names=shuffle(FAMILY);
    $("#gameArea").innerHTML=base(state.title,"Sentuh satu gambar, lalu pilih nama yang cocok.")+
      `<div class="match-layout"><div class="match-column"><h3>🖼️ Gambar</h3>${shuffle(FAMILY).map(x=>`<button class="match-card" data-match-image="${x.id}" aria-label="Pilih gambar ${x.name}"><span class="match-emoji">${x.emoji}</span></button>`).join("")}</div><div class="match-column"><h3>🔤 Nama</h3>${names.map(x=>`<button class="match-card" data-match-name="${x.id}">${x.name}</button>`).join("")}</div></div><div id="feedback" class="feedback" aria-live="polite"></div>`;
    $("#gameArea").querySelectorAll("[data-match-image]").forEach(b=>b.onclick=()=>{if(state.matched.has(b.dataset.matchImage))return;state.matchSelected=b.dataset.matchImage;$("#gameArea").querySelectorAll("[data-match-image]").forEach(x=>x.classList.toggle("selected",x===b));});
    $("#gameArea").querySelectorAll("[data-match-name]").forEach(b=>b.onclick=()=>matchName(b));
  }
  function matchName(btn){
    if(!state.matchSelected){$("#feedback").textContent="Pilih gambar terlebih dahulu ya!";return;}
    if(state.matched.has(btn.dataset.matchName))return;
    if(btn.dataset.matchName===state.matchSelected){
      state.matched.add(state.matchSelected);state.correct++;state.points+=10;updateScore();state.callbacks.correct();
      $("#gameArea").querySelector(`[data-match-image="${state.matchSelected}"]`).classList.add("matched");
      btn.classList.add("matched");btn.disabled=true;$("#feedback").textContent="Pasangan cocok! Hebat! ⭐";$("#feedback").className="feedback good";
      state.matchSelected=null;$("#gameArea").querySelectorAll("[data-match-image]").forEach(x=>x.classList.remove("selected"));
      const fill=$("#gameArea .progress-fill");if(fill)fill.style.width=(state.matched.size/FAMILY.length*100)+"%";
      if(state.matched.size===FAMILY.length){setTimeout(finish,700);}
    }else{$("#feedback").textContent="Belum cocok, coba lagi ya! 😊";$("#feedback").className="feedback try";state.callbacks.wrong();}
  }
  function renderSort(){
    state.total=4;state.sortDone=0;state.sortItems=shuffle([{id:"kakek",bucket:"lebihTua"},{id:"nenek",bucket:"lebihTua"},{id:"kakak",bucket:"lebihMuda"},{id:"adik",bucket:"lebihMuda"}]);
    const options=shuffle(state.sortItems);
    $("#gameArea").innerHTML=base(state.title,"Pilih kartu lalu tentukan kelompok yang sesuai. Ini latihan mengenal usia, bukan aturan susunan keluarga.")+
      `<div class="question-art">🧺</div><div class="answer-grid" id="sortCards">${options.map(x=>{const f=FAMILY.find(y=>y.id===x.id);return `<button class="answer-btn" data-sort="${x.id}">${f.emoji}<br>${f.name}</button>`}).join("")}</div>
      <div class="sort-targets"><div class="sort-target"><h3>👵 Lebih tua</h3><div id="olderBin">Pilih kartu, lalu sentuh kelompok ini.</div></div><div class="sort-target"><h3>🧒 Lebih muda</h3><div id="youngerBin">Pilih kartu, lalu sentuh kelompok ini.</div></div></div><div id="feedback" class="feedback" aria-live="polite"></div>`;
    state.sortSelected=null;
    $("#gameArea").querySelectorAll("[data-sort]").forEach(b=>b.onclick=()=>{state.sortSelected=b.dataset.sort;$("#gameArea").querySelectorAll("[data-sort]").forEach(x=>x.classList.toggle("correct",x===b));$("#feedback").textContent="Sekarang pilih kelompoknya.";});
    $(".sort-target").addEventListener("click",e=>{const target=e.currentTarget.querySelector("h3").textContent.includes("Lebih tua")?"lebihTua":"lebihMuda";if(!state.sortSelected)return;const item=state.sortItems.find(x=>x.id===state.sortSelected);const f=FAMILY.find(x=>x.id===item.id);
      if(item.bucket===target){const btn=$(`[data-sort="${item.id}"]`);if(btn.disabled)return;btn.disabled=true;btn.classList.add("correct");const bin=target==="lebihTua"?$("#olderBin"):$("#youngerBin");bin.innerHTML+=`<span style="display:inline-block;padding:4px 7px">${f.emoji} ${f.name}</span>`;state.correct++;state.sortDone++;state.points+=10;updateScore();state.callbacks.correct();$("#feedback").textContent="Tepat sekali! ⭐";$("#feedback").className="feedback good";state.sortSelected=null;if(state.sortDone===4)setTimeout(finish,700);}
      else{$("#feedback").textContent="Coba pikirkan lagi ya!";$("#feedback").className="feedback try";state.callbacks.wrong();}});
  }
  function finish(){
    if(!state)return;
    const result={game:state.type,title:state.title,points:state.points,correct:state.correct,total:state.total,duration:Math.max(1,Math.round((Date.now()-state.started)/1000))};
    state.callbacks.finish(result);state=null;
  }
  window.KCGames={start, titles:TITLES};
})();
