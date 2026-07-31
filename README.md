<img width="1112" height="571" alt="Screenshot 2026-07-31 6 52 23 PM" src="https://github.com/user-attachments/assets/3812e103-1b14-4fde-b86c-aefd7e257462" />


# Living Room '82 - Retro Console Launcher

A browser-based library browser, ROM scanner, box-art fetcher, and
high-score tracker for Atari 2600, built on
[EmulatorJS](https://emulatorjs.org). Point it at your existing ROM
folder and it lists everything automatically, complete with real
cover art, no copying required.

Get it at: https://github.com/mgracen/retro-launcher/

## What's included

- **Library browsing** - scans your existing ROM folder (via the
  browser's File System Access API) and auto-sorts by system.
  Nothing is copied or uploaded; the browser just reads the files
  in place.
- **Automatic box art** - your game titles are fuzzy-matched against
  the real no-intro reference title list, then fetched from
  [libretro-thumbnails](https://github.com/libretro-thumbnails), an
  open, community-maintained art library. Best-effort: titles that
  don't find a confident match just keep a plain colored tile.
- **High scores** - a running local top-10 per game, saved in the
  browser and updated every time you enter a new score.
- **Reliable keyboard controls, pinned explicitly** so they're the
  same on every computer, no setup required:
  Arrow keys = Move, X = Fire, Z = Button 2, Enter = Start/Reset,
  V = Select.

## Why keyboard-only, no controller support

Bluetooth gamepad input inside the in-browser emulator was tested
extensively and found unreliable - this traces back to how
EmulatorJS's compiled (WebAssembly) core reads gamepad input
internally, not something fixable from this project's code. Keyboard
input is fully reliable across browsers and platforms, so that's the
supported path here. If you want controller-based play instead, load
the same ROM in [RetroArch](https://www.retroarch.com), which has
mature, dedicated Bluetooth controller support.

## Legal note

Emulation is legal; the ROM files are copyrighted game data. Only
load ROMs you're entitled to (dumped from cartridges you own, or
public domain/homebrew titles). This project ships with no ROMs
included; you supply your own.

## How to use it

1. Serve the folder locally (browsers block loading ROM files
   directly from `file://`):
   ```
   python3 -m http.server 8080
   ```
   Then open `http://localhost:8080`.
2. Click **Choose ROM Folder** and select the folder where your
   Atari ROMs live. The scanner finds them recursively and lists
   everything automatically.
3. Click a game to play. Enter Score after a session to log a high
   score.

The browser will ask you to re-confirm folder access each new
session (one click) - that's a browser security requirement, not
something this app can skip.

## Intellivision and ColecoVision (optional, hidden by default)

Support for both is built into the code but hidden from the tab bar
by default, since both require their original console BIOS file to
run *any* game, and this project doesn't provide those:

- **Intellivision** (FreeIntv core): `exec.bin` and `grom.bin`
- **ColecoVision** (Gearcoleco core): `coleco.rom`

If you have those files legitimately (e.g. dumped from your own
hardware) and want these systems back: drop the BIOS files anywhere
inside your ROM folder, then in `js/app.js` change
`VISIBLE_SYSTEMS = ["atari2600"]` to also include `"intellivision"`
and/or `"colecovision"`.

## Credits

Built on [EmulatorJS](https://emulatorjs.org). Box art from
[libretro-thumbnails](https://github.com/libretro-thumbnails). Title
matching data from
[libretro-database](https://github.com/libretro/libretro-database).
Art and data delivery via [jsDelivr](https://www.jsdelivr.com).
