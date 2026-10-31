(() => {
  let enabled = localStorage.getItem("kc_sound") !== "off";
  let audioContext;
  const speechSupported = "speechSynthesis" in window;
  function speak(text) {
    if (!enabled || !speechSupported) return false;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      const idVoice = speechSynthesis.getVoices().find(v => /^id(-|_)/i.test(v.lang));
      if (idVoice) utterance.voice = idVoice;
      utterance.rate = 0.86;
      utterance.pitch = 1.08;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (_) { return false; }
  }
  function tone(freq=660, duration=.12, type="sine") {
    if (!enabled) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = type; osc.frequency.value = freq;
      gain.gain.setValueAtTime(.07, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      osc.connect(gain); gain.connect(audioContext.destination);
      osc.start(); osc.stop(audioContext.currentTime + duration);
    } catch (_) {}
  }
  function correct() { tone(660,.12); setTimeout(()=>tone(880,.16),100); }
  function wrong() { tone(240,.16,"triangle"); }
  function setEnabled(value) {
    enabled = Boolean(value);
    localStorage.setItem("kc_sound", enabled ? "on" : "off");
    if (!enabled && speechSupported) window.speechSynthesis.cancel();
    return enabled;
  }
  window.KCAudio = { speak, tone, correct, wrong, setEnabled, isEnabled:()=>enabled, supported:()=>speechSupported };
})();
