# Charge Quest — Don Lee

A small, self-contained career-timeline driving game based on a drive-to-discover portfolio pattern. Follow Don’s career from Mercedes-Benz (2016–2020) through Tesla (2020–2021), TMAP Mobility (2021–2023), and JLR (2023–present). Each chapter opens automatically when you reach its stop; the copy keeps the moves personal and conversational rather than turning them into a list of achievements.

## Test locally

From this directory, run:

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open `http://localhost:8080/` on this computer. For phone testing on the same Wi-Fi, open `http://<computer-LAN-IP>:8080/` (the server must remain running).

Controls: WASD or arrow keys on desktop; on-screen directional buttons on phones. The map offers a direct way to read every chapter.

The game is plain HTML, CSS, Canvas 2D, and JavaScript; there is no build step or backend.
