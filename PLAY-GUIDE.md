# Play Guide - Living Room '82

Keep this open on your phone or a second tab while playing.

## Every time you want to play

1. Open Terminal.
2. `cd retro-launcher`
3. `python3 -m http.server 8080`
4. Wait for "Serving HTTP on 0.0.0.0 port 8080..." then leave this
   window alone. Don't press Ctrl+C, don't close it.
5. Open Chrome, go to `http://localhost:8080`
6. If the game count shows 0, click "Choose ROM Folder" and
   re-select your ROMs folder (this permission resets each session,
   that's normal, not a bug).
7. Click a game and play. When done, closing the Terminal window
   stops the server.

## Controls

Arrow keys = Move, X = Fire, Z = Button 2, Enter = Start/Reset,
V = Select

## Troubleshooting

| Symptom | Fix |
|---|---|
| Chrome says "localhost refused to connect" | Check Terminal, did the server stop? Re-run `python3 -m http.server 8080`. Also check Settings, Linux, Port forwarding still has 8080 toggled on. |
| Library shows 0 games | Click "Choose ROM Folder" again and re-select your ROMs folder. |
| Game screen frozen, garbled audio | Open the console (Ctrl+Shift+J), type `localStorage.clear()`, press Enter, then hard refresh (Ctrl+Shift+R). |
| Need to paste something into Terminal | Regular Ctrl+V often doesn't work, use right-click, Paste, or Ctrl+Shift+V. |
| Box art missing for some games | Normal for some titles, matching is best-effort against real filenames. Games still play fine either way. |
