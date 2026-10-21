# Charge Quest — Don Lee

A small, self-contained career-timeline driving game. Follow the route from Mercedes-Benz to Tesla, TMAP Mobility, and JLR; each chapter opens automatically when you reach its stop.

## Test locally

From this directory, run:

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open `http://localhost:8080/` on this computer. For phone testing on the same Wi-Fi, open `http://<computer-LAN-IP>:8080/` (the server must remain running).

Controls: WASD or arrow keys on desktop; on-screen directional buttons on phones. The map offers a direct way to read every chapter.

The game is plain HTML, CSS, Canvas 2D, and JavaScript; there is no build step or backend.
