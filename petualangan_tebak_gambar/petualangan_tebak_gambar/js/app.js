/* Petualangan Tebak Gambar — demo frontend + opsional Google Apps Script API */
const CONFIG = {
  QUESTIONS_PER_ROUND: 10
};

const CATEGORY_DATA = [
  {id:"hewan",name:"Hewan",emoji:"🐾",color:"#fff0c2",desc:"Kenali teman berbulu"},
  {id:"buah",name:"Buah-buahan",emoji:"🍎",color:"#ffe0e8",desc:"Buah segar dan lezat"},
  {id:"sayur",name:"Sayur-sayuran",emoji:"🥕",color:"#e1f7d9",desc:"Sayur sehat setiap hari"},
  {id:"kendaraan",name:"Kendaraan",emoji:"🚗",color:"#dff2ff",desc:"Ayo jalan-jalan"},
  {id:"warna",name:"Warna",emoji:"🎨",color:"#eee5ff",desc:"Warna-warni ceria"},
  {id:"tubuh",name:"Anggota Tubuh",emoji:"👀",color:"#ffe9d7",desc:"Kenali tubuh kita"},
  {id:"rumah",name:"Benda di Rumah",emoji:"🏠",color:"#e1f5ed",desc:"Benda di sekitar kita"},
  {id:"alam",name:"Alam & Lingkungan",emoji:"🌳",color:"#dff4e4",desc:"Indahnya alam"},
  {id:"sekolah",name:"Alat Sekolah",emoji:"🎒",color:"#fff0cb",desc:"Teman belajar"},
  {id:"campuran",name:"Campuran",emoji:"🎁",color:"#fce2ff",desc:"Semua jadi satu"}
];

const DEMO_QUESTIONS = [
  q("hewan","Manakah gambar kucing?","🐱","Kucing",["Anjing","Kucing","Ikan","Ayam"],"Kucing suka mengeong."),
  q("hewan","Manakah gambar gajah?","🐘","Gajah",["Kelinci","Kuda","Gajah","Burung"],"Gajah punya belalai."),
  q("hewan","Hewan apa yang menghasilkan susu?","🐄","Sapi",["Sapi","Kucing","Ikan","Semut"],"Hewan ini berbunyi moo."),
  q("hewan","Manakah gambar ikan?","🐟","Ikan",["Ayam","Ikan","Kambing","Kupu-kupu"],"Ikan hidup di air."),
  q("hewan","Hewan apa yang suka melompat?","🐰","Kelinci",["Gajah","Kelinci","Sapi","Ikan"],"Hewan ini punya telinga panjang."),
  q("hewan","Manakah gambar ayam?","🐔","Ayam",["Bebek","Kucing","Ayam","Kuda"],"Ayam bertelur."),
  q("buah","Buah apa yang berwarna kuning dan panjang?","🍌","Pisang",["Apel","Anggur","Pisang","Semangka"],"Monyet sering digambarkan menyukai buah ini."),
  q("buah","Manakah gambar semangka?","🍉","Semangka",["Jeruk","Mangga","Pir","Semangka"],"Buah ini besar dan berair."),
  q("buah","Buah apa yang kecil dan bergerombol?","🍇","Anggur",["Anggur","Pisang","Kelapa","Nanas"],"Buah ini sering berwarna ungu."),
  q("buah","Manakah gambar jeruk?","🍊","Jeruk",["Apel","Jeruk","Pisang","Stroberi"],"Buah ini bulat dan kaya vitamin C."),
  q("sayur","Sayur apa yang berwarna oranye?","🥕","Wortel",["Bayam","Terong","Wortel","Timun"],"Kelinci di kartun suka sayur ini."),
  q("sayur","Manakah gambar brokoli?","🥦","Brokoli",["Jagung","Brokoli","Kentang","Cabai"],"Bentuknya seperti pohon kecil."),
  q("kendaraan","Kendaraan apa yang terbang di langit?","✈️","Pesawat",["Bus","Kapal","Sepeda","Pesawat"],"Kendaraan ini punya sayap."),
  q("kendaraan","Manakah gambar sepeda?","🚲","Sepeda",["Mobil","Kereta","Sepeda","Pesawat"],"Kendaraan ini memiliki pedal."),
  q("kendaraan","Kendaraan apa yang berjalan di rel?","🚆","Kereta",["Kapal","Kereta","Bus","Sepeda"],"Kendaraan ini panjang."),
  q("warna","Pilih benda yang biasanya berwarna merah.","🍓","Merah",["Biru","Hijau","Merah","Ungu"],"Warna stroberi yang matang."),
  q("warna","Warna daun yang sehat biasanya apa?","🍃","Hijau",["Hitam","Hijau","Merah muda","Biru"],"Warna rumput."),
  q("tubuh","Bagian tubuh untuk melihat adalah ...","👀","Mata",["Telinga","Hidung","Mata","Kaki"],"Kita punya dua bagian ini."),
  q("tubuh","Bagian tubuh untuk mendengar adalah ...","👂","Telinga",["Telinga","Mulut","Tangan","Lutut"],"Kita mendengar suara dengannya."),
  q("rumah","Benda untuk duduk adalah ...","🪑","Kursi",["Piring","Kursi","Bantal","Lampu"],"Kita bisa duduk di atasnya."),
  q("rumah","Benda yang menerangi ruangan adalah ...","💡","Lampu",["Sepatu","Buku","Lampu","Sapu"],"Benda ini menyala saat dinyalakan."),
  q("alam","Benda langit yang bersinar pada siang hari adalah ...","☀️","Matahari",["Bulan","Bintang","Matahari","Awan"],"Membuat bumi terasa hangat."),
  q("alam","Manakah gambar bunga?","🌸","Bunga",["Batu","Bunga","Awan","Gunung"],"Benda ini sering harum dan berwarna-warni."),
  q("sekolah","Benda untuk menulis adalah ...","✏️","Pensil",["Sendok","Pensil","Bola","Sisir"],"Kita menggunakannya saat belajar."),
  q("sekolah","Benda untuk membawa buku ke sekolah adalah ...","🎒","Tas",["Tas","Panci","Payung","Bantal"],"Benda ini bisa dipakai di punggung.")
];
function q(categoryId,question_text,emoji,correct_answer,options,hint_text){
  return {question_id:`demo-${categoryId}-${question_text}`,category_id:categoryId,question_text,image_emoji:emoji,correct_answer,options,hint_text,difficulty:"mudah",is_active:true};
}

const state = {screen:"home",sound:true,category:null,questions:[],index:0,roundStars:0,correct:0,answered:false,startedAt:0,totalStars:Number(localStorage.getItem("tbg_total_stars")||0),results:JSON.parse(localStorage.getItem("tbg_results")||"[]"),usedHints:false};
const $ = id => document.getElementById(id);
const screens = ["homeScreen","gameScreen","resultScreen","helpScreen"];

function showScreen(name){
  state.screen=name;
  screens.forEach(id=>$(id).classList.toggle("active",id===({home:"homeScreen",game:"gameScreen",result:"resultScreen",help:"helpScreen"}[name])));
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderCategories(){
  $("categoryGrid").innerHTML = CATEGORY_DATA.map(c=>`
    <button class="category-card" style="--tile:${c.color}" data-category="${c.id}" aria-label="Pilih kategori ${c.name}">
      <span class="category-emoji">${c.emoji}</span><b>${c.name}</b><small>${c.desc}</small>
    </button>`).join("");
  document.querySelectorAll("[data-category]").forEach(btn=>btn.addEventListener("click",()=>startGame(btn.dataset.category)));
}
function updateStars(){ $("totalStars").textContent=state.totalStars; $("roundStars").textContent=state.roundStars; }
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
async function fetchQuestions(categoryId){
  if(window.RuangCeria){
    try{
      const rows=await window.RuangCeria.getQuestions(categoryId);
      if(Array.isArray(rows)&&rows.length)return rows.map(normalizeQuestion);
    }catch(err){console.warn("Bank soal pusat belum tersedia, memakai soal demo.",err);}
  }
  let list=categoryId==="campuran"?DEMO_QUESTIONS:[...DEMO_QUESTIONS.filter(x=>x.category_id===categoryId)];
  // Demo fallback supaya semua kategori bisa dicoba, meski jumlah soal terbatas.
  if(list.length===0)list=DEMO_QUESTIONS;
  if(list.length<CONFIG.QUESTIONS_PER_ROUND){
    const extra=DEMO_QUESTIONS.filter(x=>!list.includes(x));
    list=list.concat(shuffle(extra)).slice(0,CONFIG.QUESTIONS_PER_ROUND);
  }
  return shuffle(list).slice(0,Math.min(CONFIG.QUESTIONS_PER_ROUND,list.length));
}
function normalizeQuestion(item){
  let options=item.options;
  if(typeof options==="string"){try{options=JSON.parse(options)}catch{options=[]}}
  if(!Array.isArray(options))options=[item.option_1,item.option_2,item.option_3,item.option_4].filter(Boolean);
  return {...item,options,image_emoji:item.image_emoji||item.emoji||"❔",image_url:item.image_url||""};
}
async function startGame(categoryId){
  state.category=CATEGORY_DATA.find(c=>c.id===categoryId)||CATEGORY_DATA[0];
  showScreen("game");
  $("questionText").textContent="Sebentar, kita siapkan soal...";
  $("answerGrid").innerHTML="";$("feedback").textContent="";
  state.questions=await fetchQuestions(categoryId);
  state.index=0;state.roundStars=0;state.correct=0;state.startedAt=Date.now();state.answered=false;
  updateStars();renderQuestion();
}
function renderQuestion(){
  const item=state.questions[state.index];if(!item){finishGame();return}
  state.answered=false;
  $("currentCategory").textContent=`${state.category.emoji} ${state.category.name}`;
  $("questionCount").textContent=`Soal ${state.index+1} dari ${state.questions.length}`;
  $("progressFill").style.width=`${((state.index+1)/state.questions.length)*100}%`;
  $("questionText").textContent=item.question_text;
  const picture=$("questionPicture");
  picture.replaceChildren();
  if(item.image_url && /^https?:\/\//i.test(item.image_url)){
    const img=document.createElement("img");img.src=item.image_url;img.alt=item.correct_answer||"Gambar soal";img.loading="eager";
    img.onerror=()=>{picture.textContent=item.image_emoji||"❔";};picture.appendChild(img);
  }else{picture.textContent=item.image_emoji||"❔";}
  picture.setAttribute("aria-label",item.correct_answer||"Gambar soal");
  $("listenButton").textContent="🔊 Dengarkan pertanyaan";
  $("feedback").textContent="";$("feedback").className="feedback";
  $("nextButton").disabled=true;
  $("nextButton").textContent=state.index===state.questions.length-1?"Lihat Hasil 🎉":"Soal berikutnya →";
  let options=shuffle(Array.isArray(item.options)?item.options:[item.option_1,item.option_2,item.option_3,item.option_4].filter(Boolean));
  if(!options.includes(item.correct_answer))options=shuffle([...options,item.correct_answer]).slice(0,4);
  $("answerGrid").innerHTML=options.map((opt,i)=>`<button class="answer-button" data-answer="${escapeAttr(opt)}">${["🌟","🧸","🎈","🍀"][i]}<br>${escapeHtml(opt)}</button>`).join("");
  document.querySelectorAll("[data-answer]").forEach(btn=>btn.addEventListener("click",()=>checkAnswer(btn,btn.dataset.answer,item)));
}
function checkAnswer(button,answer,item){
  if(state.answered)return;
  const correct=String(answer).trim().toLocaleLowerCase("id")===String(item.correct_answer).trim().toLocaleLowerCase("id");
  if(correct){
    state.answered=true;state.correct++;state.roundStars++;state.totalStars++;
    localStorage.setItem("tbg_total_stars",String(state.totalStars));updateStars();
    button.classList.add("correct");$("feedback").textContent=randomPraise();$("feedback").className="feedback good";
    speak("Hebat sekali! Jawaban kamu benar.");
    document.querySelectorAll(".answer-button").forEach(b=>b.disabled=true);
    $("nextButton").disabled=false;
  }else{
    button.classList.add("incorrect");button.disabled=true;
    $("feedback").textContent="Belum tepat, yuk coba lagi! 💛";$("feedback").className="feedback try";
    speak("Ayo coba lagi, kamu pasti bisa!");
  }
}
function randomPraise(){return ["Hebat sekali! 🌟","Pintar! Jawabanmu benar! 🎉","Yeay, kamu berhasil! 🥳","Wah, kamu jago! 💛"][Math.floor(Math.random()*4)]}
function speak(text){
  if(!state.sound)return;
  try{if("speechSynthesis"in window){window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang="id-ID";const idVoice=speechSynthesis.getVoices().find(v=>/^id(-|_)/i.test(v.lang));if(idVoice)utterance.voice=idVoice;utterance.rate=.88;utterance.pitch=1.12;window.speechSynthesis.speak(utterance);}}catch(e){console.warn("Audio tidak tersedia",e)}
}
function finishGame(){
  showScreen("result");
  const total=state.questions.length,accuracy=total?Math.round(state.correct/total*100):0;
  $("resultCorrect").textContent=`${state.correct}/${total}`;$("resultStars").textContent=state.roundStars;$("resultAccuracy").textContent=`${accuracy}%`;
  $("resultTitle").textContent=accuracy===100?"Luar biasa! 🌟":accuracy>=60?"Hebat sekali! 🎉":"Kamu sudah berusaha! 💛";
  $("resultMessage").textContent=accuracy>=60?"Terus belajar dan bermain, ya. Kamu makin pintar setiap hari!":"Terima kasih sudah bermain. Yuk coba lagi, kamu pasti bisa!";
  const result={result_id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),participant_code:"ANONIM-LOKAL",category_id:state.category.id,total_questions:total,correct_answers:state.correct,total_stars:state.roundStars,accuracy_percentage:accuracy,duration_seconds:Math.round((Date.now()-state.startedAt)/1000),played_at:new Date().toISOString()};
  state.results.push(result);localStorage.setItem("tbg_results",JSON.stringify(state.results));
  $("saveStatus").textContent="Hasil tersimpan di perangkat ini.";
  if(window.RuangCeria){
    $("saveStatus").textContent="Menyimpan hasil permainan...";
    window.RuangCeria.saveResult(result,"petualangan-tebak-gambar").then(out=>{$("saveStatus").textContent=out.success?"Hasil permainan berhasil disimpan ke pusat.":"Hasil tersimpan di perangkat dan menunggu sinkronisasi."});
  }
  speak($("resultTitle").textContent);
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s)}
function openHome(){showScreen("home")}
$("startButton").addEventListener("click",()=>{document.querySelector(".section-heading").scrollIntoView({behavior:"smooth",block:"start"})});
$("homeBrand").addEventListener("click",e=>{e.preventDefault();openHome()});
$("backHome").addEventListener("click",openHome);
$("howToButton").addEventListener("click",()=>showScreen("help"));
$("helpBack").addEventListener("click",openHome);
$("helpStart").addEventListener("click",()=>{showScreen("home");$("categoryGrid").scrollIntoView({behavior:"smooth",block:"center"})});
$("listenButton").addEventListener("click",()=>{const item=state.questions[state.index];if(item)speak(item.question_text+(item.hint_text?" Petunjuk: "+item.hint_text:""))});
$("nextButton").addEventListener("click",()=>{if(!state.answered)return;state.index++;if(state.index>=state.questions.length)finishGame();else renderQuestion()});
$("playAgainButton").addEventListener("click",()=>startGame(state.category.id));
$("chooseCategoryButton").addEventListener("click",openHome);
$("soundToggle").addEventListener("click",()=>{state.sound=!state.sound;$("soundToggle").innerHTML=state.sound?'🔊 <span>Suara</span>':'🔇 <span>Suara mati</span>';if(!state.sound&&"speechSynthesis"in window)window.speechSynthesis.cancel()});
renderCategories();updateStars();
