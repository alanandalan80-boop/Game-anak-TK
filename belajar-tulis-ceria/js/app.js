(() => {
  const $ = id => document.getElementById(id);
  let category = "letters", itemIndex = 0, lastEffort = 0, traceTimer = null;
  const screens = {home:$("homeScreen"), lesson:$("lessonScreen"), free:$("freeScreen")};
  const currentList = () => window.LESSON_DATA[category];
  const currentItem = () => currentList()[itemIndex];
  function showScreen(name) { Object.values(screens).forEach(s=>s.classList.remove("active")); screens[name].classList.add("active"); window.scrollTo({top:0,behavior:"smooth"}); }
  function itemKey() { return `${category}:${currentItem().value}`; }
  function updateProgress() {
    const p=ProgressStore.getState(), completed=Object.keys(p.completed||{}).length;
    $("totalStars").textContent=p.stars; $("lessonStars").textContent=p.stars;
    $("completedCount").textContent=completed;
    const total=26+21+10;
    $("progressBar").style.width=Math.min(100,completed/total*100)+"%";
    $("progressSummary").textContent=completed ? `Kamu sudah menyelesaikan ${completed} latihan. Terus semangat!` : "Ayo mulai latihan pertamamu!";
  }
  function openCategory(cat) {
    category=cat; itemIndex=0;
    if(cat==="free"){showScreen("free");FreeDrawing.init();return;}
    $("lessonCategory").textContent=cat==="letters"?"🔤 Belajar Huruf":cat==="numbers"?"🔢 Belajar Angka":"🧸 Belajar Kata";
    $("pickerTitle").textContent=cat==="letters"?"Pilih huruf":cat==="numbers"?"Pilih angka":"Pilih kata";
    $("pickerHelp").textContent="Ketuk pilihan yang ingin kamu tulis.";
    $("practiceEyebrow").textContent=cat==="letters"?"AYO MENULIS HURUF":cat==="numbers"?"AYO MENULIS ANGKA":"AYO MENULIS KATA";
    showScreen("lesson"); renderPicker(); renderItem(); Tracing.setMode("trace",currentItem().value); updateProgress();
  }
  function renderPicker() {
    const picker=$("itemPicker"); picker.innerHTML="";
    currentList().forEach((item,i)=>{
      const b=document.createElement("button"); b.className="pick-item"+(i===itemIndex?" active":"");
      b.textContent=item.value; b.setAttribute("aria-label",item.label);
      b.addEventListener("click",()=>{itemIndex=i;renderPicker();renderItem();Tracing.setItem(currentItem().value);});
      picker.appendChild(b);
    });
  }
  function renderItem() {
    const item=currentItem();
    $("targetTitle").textContent=item.label;
    $("targetPrompt").textContent=category==="words"?"Ikuti huruf-hurufnya satu per satu, ya!":"Ikuti garis putus-putusnya, ya!";
    $("canvasHint").textContent="Mulai dari titik hijau, lalu ikuti garisnya ✨";
    $("feedback").className="feedback"; $("feedback").textContent="Kamu pasti bisa! Coba ikuti garisnya 😊";
    Tracing.setItem(item.value);
    if(category==="letters") Speech.speak(`${item.value}. ${item.word}`);
    else if(category==="numbers") Speech.speak(`${item.value}. ${item.word}`);
    else Speech.speak(item.value.split("").join(" "));
  }
  function finishPractice() {
    const effort=Tracing.getEffort();
    const stars=effort>.6?3:effort>.25?2:1;
    ProgressStore.markComplete(itemKey(),stars); updateProgress();
    if (window.RuangCeria) {
      window.RuangCeria.saveResult({
        recordId: "tulis-" + itemKey() + "-" + Date.now(),
        gameName: "Belajar Tulis Ceria",
        activity: "Latihan " + currentItem().label,
        totalQuestions: 1, correct: 1, score: stars, stars,
        durationSeconds: 0, timestamp: new Date().toISOString()
      }, "belajar-tulis-ceria").then(result => {
        if (!result.success) console.warn("Hasil latihan menulis masuk antrean sinkronisasi.");
      });
    }
    $("rewardTitle").textContent=["Bagus sekali!","Hebat!","Luar biasa!"][stars-1];
    $("rewardMessage").textContent=`Kamu sudah berlatih ${currentItem().label.toLowerCase()}. Terus mencoba, ya!`;
    $("rewardStars").textContent="⭐".repeat(stars)+"☆".repeat(3-stars);
    $("rewardModal").classList.add("show"); Speech.speak("Hebat! Kamu sudah selesai berlatih.");
  }
  function next(delta) {itemIndex=(itemIndex+delta+currentList().length)%currentList().length;renderPicker();renderItem();}
  document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>openCategory(b.dataset.open)));
  $("backHome").addEventListener("click",()=>{showScreen("home");updateProgress();});
  $("backHomeFree").addEventListener("click",()=>{showScreen("home");updateProgress();});
  $("showGuide").addEventListener("click",()=>{Tracing.showGuide();$("feedback").textContent="Lihat bentuk hurufnya, lalu coba ikuti pelan-pelan 👀";});
  $("clearCanvas").addEventListener("click",()=>{Tracing.clear();$("feedback").textContent="Tidak apa-apa, ayo coba lagi! 😊";});
  $("checkWork").addEventListener("click",finishPractice);
  $("prevItem").addEventListener("click",()=>next(-1)); $("nextItem").addEventListener("click",()=>next(1));
  $("speakBtn").addEventListener("click",()=>{const i=currentItem();Speech.speak(category==="words"?i.value.split("").join(" "):`${i.value}. ${i.word}`);});
  $("continueBtn").addEventListener("click",()=>{$("rewardModal").classList.remove("show");next(1);});
  $("rewardModal").addEventListener("click",e=>{if(e.target===$("rewardModal"))$("rewardModal").classList.remove("show");});
  $("soundToggle").addEventListener("click",()=>{
    const next=!Speech.isEnabled(); Speech.setEnabled(next);ProgressStore.setSound(next);
    $("soundToggle").textContent=next?"🔊 Suara Aktif":"🔇 Suara Mati";$("soundToggle").setAttribute("aria-pressed",String(next));
    if(next)Speech.speak("Suara aktif");
  });
  Tracing.init($("traceCanvas"), count=>{lastEffort=count;});
  // Free drawing module
  const FreeDrawing=(()=>{
    let canvas,ctx,drawing=false,undoStack=[];
    function init(){
      canvas=$("freeCanvas");if(canvas.dataset.ready)return;canvas.dataset.ready="1";ctx=canvas.getContext("2d");
      resize();canvas.addEventListener("pointerdown",start);canvas.addEventListener("pointermove",move);window.addEventListener("pointerup",()=>drawing=false);window.addEventListener("resize",resize);
      $("penColor").addEventListener("input",e=>window.freePenColor=e.target.value);
      $("penSize").addEventListener("input",e=>window.freePenSize=Number(e.target.value));
      window.freePenColor=$("penColor").value;window.freePenSize=Number($("penSize").value);
      $("clearFree").addEventListener("click",()=>{undoStack.push(canvas.toDataURL());ctx.clearRect(0,0,canvas.width,canvas.height);});
      $("undoFree").addEventListener("click",undo);
      $("saveDrawing").addEventListener("click",save);
    }
    function resize(){if(!canvas||!ctx)return;const r=canvas.getBoundingClientRect(),d=window.devicePixelRatio||1;let old=null;try{old=canvas.toDataURL()}catch(e){}canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle="#fffdf8";ctx.fillRect(0,0,r.width,r.height);if(old){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,r.width,r.height);img.src=old;}}
    function pos(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
    function start(e){drawing=true;undoStack.push(canvas.toDataURL());canvas.setPointerCapture?.(e.pointerId);const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.strokeStyle=window.freePenColor||"#ff668e";ctx.lineWidth=window.freePenSize||8;ctx.lineCap="round";ctx.lineJoin="round";e.preventDefault();}
    function move(e){if(!drawing)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault();}
    function undo(){const data=undoStack.pop();if(!data)return;const img=new Image();img.onload=()=>{const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);ctx.drawImage(img,0,0,r.width,r.height);};img.src=data;}
    function save(){const a=document.createElement("a");a.download="gambar-belajar-tulis.png";a.href=canvas.toDataURL("image/png");a.click();}
    return {init};
  })();
  updateProgress();
})();
