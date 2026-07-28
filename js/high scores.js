/*
  HIGH SCORES
  ------------------------------------------------------------
  Simple local top-10 leaderboard per game, stored in
  localStorage. Lives on-device - if you want scores to sync
  between the Windows PC and the Chromebook, this is the spot
  to swap in a tiny backend later (same interface, just make
  add()/getTop() hit a server instead).
*/

const HighScores = (() => {
  const KEY = "retro-launcher-scores";

  function _readAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  }

  function _writeAll(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function add(gameId, name, score) {
    const all = _readAll();
    const list = all[gameId] || [];
    list.push({ name: name || "Player", score: Number(score) || 0, date: new Date().toISOString() });
    list.sort((a, b) => b.score - a.score);
    all[gameId] = list.slice(0, 10);
    _writeAll(all);
    return all[gameId];
  }

  function getTop(gameId) {
    return (_readAll()[gameId] || []);
  }

  return { add, getTop };
})();
