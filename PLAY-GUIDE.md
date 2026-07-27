
# Play Guide — Living Room '82

Keep this open on your phone or a second tab while playing. Covers
every-session startup plus fixes for everything we hit while getting
this running.

## Every time you want to play

1. Open **Terminal**.
2. `cd retro-launcher`
3. `python3 -m http.server 8080`
4. Wait for "Serving HTTP on 0.0.0.0 port 8080..." — then **leave this
   window alone**. Don't press Ctrl+C, don't close it.
5. Open Chrome → `http://localhost:8080`
6. If the game count shows 0, click **"Choose ROM Folder"** and
   re-select your ROMs folder (this permission resets each session —
   normal, not a bug).
7. Pair or reconnect your DualSense (see below).
8. Play. When done, closing the Terminal window stops the server.

## Reconnecting the DualSense

**First-time pairing (or after using it with the PS5 since):**
1. Hold **PS + one action button** (Triangle/Circle/Cross/Square, any
   one) for 5+ seconds until the light bar flashes **twice**, pauses,
   repeats.
2. Settings → Bluetooth → select **"Wireless Controller"** → Connect.

**Already paired, just reconnecting:**
- Press the **PS button once** (single press) to wake it and
  reconnect to whatever it was last paired to.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Chrome says `localhost refused to connect` | Check Terminal — did the server stop? Re-run `python3 -m http.server 8080`. Also check Settings → Linux → Port forwarding still has 8080 toggled on. |
| Library shows 0 games | Click "Choose ROM Folder" again and re-select your ROMs folder. |
| Every game says "connect a controller," even though DualSense is paired | Go to Settings → Bluetooth — does it say Connected? If not, press PS once to reconnect. If it says Connected but the game still won't clear, the Bluetooth link has gone stale — power-cycle it (hold PS ~10 sec until light goes off, press PS once to turn back on) while sitting on the game grid. |
| Controller works on the grid, but does nothing once a game loads | Hover the very top edge of the game screen → click the **gamepad icon** → Control Settings. Check **"Connected Gamepad"** at the top of that panel — if it says "Not Connected," power-cycle the DualSense (PS off ~10 sec, PS on) while this panel is open. It should pick up the name instantly. |
| Game loaded but won't start | Atari 2600 games use **Reset**, not "Start" — press **Options** (the ≡ icon, right of the touchpad) to reset/start the game. Select/variations is the **Create** button (left of touchpad). |
| Intellivision or ColecoVision game won't load / errors about missing files | Those two systems need extra BIOS files sitting somewhere in your ROM folder: `exec.bin` + `grom.bin` (Intellivision), `coleco.rom` (ColecoVision). Atari needs nothing extra. |
| Need to paste something into Terminal | Regular Ctrl+V often doesn't work — use **right-click → Paste** or **Ctrl+Shift+V**. |

## Quick reference: DualSense buttons

- **Create** (left of touchpad, two-rectangle icon) → Select
- **Options** (right of touchpad, ≡ icon) → Start / Reset
- **PS button** (center, round) → power on/off, wake for reconnect
