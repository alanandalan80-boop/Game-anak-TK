/* Penghubung sederhana GitHub Pages -> Google Apps Script -> Google Sheets. */
(() => {
  "use strict";
  const cfg = window.RUANG_CERIA_CONFIG || {};
  const GAS = String(cfg.GOOGLE_APPS_SCRIPT_URL || "").trim();
  const AUTH_KEY = "ruangCeriaTeacherSession_v1";
  const TOKEN_KEY = "ruangCeriaAccessToken_v1";
  const PLAYER_KEY = "ruangCeriaPlayerId_v1";
  const QUEUE_KEY = "ruangCeriaPendingResults_v1";
  const nativeFetch = window.fetch.bind(window);
  const jsonResponse = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{"Content-Type":"application/json"}});
  function requireGas() {
    if (!GAS || GAS.includes("TEMPEL_URL")) throw new Error("URL Google Apps Script belum diisi di ruang-ceria-config.js.");
    return GAS;
  }
  function jsonp(params) {
    return new Promise((resolve, reject) => {
      const callback = "rcJsonp_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      const script = document.createElement("script");
      const timer = setTimeout(() => finish(new Error("Google Apps Script tidak merespons. Periksa URL dan deployment.")), 15000);
      function finish(error, data) { clearTimeout(timer); delete window[callback]; script.remove(); error ? reject(error) : resolve(data); }
      window[callback] = data => finish(null, data);
      const query = new URLSearchParams({...params, callback});
      script.src = requireGas() + "?" + query.toString();
      script.onerror = () => finish(new Error("Gagal menghubungi Google Apps Script. Periksa URL Web App."));
      document.head.appendChild(script);
    });
  }
  function uuid() { return crypto.randomUUID ? crypto.randomUUID() : "rc-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2); }
  function playerId() { try { let id=localStorage.getItem(PLAYER_KEY); if(!id){id=uuid();localStorage.setItem(PLAYER_KEY,id);} return id; } catch (_) { return "session-"+uuid(); } }
  function readQueue(){try{const q=JSON.parse(localStorage.getItem(QUEUE_KEY)||"[]");return Array.isArray(q)?q:[];}catch(_){return[];}}
  function writeQueue(q){try{localStorage.setItem(QUEUE_KEY,JSON.stringify(q.slice(-100)));}catch(_){}}
  async function send(entry) {
    requireGas();
    // text/plain menghindari preflight CORS. Mode no-cors tidak memberi isi respons,
    // tetapi Apps Script tetap menerima POST dan menulis ke spreadsheet.
    await nativeFetch(GAS, {method:"POST", mode:"no-cors", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify({action:"saveGameResult",gameId:entry.gameId,playerId:entry.playerId,record:entry.record})});
    return {success:true, queuedForGoogleSheets:true};
  }
  async function saveResult(record, gameId) {
    const id=playerId();
    const entry={gameId:String(gameId||record.gameId||record.game_id||"unknown-game"),playerId:id,record:{...record,recordId:record.recordId||record.result_id||record.localId||record.clientSessionId||(record.timestamp?String(gameId||"game")+"-"+String(record.timestamp):record.sessionId)||uuid(),playerId:id,studentName:localStorage.getItem("ruangCeriaStudentName")||record.studentName||"Pemain",className:localStorage.getItem("ruangCeriaStudentClass")||record.className||""}};
    try { await send(entry); return {success:true,result:{success:true}}; }
    catch(error) { const q=readQueue(); if(!q.some(x=>x.record.recordId===entry.record.recordId))q.push(entry); writeQueue(q); return {success:false,queued:true,error:error.message}; }
  }
  async function syncPending(){const q=readQueue();let sent=0;for(const entry of q){try{await send(entry);sent++;}catch(_){break;}}writeQueue(q.slice(sent));return{success:sent===q.length,sent,remaining:q.length-sent};}
  async function getQuestions(categoryId){return jsonp({action:"getQuestions",categoryId:categoryId||""}).then(r=>r.data||[]);}
  function route(path, init={}) {
    const method=String(init.method||"GET").toUpperCase();
    if(path==="/api/login" && method==="POST") {
      let body={};try{body=JSON.parse(init.body||"{}");}catch(_){}
      const ok=String(body.username||"")===String(cfg.TEACHER_USERNAME||"guru") && String(body.password||"")===String(cfg.TEACHER_PASSWORD||"ceria123");
      if(ok){localStorage.setItem(AUTH_KEY,body.username);return Promise.resolve(jsonResponse({success:true,username:body.username}));}
      return Promise.resolve(jsonResponse({success:false,error:"Nama pengguna atau kata sandi salah."},401));
    }
    if(path==="/api/me") return Promise.resolve(jsonResponse({authenticated:!!localStorage.getItem(AUTH_KEY),username:localStorage.getItem(AUTH_KEY)||null}));
    if(path==="/api/logout") {localStorage.removeItem(AUTH_KEY);return Promise.resolve(jsonResponse({success:true}));}
    if(path==="/api/game-result" && method==="POST") {let b={};try{b=JSON.parse(init.body||"{}");}catch(_){}return saveResult(b.record||b,b.gameId).then(r=>jsonResponse(r,r.success?200:503));}
    if(path.startsWith("/api/game-questions")) {const u=new URL(path,location.href);return jsonp({action:"getQuestions",categoryId:u.searchParams.get("categoryId")||""}).then(jsonResponse);}
    if(path.startsWith("/api/game-progress")) {const u=new URL(path,location.href);return jsonp({action:"getPlayerProgress",playerId:u.searchParams.get("playerId")||""}).then(jsonResponse);}
    if(path==="/api/game-recap") return jsonp({action:"getRecap"}).then(jsonResponse);
    if(path.startsWith("/api/game-log")) {const u=new URL(path,location.href);return jsonp({action:"getLogs",limit:u.searchParams.get("limit")||500}).then(jsonResponse);}
    return Promise.resolve(jsonResponse({success:false,error:"Layanan tidak dikenal."},404));
  }
  window.fetch = function(input, init={}) {
    const raw=typeof input==="string"?input:(input&&input.url)||"";
    let url;try{url=new URL(raw,location.href);}catch(_){return nativeFetch(input,init);}
    if(url.origin===location.origin && url.pathname.startsWith("/api/")) return route(url.pathname+url.search,init);
    return nativeFetch(input,init);
  };
  window.RuangCeria={playerId,saveResult,syncPending,getQuestions};
  window.RuangCeriaAuth={hasToken:()=>!!localStorage.getItem(AUTH_KEY),clear:()=>localStorage.removeItem(AUTH_KEY)};
  window.addEventListener("online",()=>syncPending().catch(()=>{}));
})();
