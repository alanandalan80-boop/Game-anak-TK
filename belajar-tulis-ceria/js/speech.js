const Speech = (() => {
  let enabled = ProgressStore.getState().sound !== false;
  function speak(text) {
    if (!enabled || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.lang = "id-ID";
      const idVoice = speechSynthesis.getVoices().find(v => /^id(-|_)/i.test(v.lang));
      if (idVoice) utterance.voice = idVoice; utterance.rate = 0.82; utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch (e) { /* suara tidak tersedia di browser ini */ }
  }
  function setEnabled(value) { enabled = !!value; if (!enabled && "speechSynthesis" in window) speechSynthesis.cancel(); }
  function isEnabled() { return enabled; }
  return {speak, setEnabled, isEnabled};
})();
