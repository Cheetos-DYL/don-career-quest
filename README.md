# Charge Quest — Don Lee

A self-contained life-timeline driving game with a first-person view down a straight highway, fast scrolling road markings, steering and boost, reaching 950 km/h. It has 13 chronological story checkpoints. Settings lets you edit the introduction and every chapter, add a photo to each milestone, or restore the original text. Text and photos stay in that browser (text in localStorage, photos in IndexedDB); photos are limited to 8 MB each.

## Test locally

From this directory, run:

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open `http://localhost:8080/` on this computer. For phone testing on the same Wi-Fi, open `http://<computer-LAN-IP>:8080/` (the server must remain running).

Controls: W/↑ accelerate, S/↓ brake, A/D or ←/→ steer, Shift boosts. Touch controls are available on phones. The map offers a direct way to read every chapter; Settings edits the story text.

The game is plain HTML, CSS, Canvas 2D, and JavaScript; there is no build step or backend.