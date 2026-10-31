const ProgressStore = (() => {
  const KEY = "belajarTulisCeriaProgress_v1";
  function empty() { return { stars: 0, completed: {}, sessions: 0, sound: true }; }
  function load() {
    try { return {...empty(), ...JSON.parse(localStorage.getItem(KEY) || "{}")}; }
    catch (e) { return empty(); }
  }
  let state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { return false; }
  }
  function markComplete(key, stars) {
    const previous = state.completed[key];
    if (!previous) state.stars += stars;
    else if (stars > previous.stars) state.stars += stars - previous.stars;
    state.completed[key] = {stars: Math.max(stars, previous?.stars || 0), date: new Date().toISOString()};
    state.sessions += 1; save(); return state;
  }
  function setSound(value) { state.sound = !!value; save(); }
  function getState() { return state; }
  return {load, save, markComplete, setSound, getState};
})();
