window.CeriaAudio = (() => {
  let enabled = true;
  function speak(text) {
    if (!enabled || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      const idVoice = speechSynthesis.getVoices().find(v => /^id(-|_)/i.test(v.lang));
      if (idVoice) utterance.voice = idVoice;
      utterance.rate = 0.88; utterance.pitch = 1.08;
      speechSynthesis.speak(utterance);
    } catch (_) {}
  }
  function tone(frequency, duration, type = "sine") {
    if (!enabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator(), gain = ctx.createGain();
      oscillator.type = type; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(); oscillator.stop(ctx.currentTime + duration);
      oscillator.onended = () => ctx.close();
    } catch (_) {}
  }
  return {
    setEnabled(value) { enabled = Boolean(value); if (!enabled && "speechSynthesis" in window) speechSynthesis.cancel(); },
    isEnabled() { return enabled; },
    correct() { tone(660, .12); setTimeout(() => tone(880, .18), 100); },
    tryAgain() { tone(260, .16, "triangle"); },
    speak,
    click() { tone(440, .06); }
  };
})();
