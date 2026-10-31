/* Browser tidak menyimpan URL atau token Google Apps Script. Semua request melalui server portal. */
window.RUANG_CERIA_CONFIG = {
  CENTRAL_API_URL: "/api/game-result",
  getUser: function () { return { playerId: window.RuangCeria ? window.RuangCeria.playerId() : "" }; }
};
