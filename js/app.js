/*
  APP
  ------------------------------------------------------------
  Wires together games-db, rom-library, boxart, highscores, and
  EmulatorJS into the picker + player UI.

  Controller support (Bluetooth gamepads) was removed from the
  play path after extensive testing showed unreliable behavior
  inside the in-browser emulator. This app now focuses on what's
  reliable everywhere: keyboard controls, pinned explicitly below
  so they're guaranteed identical on every computer.
*/

// Change this list to bring Intellivision/ColecoVision back into the
// tab bar later - the rest of the code for both already works, this
// just controls what's shown up top.
const VISIBLE_SYSTEMS = ["atari2600"];

let activeSystem = "atari2600";
let searchQuery = "";

const el = (sel) => document.querySelector(sel);

// -------- combined game list (library scan takes priority) --------
function getAllGames() {
  return RomLibrary.isConnected() ? RomLibrary.getGames() : GAMES;
}

// -------- library status / connect button --------
function renderLibraryStatus() {
  const box = el("#library-status");
  if (RomLibrary.isConnected()) {
    const count = RomLibrary.getGames().length;
    box.innerHTML = `<span>Library connected - ${count} game${count === 1 ? "" : "s"} found</span>
      <button class="btn small" id="rescan-btn">Rescan</button>`;
    el("#rescan-btn").addEventListener("click", async () => {
      await RomLibrary.connect();
      renderLibraryStatus();
      renderGrid();
    });
  } else {
    box.innerHTML = `<button class="btn" id="connect-btn">Choose ROM Folder</button>
      <span class="meta">Point this at your existing ROM library - nothing gets copied.</span>`;
    el("#connect-btn").addEventListener("click", async () => {
      try {
        await RomLibrary.connect();
      } catch (e) {
        console.warn("Folder pick cancelled or failed", e);
        return;
      }
      renderLibraryStatus();
      renderGrid();
    });
  }
}

// -------- tabs --------
function renderTabs() {
  const tabs = el("#tabs");
  tabs.innerHTML = Object.entries(SYSTEMS)
    .filter(([key]) => VISIBLE_SYSTEMS.includes(key))
    .map(([key, sys]) => `
    <button class="tab ${key === activeSystem ? "active" : ""}"
      style="--tab-color:${sys.badgeColor}" data-system="${key}">
      ${sys.label}
    </button>`).join("");
  tabs.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSystem = btn.dataset.system;
      renderTabs();
      renderGrid();
    });
  });
}

// -------- game grid (with progressive box art loading) --------
function renderGrid() {
  const grid = el("#grid");
  const games = getAllGames()
    .filter((g) => g.system === activeSystem)
    .filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));
  const sys = SYSTEMS[activeSystem];
  grid.innerHTML = games.map((g) => `
    <div class="card" style="--card-color:${sys.badgeColor}" data-id="${g.id}">
      <div class="art" data-art-for="${g.id}">${g.title}</div>
      <h3>${g.title}</h3>
      <div class="meta">${sys.label}</div>
      ${g.players === 2 ? `<span class="badge-2p">2 PLAYERS</span>` : ""}
    </div>`).join("") ||
    `<p style="opacity:.6">No ${sys.label} games found yet. ${
      RomLibrary.isConnected()
        ? "Check that your library folder has a subfolder with 'atari' in the name."
        : "Click \"Choose ROM Folder\" above, or add entries manually in js/games-db.js."
    }</p>`;

  grid.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => launchGame(getAllGames().find((g) => g.id === card.dataset.id)));
  });

  // Load box art in the background, one game at a time, without
  // blocking the initial grid render.
  games.forEach(async (g) => {
    const url = await BoxArt.getArtUrl(g);
    if (!url) return;
    const div = grid.querySelector(`[data-art-for="${g.id}"]`);
    if (div) {
      const img = new Image();
      img.onload = () => {
        div.style.backgroundImage = `url("${url}")`;
        div.style.backgroundSize = "cover";
        div.style.backgroundPosition = "center";
        div.textContent = "";
      };
      img.src = url;
    }
  });
}

function closeOverlay() {
  const overlay = el("#overlay");
  overlay.classList.add("hidden");
  overlay.innerHTML = "";
}

function launchGame(game) {
  if (!game) return;
  const sys = SYSTEMS[game.system];
  const overlay = el("#overlay");
  overlay.classList.remove("hidden");
  overlay.innerHTML = `<h2>${game.title}</h2><p>Loading...</p>`;

  (async () => {
    if (sys.requiresBios && RomLibrary.isConnected() && !RomLibrary.hasBios(game.system)) {
      overlay.innerHTML = `
        <h2>${game.title}</h2>
        <p>${sys.label} needs its BIOS file (${sys.requiresBios.join(", ")}) somewhere in your
        ROM library folder before this will run. Add it and click Rescan.</p>
        <button class="secondary" id="cancel-launch">Back</button>`;
      el("#cancel-launch").addEventListener("click", closeOverlay);
      return;
    }

    const gameUrl = game.fileHandle
      ? await RomLibrary.getBlobUrl(game)
      : sys.romPath + game.file;
    const biosUrl = game.fileHandle && sys.requiresBios
      ? await RomLibrary.getBiosBlobUrl(game.system)
      : (sys.requiresBios ? "bios/" + sys.requiresBios[0] : null);

    overlay.innerHTML = `
      <h2>${game.title}</h2>
      <div id="game-container"></div>
      <div class="controls-legend">
        <strong>Player 1:</strong> Arrow keys = Move &middot; X = Fire &middot; Z = Button 2
        &middot; Enter = Start/Reset &middot; V = Select
        ${game.players === 2 ? `<br/><em>2-player game:</em> open the settings (gear) icon on the
        game screen and use Control Settings to assign Player 2's keys.` : ""}
      </div>
      <div>
        <button class="secondary" id="enter-score">Enter Score</button>
        <button class="secondary" id="quit-game">Quit to Menu</button>
      </div>
    `;
    el("#quit-game").addEventListener("click", () => window.location.reload());
    el("#enter-score").addEventListener("click", () => promptScore(game));

    window.EJS_player = "#game-container";
    window.EJS_core = sys.core;
    window.EJS_gameUrl = gameUrl;
    window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
    window.EJS_startOnLoaded = true;
    window.EJS_Buttons = { gamepad: false, settings: true, exitEmulation: true };
    if (biosUrl) window.EJS_biosUrl = biosUrl;

    const old = document.getElementById("ejs-loader");
    if (old) old.remove();
    const script = document.createElement("script");
    script.id = "ejs-loader";
    script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
    document.body.appendChild(script);
  })();
}

function promptScore(game) {
  const name = prompt("Name for the high score list:", "Player 1");
  if (name === null) return;
  const score = prompt(`Score for ${game.title}:`, "0");
  if (score === null) return;
  const list = HighScores.add(game.id, name, score);
  alert(
    "Top scores for " + game.title + ":\n" +
    list.map((s, i) => `${i + 1}. ${s.name} - ${s.score}`).join("\n")
  );
}

// -------- init --------
document.addEventListener("DOMContentLoaded", async () => {
  renderTabs();

  el("#search-input").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderGrid();
  });

  const status = await RomLibrary.tryReconnect();
  if (status === "needs-permission") {
    const box = el("#library-status");
    box.innerHTML = `<button class="btn" id="reconnect-btn">Reconnect ROM Folder</button>
      <span class="meta">Your browser needs a click to re-grant access to your library.</span>`;
    el("#reconnect-btn").addEventListener("click", async () => {
      const ok = await RomLibrary.reconnectWithPermission();
      if (ok) { renderLibraryStatus(); renderGrid(); }
    });
  } else {
    renderLibraryStatus();
  }
  renderGrid();
});
