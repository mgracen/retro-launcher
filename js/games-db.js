
/*
  GAMES DATABASE
  ------------------------------------------------------------
  As of the folder-picker update, you normally DON'T need to
  edit this file anymore — click "Choose ROM Folder" in the app
  and point it at your existing ROM library; games are found
  and listed automatically (see js/rom-library.js).

  This file now serves two purposes:
  1. SYSTEMS config below — core IDs, BIOS requirements, colors.
     Still required, don't remove.
  2. GAMES array — optional manual overrides. If a scanned
     filename normalizes to match an `id` here, its `title` and
     `players` are used instead of the auto-guessed values. Also
     still used as a fallback list if you never connect a folder
     and instead copy files into roms/<system>/ by hand (old
     workflow, still supported).

  `players`: 1 or 2 — 2 means "requires two controllers to be
  useful" (e.g. head-to-head or co-op games). The launcher will
  prompt to connect a second controller before starting these.

  `core`: the EmulatorJS core id for the system. Don't change
  unless you know what you're doing:
    atari2600     -> "stella2014"
    intellivision -> "freeintv"
    colecovision  -> "gearcoleco"
*/

const SYSTEMS = {
  atari2600: {
    label: "Atari 2600",
    core: "stella2014",
    romPath: "roms/atari2600/",
    badgeColor: "#d94f2b",
  },
  intellivision: {
    label: "Intellivision",
    core: "freeintv",
    romPath: "roms/intellivision/",
    badgeColor: "#c9a227",
    // FreeIntv needs these two BIOS files in bios/ to run ANY game
    requiresBios: ["exec.bin", "grom.bin"],
  },
  colecovision: {
    label: "ColecoVision",
    core: "gearcoleco",
    romPath: "roms/colecovision/",
    badgeColor: "#c0272d",
    // Gearcoleco needs the ColecoVision system BIOS to run ANY game
    requiresBios: ["coleco.rom"],
  },
};

const GAMES = [
  // ---- Atari 2600 ----
  {
    id: "raiders-lost-ark",
    title: "Raiders of the Lost Ark",
    system: "atari2600",
    file: "raiders-lost-ark.a26",
    players: 2,
    note: "Two-player co-op puzzle adventure — needs both joysticks.",
  },
  {
    id: "combat",
    title: "Combat",
    system: "atari2600",
    file: "combat.a26",
    players: 2,
    note: "Classic tank/plane vs. vs. — built for two controllers.",
  },
  {
    id: "pitfall",
    title: "Pitfall!",
    system: "atari2600",
    file: "pitfall.a26",
    players: 1,
  },

  // ---- Intellivision ----
  {
    id: "tron-deadly-discs",
    title: "TRON: Deadly Discs",
    system: "intellivision",
    file: "tron-deadly-discs.int",
    players: 2,
    note: "Versus mode needs a second controller.",
  },
  {
    id: "astrosmash",
    title: "Astrosmash",
    system: "intellivision",
    file: "astrosmash.int",
    players: 1,
  },

  // ---- ColecoVision ----
  {
    id: "donkey-kong",
    title: "Donkey Kong",
    system: "colecovision",
    file: "donkey-kong.col",
    players: 1,
  },
  {
    id: "venture",
    title: "Venture",
    system: "colecovision",
    file: "venture.col",
    players: 1,
  },
];
