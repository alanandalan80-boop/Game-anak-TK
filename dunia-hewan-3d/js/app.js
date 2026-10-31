(() => {
  "use strict";
  const animals = [
    {id:"cat",name:"Kucing",category:"Peliharaan",emoji:"🐱",habitat:"Rumah dan lingkungan sekitar",food:"Makanan kucing",fact:"Kucing memiliki kumis yang membantu mengenali ruang di sekitarnya."},
    {id:"dog",name:"Anjing",category:"Peliharaan",emoji:"🐶",habitat:"Rumah",food:"Makanan anjing",fact:"Anjing memiliki penciuman yang sangat peka."},
    {id:"rabbit",name:"Kelinci",category:"Peliharaan",emoji:"🐰",habitat:"Kandang dan padang rumput",food:"Rumput dan sayuran yang sesuai",fact:"Kelinci memiliki telinga panjang dan suka melompat."},
    {id:"fish",name:"Ikan",category:"Peliharaan",emoji:"🐠",habitat:"Air",food:"Makanan ikan",fact:"Ikan bernapas menggunakan insang."},
    {id:"bird",name:"Burung",category:"Peliharaan",emoji:"🦜",habitat:"Pepohonan dan tempat bersarang",food:"Biji-bijian atau makanan sesuai jenisnya",fact:"Tubuh burung ditutupi bulu."},
    {id:"hamster",name:"Hamster",category:"Peliharaan",emoji:"🐹",habitat:"Kandang yang aman",food:"Pakan hamster",fact:"Hamster adalah hewan kecil yang aktif menjelajah."},
    {id:"cow",name:"Sapi",category:"Ternak",emoji:"🐮",habitat:"Peternakan dan padang rumput",food:"Rumput",fact:"Sapi termasuk hewan pemakan tumbuhan."},
    {id:"goat",name:"Kambing",category:"Ternak",emoji:"🐐",habitat:"Peternakan",food:"Rumput dan daun yang sesuai",fact:"Kambing dapat memakan berbagai jenis tumbuhan."},
    {id:"chicken",name:"Ayam",category:"Ternak",emoji:"🐔",habitat:"Kandang dan pekarangan",food:"Biji-bijian dan pakan ayam",fact:"Ayam berkembang biak dengan bertelur."},
    {id:"duck",name:"Bebek",category:"Ternak",emoji:"🦆",habitat:"Pekarangan dan area berair",food:"Tumbuhan air dan pakan sesuai",fact:"Bebek memiliki kaki berselaput untuk membantu berenang."},
    {id:"horse",name:"Kuda",category:"Ternak",emoji:"🐴",habitat:"Peternakan dan padang rumput",food:"Rumput dan jerami",fact:"Kuda dapat berlari dengan cepat."},
    {id:"sheep",name:"Domba",category:"Ternak",emoji:"🐑",habitat:"Peternakan dan padang rumput",food:"Rumput",fact:"Wol domba dapat digunakan untuk membuat kain."},
    {id:"lion",name:"Singa",category:"Liar",emoji:"🦁",habitat:"Padang rumput Afrika",food:"Daging",fact:"Singa adalah hewan karnivor."},
    {id:"tiger",name:"Harimau",category:"Liar",emoji:"🐯",habitat:"Hutan dan padang rumput tertentu",food:"Daging",fact:"Setiap harimau memiliki pola belang yang unik."},
    {id:"elephant",name:"Gajah",category:"Liar",emoji:"🐘",habitat:"Hutan dan padang rumput",food:"Daun, rumput, dan buah",fact:"Gajah menggunakan belalainya untuk mengambil makanan dan air."},
    {id:"giraffe",name:"Jerapah",category:"Liar",emoji:"🦒",habitat:"Sabana Afrika",food:"Daun pohon",fact:"Jerapah memiliki leher yang panjang."},
    {id:"zebra",name:"Zebra",category:"Liar",emoji:"🦓",habitat:"Sabana Afrika",food:"Rumput",fact:"Zebra memiliki pola belang hitam dan putih."},
    {id:"monkey",name:"Monyet",category:"Liar",emoji:"🐒",habitat:"Hutan",food:"Buah dan berbagai makanan sesuai jenisnya",fact:"Banyak monyet pandai memanjat pohon."},
    {id:"bear",name:"Beruang",category:"Liar",emoji:"🐻",habitat:"Hutan dan wilayah tertentu",food:"Beragam, tergantung jenisnya",fact:"Jenis beruang berbeda-beda dalam makanan dan habitat."},
    {id:"dolphin",name:"Lumba-lumba",category:"Air",emoji:"🐬",habitat:"Laut",food:"Ikan dan hewan laut kecil",fact:"Lumba-lumba adalah mamalia yang hidup di air."},
    {id:"whale",name:"Paus",category:"Air",emoji:"🐳",habitat:"Laut",food:"Beragam, tergantung jenisnya",fact:"Paus bernapas menggunakan paru-paru."},
    {id:"shark",name:"Hiu",category:"Air",emoji:"🦈",habitat:"Laut",food:"Beragam hewan laut",fact:"Hiu adalah ikan yang bernapas dengan insang."},
    {id:"octopus",name:"Gurita",category:"Air",emoji:"🐙",habitat:"Laut",food:"Kepiting dan hewan laut kecil",fact:"Gurita memiliki delapan lengan."},
    {id:"turtle",name:"Penyu",category:"Air",emoji:"🐢",habitat:"Laut dan pantai untuk bertelur",food:"Beragam, tergantung jenisnya",fact:"Penyu adalah reptil yang bernapas dengan paru-paru."},
    {id:"crab",name:"Kepiting",category:"Air",emoji:"🦀",habitat:"Pantai dan laut",food:"Beragam bahan organik dan hewan kecil",fact:"Kepiting memiliki cangkang keras."},
    {id:"eagle",name:"Elang",category:"Terbang",emoji:"🦅",habitat:"Pepohonan, tebing, dan wilayah terbuka",food:"Hewan kecil",fact:"Elang memiliki penglihatan yang tajam."},
    {id:"butterfly",name:"Kupu-kupu",category:"Terbang",emoji:"🦋",habitat:"Taman dan tempat dengan tanaman",food:"Nektar bunga",fact:"Kupu-kupu mengalami metamorfosis."},
    {id:"bee",name:"Lebah",category:"Terbang",emoji:"🐝",habitat:"Sarang di berbagai tempat",food:"Nektar dan serbuk sari",fact:"Lebah membantu penyerbukan banyak tumbuhan."},
    {id:"owl",name:"Burung hantu",category:"Terbang",emoji:"🦉",habitat:"Pepohonan dan hutan",food:"Hewan kecil",fact:"Banyak burung hantu aktif pada malam hari."}
  ];
  const games = [
    {id:"quiz",name:"Tebak Nama Hewan",icon:"🧠",desc:"Lihat gambar, lalu pilih nama yang benar."},
    {id:"food",name:"Pasangkan Makanan",icon:"🥕",desc:"Bantu hewan menemukan makanan yang cocok."},
    {id:"sound",name:"Tebak Suara Hewan",icon:"🔊",desc:"Dengarkan nama yang dibacakan lalu pilih hewannya."},
    {id:"shadow",name:"Pasangkan Bayangan",icon:"🌘",desc:"Cari teman yang cocok dengan siluetnya."},
    {id:"habitat",name:"Di Mana Rumahnya?",icon:"🏡",desc:"Pilih tempat tinggal hewan yang tepat."},
    {id:"puzzle",name:"Puzzle Hewan",icon:"🧩",desc:"Susun potongan dengan memilih gambar yang sama."},
    {id:"riddle",name:"Siapa Aku?",icon:"💭",desc:"Baca petunjuk dan tebak nama hewannya."}
  ];
  const $ = s => document.querySelector(s);
  const storageKey = "duniaHewan3D.v1";
  let state = loadState();
  let currentGame = null;
  let questionIndex = 0;
  let currentQuestions = [];
  let gameCorrect = 0;
  let gameAnswered = false;
  let soundOn = true;
  const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function loadState(){try{return JSON.parse(localStorage.getItem(storageKey))||{stars:0,sessions:[],animalsLearned:[]};}catch{return {stars:0,sessions:[],animalsLearned:[]};}}
  function saveState(){localStorage.setItem(storageKey,JSON.stringify(state));updateStats();}
  function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2300);}
  function speak(text){if(!soundOn)return;if("speechSynthesis" in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="id-ID";const voices=speechSynthesis.getVoices();const idVoice=voices.find(v=>/^id(-|_)/i.test(v.lang));if(idVoice)u.voice=idVoice;u.rate=.86;speechSynthesis.speak(u);}else toast("Suara tidak didukung di perangkat ini.");}
  function updateStats(){const sessions=state.sessions||[];$("#homeStars").textContent=`${state.stars||0} ⭐`;$("#homeGames").textContent=sessions.filter(s=>s.status==="Selesai").length;$("#progressStars").textContent=state.stars||0;$("#progressMessage").textContent=state.stars>=10?"Hebat! Kamu sudah mengumpulkan banyak bintang!":state.stars>0?"Terus bermain dan kenali lebih banyak hewan!":"Ayo main dan kumpulkan bintang pertamamu!";}
  function showPage(name){document.querySelectorAll(".page-section").forEach(p=>p.hidden=p.id!==`page-${name}`);document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===name));if(name==="animals")renderAnimals();if(name==="games")renderGames();if(name==="progress")renderHistory();window.scrollTo({top:0,behavior:"smooth"});}
  function renderAnimals(){const filter=$("#animalFilter").value;const list=animals.filter(a=>filter==="Semua"||a.category===filter);$("#animalGrid").innerHTML=list.map(a=>`<article class="animal-card"><div class="animal-visual" role="img" aria-label="${escapeHtml(a.name)}">${a.emoji}</div><h3>${escapeHtml(a.name)}</h3><p>${escapeHtml(a.fact)}</p><div class="card-meta"><span class="pill">${escapeHtml(a.category)}</span><button class="listen-btn" data-speak="${escapeHtml(a.name)}">🔊 Dengarkan</button></div></article>`).join("");}
  function renderGames(){$("#gameStage").hidden=true;$("#gameGrid").hidden=false;$("#gameGrid").innerHTML=games.map(g=>`<button class="game-card" data-game="${g.id}"><div class="game-icon">${g.icon}</div><h3>${g.name}</h3><p>${g.desc}</p><span class="play-link">Main sekarang →</span></button>`).join("");}
  function renderHistory(){const items=[...(state.sessions||[])].reverse();$("#historyList").innerHTML=items.length?items.map(s=>`<div class="history-item"><div><strong>${escapeHtml(s.gameName)}</strong><small>${new Date(s.date).toLocaleString("id-ID")} · ${s.correct}/${s.total} benar</small></div><strong>+${s.stars} ⭐</strong></div>`).join(""):'<div class="empty-state">Belum ada permainan. Ayo mulai petualangan pertamamu! 🌟</div>';}
  function pickRandom(arr,n){const copy=[...arr].sort(()=>Math.random()-.5);return copy.slice(0,n);}
  function makeQuestions(gameId){const pool=pickRandom(animals,Math.min(5,animals.length));return pool.map(a=>{let opts;if(gameId==="food"){opts=pickRandom(animals.filter(x=>x.id!==a.id),3).concat(a).sort(()=>Math.random()-.5);}else if(gameId==="habitat"){opts=pickRandom(animals.filter(x=>x.id!==a.id),3).concat(a).sort(()=>Math.random()-.5).map(x=>x.id===a.id?a.habitat:x.habitat);opts=[...new Set(opts)];while(opts.length<3)opts.push("Tempat lain");}else if(gameId==="riddle"){opts=pickRandom(animals.filter(x=>x.id!==a.id),3).concat(a).sort(()=>Math.random()-.5);}else{opts=pickRandom(animals.filter(x=>x.id!==a.id),3).concat(a).sort(()=>Math.random()-.5);}return {animal:a,options:opts};});}
  function startGame(id){currentGame=games.find(g=>g.id===id);questionIndex=0;gameCorrect=0;gameAnswered=false;currentQuestions=makeQuestions(id);$("#gameGrid").hidden=true;$("#gameStage").hidden=false;renderQuestion();$("#gameStage").scrollIntoView({behavior:"smooth",block:"start"});}
  function promptFor(q,id){if(id==="food")return `Makanan apa yang cocok untuk ${q.animal.name}?`;if(id==="habitat")return `Di mana ${q.animal.name} biasanya hidup?`;if(id==="riddle")return `Aku ${q.animal.fact.toLowerCase()} Siapakah aku?`;if(id==="shadow")return "Bayangkan bentuk hewan ini. Pilih nama yang cocok!";if(id==="puzzle")return "Pilih nama hewan pada gambar untuk menyelesaikan puzzle!";if(id==="sound")return "Dengarkan nama yang dibacakan, lalu pilih hewannya!";return "Hewan apakah yang kamu lihat?";}
  function optionLabel(o,id){if(id==="food")return o.id=== "rabbit"?"Wortel dan sayuran":o.id==="cow"||o.id==="sheep"?"Rumput":o.id==="monkey"?"Buah-buahan":o.id==="butterfly"?"Nektar bunga":o.id==="lion"||o.id==="tiger"?"Daging":o.food; if(id==="habitat")return o;return o.name;}
  function correctOption(q,id){if(id==="food"){const m={rabbit:"Wortel dan sayuran",cow:"Rumput",sheep:"Rumput",monkey:"Buah-buahan",butterfly:"Nektar bunga",lion:"Daging",tiger:"Daging"};return m[q.animal.id]||q.animal.food;}if(id==="habitat")return q.animal.habitat;return q.animal.name;}
  function renderQuestion(){const stage=$("#gameStage");if(questionIndex>=currentQuestions.length){finishGame();return;}const q=currentQuestions[questionIndex];gameAnswered=false;let options=q.options;if(currentGame.id==="habitat")options=[...new Set(options.map(o=>o.id===q.animal.id?q.animal.habitat:o.habitat))];if(currentGame.id==="food")options=options.map(o=>({label:optionLabel(o,"food"),id:o.id}));else options=options.map(o=>({label:optionLabel(o,currentGame.id),id:o.id||o}));const answer=correctOption(q,currentGame.id);if(!options.some(o=>o.label===answer))options[0]={label:answer,id:"correct"};
    stage.innerHTML=`<div class="stage-top"><button class="btn btn-light" id="quitGame">← Keluar</button><span class="pill">Soal ${questionIndex+1} dari ${currentQuestions.length}</span></div><div class="stage-question"><h2>${escapeHtml(promptFor(q,currentGame.id))}</h2><div class="question-animal" aria-label="${escapeHtml(q.animal.name)}">${currentGame.id==="shadow"?"🌑":currentGame.id==="puzzle"?"🧩":q.animal.emoji}</div>${currentGame.id==="sound"?'<button class="btn btn-light" id="playPrompt">🔊 Dengarkan nama</button>':""}<div class="answer-grid">${options.map((o,i)=>`<button class="answer-btn" data-answer="${escapeHtml(o.label)}">${escapeHtml(o.label)}</button>`).join("")}</div><div class="feedback" id="feedback" aria-live="polite"></div><div class="stage-actions"><button class="btn btn-primary" id="nextQuestion" hidden>${questionIndex===currentQuestions.length-1?"Lihat hasil":"Soal berikutnya →"}</button></div></div>`;
    $("#quitGame").onclick=()=>{currentGame=null;renderGames();toast("Permainan dihentikan. Kamu bisa mencoba lagi!");};if($("#playPrompt"))$("#playPrompt").onclick=()=>speak(q.animal.name);
    stage.querySelectorAll("[data-answer]").forEach(btn=>btn.addEventListener("click",()=>answerQuestion(btn,answer,q)));
  }
  function answerQuestion(btn,answer,q){if(gameAnswered)return;gameAnswered=true;const chosen=btn.dataset.answer;const correct=chosen===answer;const feedback=$("#feedback");if(correct){gameCorrect++;state.animalsLearned=Array.from(new Set([...(state.animalsLearned||[]),q.animal.id]));btn.classList.add("correct");feedback.textContent=["Hebat sekali! 🌟","Jawabanmu benar! 🎉","Pintar! ⭐"][Math.floor(Math.random()*3)];speak("Hebat! "+q.animal.name);}else{btn.classList.add("wrong");feedback.textContent=`Belum tepat. Jawabannya ${answer}. Ayo coba lagi! 💛`;speak("Ayo belajar lagi.");}$("#nextQuestion").hidden=false;$("#nextQuestion").onclick=()=>{questionIndex++;renderQuestion();};}
  async function finishGame(){const earned=gameCorrect;const session={sessionId:crypto.randomUUID?crypto.randomUUID():String(Date.now()),gameId:currentGame.id,gameName:currentGame.name,date:new Date().toISOString(),correct:gameCorrect,total:currentQuestions.length,stars:earned,status:"Selesai"};state.stars=(state.stars||0)+earned;state.sessions=state.sessions||[];state.sessions.push(session);saveState();if(window.RuangCeria){const synced=await window.RuangCeria.saveResult(session,"dunia-hewan-3d");if(!synced.success)console.warn("Hasil Dunia Hewan masuk antrean sinkronisasi.");}
    $("#gameStage").innerHTML=`<div class="stage-question"><div class="question-animal">🏆</div><span class="eyebrow">PERMAINAN SELESAI</span><h2>Kamu hebat!</h2><p>Kamu menjawab <b>${gameCorrect} dari ${currentQuestions.length}</b> soal dengan benar.</p><h2>${earned} ⭐</h2><p>Terus belajar dan kenali lebih banyak teman hewan.</p><div class="stage-actions"><button class="btn btn-primary" id="playAgain">Main lagi</button><button class="btn btn-light" id="backGames">Pilih permainan lain</button><button class="btn btn-light" id="backHome">Beranda</button></div></div>`;
    $("#playAgain").onclick=()=>startGame(currentGame.id);$("#backGames").onclick=()=>{currentGame=null;renderGames();};$("#backHome").onclick=()=>showPage("home");toast("Hasil tersimpan di perangkat ini.");}
  document.addEventListener("click",e=>{const page=e.target.closest("[data-page]");if(page){e.preventDefault();showPage(page.dataset.page);}const game=e.target.closest("[data-game]");if(game)startGame(game.dataset.game);const speakBtn=e.target.closest("[data-speak]");if(speakBtn)speak(speakBtn.dataset.speak);});
  $("#animalFilter").addEventListener("change",renderAnimals);$("#soundToggle").addEventListener("click",()=>{soundOn=!soundOn;$("#soundToggle").textContent=soundOn?"🔊 Suara":"🔇 Suara mati";if(!soundOn&&"speechSynthesis"in window)speechSynthesis.cancel();});
  $("#year").textContent=new Date().getFullYear();renderAnimals();renderGames();updateStats();
})();