# Charge Quest — Don Lee

A self-contained life-timeline driving game rendered in WebGL: a third-person chase camera follows a car on a straight, endless road. Steer left/right, accelerate, brake, and boost to 1,000 km/h; 13 chronological story checkpoints interrupt the run. Settings edits the introduction and every chapter and attaches photos to milestones. Text and photos stay in that browser (localStorage and IndexedDB); photos are limited to 8 MB each.

## Test locally

From this directory, run:

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open `http://localhost:8080/` on this computer. For phone testing on the same Wi-Fi, open `http://<computer-LAN-IP>:8080/` (the server must remain running).

Controls: W/↑ accelerate, S/↓ brake, A/D or ←/→ steer, Shift boosts. Touch controls are available on phones. The map offers a direct way to read every chapter; Settings edits the story text.

The game uses plain HTML, CSS, native WebGL, and JavaScript; it has no build step or backend.