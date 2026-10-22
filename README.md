# Don Lee — My Story

A light 3D driving timeline: drive down the road and each stone brings up a stop
from Don Lee's life, from Korea and Beijing to EV charging across 70 markets.

Live: https://cheetos-dyl.github.io/don-career-quest/

## What this is

A focused slice inspired by the career corridor of [Bruno Simon's folio-2025](https://github.com/brunosimon/folio-2025)
(MIT) — stone slabs that rise as you pass, and a year counter that ticks as you drive.
Everything else from that world was cut for speed: the whole site is a ~130 KB gzip
bundle with no backend, no audio, and no large assets.

- **13 stops** — drive to each stone (or use the Stops list) to read the story and see the photo.
- **Editor** — the Edit panel changes intro/stops text and photos. Edits save to your browser
  instantly; paste a GitHub token (fine-grained, this repo, Contents: read/write) and press
  **Publish to site** to push `content.json` to the repo — every visitor sees it after the
  next deploy (about a minute).

## Develop

```bash
npm install
npm run dev
npm run build   # outputs dist/
```

Content lives in `public/content.json` (also the publish target).

## Credits

- Timeline-stone concept adapted from Bruno Simon's folio-2025 (MIT license).
- Built with Three.js.
