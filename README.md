# Charge Quest — Don Lee

A small, self-contained life-timeline driving game inspired by the drive-to-discover approach in Bruno Simon’s Folio 2025. It follows 13 confirmed milestones from Don’s 1991 birth and childhood moves through Beijing, the United States, university, military service, Spain, France, Sweden, and his career at Mercedes-Benz, Tesla, TMAP Mobility, and JLR. Chapters open in order as the car reaches each stop; Paris and Stockholm remain relative to the events around them because exact years were not established.

## Test locally

From this directory, run:

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open `http://localhost:8080/` on this computer. For phone testing on the same Wi-Fi, open `http://<computer-LAN-IP>:8080/` (the server must remain running).

Controls: WASD or arrow keys on desktop; on-screen directional buttons on phones. The map offers a direct way to read every chapter.

The game is plain HTML, CSS, Canvas 2D, and JavaScript; there is no build step or backend.
