
# Living Room '82 — Retro Console Launcher

A browser-based library browser, ROM scanner, box-art fetcher, and
high-score tracker for Atari 2600, Intellivision, and ColecoVision —
built on [EmulatorJS](https://emulatorjs.org). Point it at your
existing ROM folder and it lists everything automatically, complete
with real cover art, no copying required.

## What's included

- **Library browsing** — scans your existing ROM folder (via the
  browser's File System Access API) and auto-sorts by system.
- **Automatic box art** — fetched from
  [libretro-thumbnails](https://github.com/libretro-thumbnails), an
  open, community-maintained art library. Matched by title,
  best-effort; games without a match just keep a plain tile.
- **High scores** — a running local top-10 per game.
- **Reliable keyboard controls, pinned explicitly** so they're
  identical on every computer, no setup required:
  - **Player 1:** Arrow keys = Move · X = Fire · Z = Button 2 ·
    Enter = Start/Reset · V = Select
  - **Player 2** (for 2-player games, same keyboard): I/J/K/L = Move ·
    N = Fire · M = Button 2 · P = Start/Reset · O = Select

## Why keyboard-only, no controller support

Bluetooth gamepad input inside the in-browser emulator was tested
extensively and found unreliable — this traces back to how
EmulatorJS's compiled (WebAssembly) core reads gamepad input
internally, not something fixable from this project's code. Keyboard
input is fully reliable across browsers and platforms, so that's the
supported path here. If you want controller-based play instead, load
the same ROM in [RetroArch](https://www.retroarch.com) (Android/
ChromeOS via Play Store, or desktop), which has mature, dedicated
Bluetooth controller support.


## 1. Legal note

Emulation is legal; the ROM files are copyrighted game data. Only load
ROMs you're entitled to (dumped from cartridges you own, or public
domain/homebrew titles). This project ships with **no ROMs included** —
you supply your own.

## 2. Add your games

### Option A — point at your existing library (recommended)

Click **Choose ROM Folder** in the app and select the top-level folder
where your ROMs already live. Nothing is copied or uploaded — the
browser just reads the files in place. The launcher scans it
recursively and lists everything it finds automatically, guessing:
- **System**: from a subfolder name containing "atari"/"2600",
  "intv"/"intellivision", or "coleco", or from the file extension
  (`.a26`, `.int`, `.col`) when there's no folder hint.
- **Title**: cleaned up from the filename.
- **Player count**: defaults to 1; a short built-in list auto-flags
  well-known 2-player titles (Combat, Raiders of the Lost Ark, TRON,
  Warlords, etc.) — anything it misses you can add to `js/games-db.js`
  under a matching `id` (see the comment at the top of that file).

The browser will ask you to re-confirm access each session (one
click) — that's a browser security requirement, not something this
app can skip.

### Option B — copy files into the project (manual, still supported)

1. Copy ROM files into the matching folder:
   - `roms/atari2600/` — `.a26` / `.bin`
   - `roms/intellivision/` — `.int` / `.bin`
   - `roms/colecovision/` — `.col` / `.rom`
2. Open `js/games-db.js` and add an entry per game — title, system,
   exact filename, and `players: 1` or `players: 2`.

### BIOS files required

Two of the three systems need their original system BIOS to run
*any* game — this is normal for these emulator cores, not specific
to this launcher:
- **Intellivision** (FreeIntv core): `exec.bin` and `grom.bin`
- **ColecoVision** (Gearcoleco core): `coleco.rom`

If you're using the folder picker, just make sure these files are
somewhere inside the folder you selected — the scanner finds them
automatically. If you're using the manual method, drop them in
`bios/`. Same ownership rule as game ROMs applies — these are the
console's original system firmware, not included here.

## 3. Run it locally

Browsers block loading local ROM files directly from `file://`, so
serve the folder over a tiny local web server. From inside the
`retro-launcher` folder:

```bash
# Python (already on most systems)
python3 -m http.server 8080
```

Then open `http://localhost:8080` in Chrome — on the Windows PC, or on
the Chromebook if you run the server on the PC and browse to it from
the Chromebook over your home network (`http://<PC-IP>:8080`), or run
the server directly on the Chromebook if it has Linux (Crostini)
enabled.

## 4. Pair a controller (PS5 DualSense or similar)

Hold **PS + Create** until the light bar flashes rapidly, then select
it from the OS Bluetooth menu (Windows Settings > Bluetooth, or
ChromeOS Settings > Bluetooth). Chrome only "sees" a gamepad after you
press a button on it once the page is open — that's a browser quirk,
not a bug in this app.

## 5. Two-controller games

Games flagged `players: 2` in `games-db.js` won't launch until a
second controller is detected — the launcher shows a live "connect a
2nd controller" prompt and auto-starts the moment it sees one. No
manual controller-slot configuration needed.

## 6. High scores

Stored locally per-browser (top 10 per game). Click **Enter Score**
during/after a play session. Scores currently live only on the device
you played on — ping me if you want the PC and Chromebook to share one
leaderboard, that just needs a small backend swapped into
`js/highscores.js`.

## What's next / not done yet

- Box art: cards currently just show a colored tile with the title.
  Drop images in `art/<system>/<id>.jpg` and wire them into
  `js/app.js`'s `.art` div when you're ready.
- Per-game control legends (which button does what) aren't shown yet —
  useful add for games with unusual layouts.
