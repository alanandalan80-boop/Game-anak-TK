/* API same-origin. Node server meneruskan request ke Google Apps Script pusat. */
window.CeriaAPI = (() => {
  async function saveSession(session) {
    if (window.RuangCeria) return window.RuangCeria.saveResult(session, "ceria-berhitung");
    return { success:false, offline:true, message:"Jembatan API portal belum tersedia." };
  }
  async function getProgress(playerId) {
    try {
      const response = await fetch("/api/game-progress?playerId=" + encodeURIComponent(playerId), {credentials:"same-origin"});
      const result = await response.json();
      return response.ok && result.success ? result : {success:false, offline:true, message:result.error || "Progres belum tersedia."};
    } catch (error) {
      return {success:false, offline:true, message:error.message || "Tidak dapat menghubungi server."};
    }
  }
  return { isConfigured: () => true, saveSession, getProgress };
})();
