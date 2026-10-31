/* Penyimpanan lokal: progres tetap tersedia di perangkat yang sama. */
window.CeriaStorage = (() => {
  const KEY = "ceriaBerhitung.v1";
  const makeId = () => {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "p-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  };
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { playerId: makeId(), name: "", sessions: [], pending: [] };
      const data = JSON.parse(raw);
      return { playerId: data.playerId || makeId(), name: data.name || "", sessions: Array.isArray(data.sessions) ? data.sessions : [], pending: Array.isArray(data.pending) ? data.pending : [] };
    } catch {
      return { playerId: makeId(), name: "", sessions: [], pending: [] };
    }
  }
  let state = load();
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch { return false; }
  }
  return {
    getState: () => (typeof structuredClone === "function") ? structuredClone(state) : JSON.parse(JSON.stringify(state)),
    setName(name) { state.name = String(name || "").trim().slice(0, 24); persist(); },
    getPlayerId() { return state.playerId; },
    addSession(session) {
      const entry = { ...session, localId: makeId(), playerId: state.playerId, name: state.name || "Teman", savedAt: new Date().toISOString(), synced: false };
      state.sessions.unshift(entry);
      state.pending.push(entry);
      persist();
      return entry;
    },
    markSynced(localId) {
      state.sessions = state.sessions.map(s => s.localId === localId ? { ...s, synced: true } : s);
      state.pending = state.pending.filter(s => s.localId !== localId);
      persist();
    },
    getPending() { return state.pending.slice(); },
    clear() {
      state = { playerId: makeId(), name: "", sessions: [], pending: [] };
      persist();
    },
    totals() {
      return state.sessions.reduce((a, s) => {
        a.sessions += 1; a.correct += Number(s.correct || 0); a.stars += Number(s.stars || 0);
        return a;
      }, { sessions: 0, correct: 0, stars: 0 });
    }
  };
})();
