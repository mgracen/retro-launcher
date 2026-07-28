/*
  BOX ART
  ------------------------------------------------------------
  Pulls real cover art from libretro-thumbnails, an open
  community art library, served via jsDelivr's CDN.

  The hard part isn't the art - it's knowing the exact "official"
  title a ROM filename corresponds to. This fetches the real
  canonical title list each system's ROM set is built from (the
  same no-intro reference libretro itself uses), then fuzzy-
  matches your actual game titles against it. That handles messy
  filenames much better than guessing region-tag suffixes blindly.

  Best-effort throughout: anything that doesn't find a confident
  match just keeps the plain colored tile - nothing breaks.
*/

const BoxArt = (() => {
  // Manual overrides: fill in "game-id": "https://image-url.png" for
  // any title that isn't auto-matching well. To find a game's id,
  // open the browser console (Ctrl+Shift+J) on the game grid and run:
  //   getAllGames().find(g => g.title === "Exact Title Shown").id
  // For the image URL: right-click any image online and "Copy image
  // address" works fine, or use a link from libretro-thumbnails
  // directly if you find the right file by browsing its GitHub repo.
  const ART_OVERRIDES = {
    // "dig-dug": "https://example.com/dig-dug-box.png",
  };

  const ART_FOLDER = {
    atari2600: "Atari_-_2600",
    intellivision: "Mattel_-_Intellivision",
    colecovision: "Coleco_-_ColecoVision",
  };
  const DAT_FILE = {
    atari2600: "Atari - 2600.dat",
    intellivision: "Mattel - Intellivision.dat",
    colecovision: "Coleco - ColecoVision.dat",
  };
  const REGION_SUFFIXES = [" (USA)", " (World)", " (Europe)", " (USA, Europe)", ""];

  const canonicalListCache = {}; // system -> [official base titles]
  const urlCache = {};           // gameId -> url | null

  function normalize(s) {
    return s
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/\(.*?\)/g, "")
      .replace(/[^a-z0-9]+/g, "")
      .trim();
  }

  function wordOverlapScore(a, b) {
    const wa = new Set(a.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    const wb = new Set(b.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
    if (!wa.size || !wb.size) return 0;
    let shared = 0;
    wa.forEach((w) => { if (wb.has(w)) shared++; });
    return shared / Math.max(wa.size, wb.size);
  }

  async function loadCanonicalList(system) {
    if (canonicalListCache[system]) return canonicalListCache[system];
    const cacheKey = `boxart-canon-v1-${system}`;
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      try {
        canonicalListCache[system] = JSON.parse(stored);
        return canonicalListCache[system];
      } catch { /* fall through and refetch */ }
    }
    const datFile = DAT_FILE[system];
    if (!datFile) return [];
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/libretro/libretro-database/master/metadat/no-intro/${encodeURIComponent(datFile)}`
      );
      const text = await res.text();
      const titles = new Set();
      const re = /name\s+"([^"]+)"/g;
      let m;
      while ((m = re.exec(text))) {
        const base = m[1]
          .replace(/\.[a-z0-9]+$/i, "")   // strip extension
          .replace(/\s*\([^)]*\)/g, "")   // strip all (region/flag) groups
          .trim();
        if (base) titles.add(base);
      }
      const list = Array.from(titles);
      canonicalListCache[system] = list;
      localStorage.setItem(cacheKey, JSON.stringify(list));
      return list;
    } catch (e) {
      console.warn("Canonical title list fetch failed for", system, e);
      canonicalListCache[system] = [];
      return [];
    }
  }

  function tryImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function findCanonicalTitle(game) {
    const list = await loadCanonicalList(game.system);
    if (!list.length) return null;
    const target = normalize(game.title);

    // 1. Exact normalized match
    let best = list.find((t) => normalize(t) === target);
    if (best) return best;

    // 2. Best fuzzy word-overlap match above a confidence threshold
    let bestScore = 0;
    for (const t of list) {
      const score = wordOverlapScore(t, game.title);
      if (score > bestScore) { bestScore = score; best = t; }
    }
    return bestScore >= 0.6 ? best : null;
  }

  async function getArtUrl(game) {
    if (urlCache[game.id] !== undefined) return urlCache[game.id];

    if (ART_OVERRIDES[game.id]) {
      urlCache[game.id] = ART_OVERRIDES[game.id];
      return urlCache[game.id];
    }

    const folder = ART_FOLDER[game.system];
    if (!folder) { urlCache[game.id] = null; return null; }

    const canonicalTitle = (await findCanonicalTitle(game)) || game.title;

    for (const suffix of REGION_SUFFIXES) {
      const filename = `${canonicalTitle}${suffix}.png`;
      const url = `https://cdn.jsdelivr.net/gh/libretro-thumbnails/${folder}@master/Named_Boxarts/${encodeURIComponent(filename)}`;
      if (await tryImage(url)) {
        urlCache[game.id] = url;
        return url;
      }
    }
    urlCache[game.id] = null;
    return null;
  }

  return { getArtUrl };
})();
