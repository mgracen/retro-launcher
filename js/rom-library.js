/*
  ROM LIBRARY
  ------------------------------------------------------------
  Lets you point the launcher at your EXISTING ROM folder on
  disk instead of copying files into roms/<system>/ one at a
  time. Uses the browser's File System Access API:
    - You click "Choose ROM Folder" once and grant read access.
    - The folder handle is remembered (via IndexedDB) so you
      don't have to re-pick it every session - the browser will
      just ask you to re-confirm access with one click.
    - Every file inside is scanned recursively, matched to a
      system by folder name / extension, and turned into a
      playable entry automatically.

  This only works in Chromium browsers (Chrome, Edge - which
  covers both your Windows PC and the Chromebook). Nothing is
  uploaded anywhere; the browser reads the files locally to
  hand them to the emulator core.
*/

const RomLibrary = (() => {
  const DB_NAME = "retro-launcher-db";
  const STORE = "handles";
  const HANDLE_KEY = "libraryRoot";

  let libraryGames = [];      // scanned + merged entries, see shape below
  let biosHandles = {};       // { "coleco.rom": fileHandle, ... }
  let connected = false;

  // ---------- tiny IndexedDB helper (handles aren't localStorage-safe) ----------
  function idbOpen() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbSet(key, val) {
    const db = await idbOpen();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  async function idbGet(key) {
    const db = await idbOpen();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  // ---------- system detection ----------
  const EXT_SYSTEM = {
    a26: "atari2600",
    a78: "atari2600",
    int: "intellivision",
    itv: "intellivision",
    col: "colecovision",
  };
  const FOLDER_HINTS = [
    [/atari|2600/i, "atari2600"],
    [/intv|intellivision/i, "intellivision"],
    [/coleco/i, "colecovision"],
  ];

  function guessSystem(path, filename) {
    for (const [pattern, sys] of FOLDER_HINTS) {
      if (pattern.test(path)) return sys;
    }
    const ext = filename.split(".").pop().toLowerCase();
    if (EXT_SYSTEM[ext]) return EXT_SYSTEM[ext];
    // Fallback: this project is currently Atari-focused (see
    // VISIBLE_SYSTEMS in app.js), so an unrecognized extension with
    // no folder hint (e.g. a plain .bin sitting in the root folder
    // you picked) defaults to Atari rather than being silently
    // skipped. If you bring Intellivision/ColecoVision back and mix
    // file types in one flat folder, organize them into subfolders
    // named with "atari"/"intv"/"coleco" so this fallback doesn't
    // miscategorize them.
    return "atari2600";
  }

  function normalizeId(filename) {
    return filename
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function titleFromFilename(filename) {
    return filename
      .replace(/\.[^.]+$/, "")
      .replace(/[_\-]+/g, " ")
      .replace(/\s*\(.*?\)\s*/g, " ") // strip (USA), (1982) etc.
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const TWO_PLAYER_HINTS = [
    "raiders", "combat", "warlords", "tron", "surround",
    "video olympics", "outlaw", "boxing", "space war",
  ];

  // ---------- recursive scan ----------
  async function scanDir(dirHandle, path = "") {
    for await (const [name, handle] of dirHandle.entries()) {
      const fullPath = path ? `${path}/${name}` : name;
      if (handle.kind === "directory") {
        await scanDir(handle, fullPath);
      } else {
        const lower = name.toLowerCase();
        const isBios = ["exec.bin", "grom.bin", "coleco.rom", "colecovision.rom"].includes(lower);
        if (isBios) {
          biosHandles[lower] = handle;
          continue;
        }
        const system = guessSystem(fullPath, name);
        if (!system) continue; // skip files we can't confidently categorize

        const id = normalizeId(name);
        const override = GAMES.find((g) => g.id === id);
        const players =
          override?.players ??
          (TWO_PLAYER_HINTS.some((h) => id.includes(h.replace(/\s+/g, "-"))) ? 2 : 1);

        libraryGames.push({
          id,
          title: override?.title || titleFromFilename(name),
          system,
          players,
          fileHandle: handle,
          note: override?.note,
        });
      }
    }
  }

  // ---------- public API ----------
  async function connect() {
    const dirHandle = await window.showDirectoryPicker({ mode: "read" });
    await idbSet(HANDLE_KEY, dirHandle);
    await loadFrom(dirHandle);
  }

  async function loadFrom(dirHandle) {
    libraryGames = [];
    biosHandles = {};
    await scanDir(dirHandle);
    connected = true;
  }

  // Try to silently reconnect using the remembered handle. Returns
  // "connected", "needs-permission", or "none".
  async function tryReconnect() {
    const handle = await idbGet(HANDLE_KEY);
    if (!handle) return "none";
    const perm = await handle.queryPermission({ mode: "read" });
    if (perm === "granted") {
      await loadFrom(handle);
      return "connected";
    }
    return "needs-permission"; // must be re-granted via a user click
  }

  // Call this from a click handler - requestPermission needs a user gesture
  async function reconnectWithPermission() {
    const handle = await idbGet(HANDLE_KEY);
    if (!handle) throw new Error("No remembered folder - use connect() instead.");
    const perm = await handle.requestPermission({ mode: "read" });
    if (perm !== "granted") return false;
    await loadFrom(handle);
    return true;
  }

  function isConnected() {
    return connected;
  }

  function getGames() {
    return libraryGames;
  }

  async function getBlobUrl(game) {
    const file = await game.fileHandle.getFile();
    return URL.createObjectURL(file);
  }

  async function getBiosBlobUrl(system) {
    const need = SYSTEMS[system]?.requiresBios;
    if (!need) return null;
    const handle = biosHandles[need[0].toLowerCase()];
    if (!handle) return null;
    const file = await handle.getFile();
    return URL.createObjectURL(file);
  }

  function hasBios(system) {
    const need = SYSTEMS[system]?.requiresBios;
    if (!need) return true;
    return need.every((f) => biosHandles[f.toLowerCase()]);
  }

  return {
    connect, tryReconnect, reconnectWithPermission,
    isConnected, getGames, getBlobUrl, getBiosBlobUrl, hasBios,
  };
})();
ROMLIBEOF
