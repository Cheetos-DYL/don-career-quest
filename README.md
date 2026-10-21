# Don Lee — My Story

A drivable 3D life story: drive a little car around a low-poly world and discover
13 stops from Don Lee's life, from Korea and Beijing to EV charging across 70 markets.

Live: https://cheetos-dyl.github.io/don-career-quest/

## What this is

Built on [Bruno Simon's folio-2025](https://github.com/brunosimon/folio-2025) (MIT license —
see `license.md`). The world, physics, audio and UI are his open-source portfolio engine;
the content (story stops, career labels, projects, socials) is Don Lee's.

- **Story stops** — interactive markers near the landing area open each life chapter (text + photo).
  The full list is in the map menu (M key) under the story tab.
- **Career corridor** — drive through the year counter (2010 →) past the Mercedes-Benz, Tesla,
  TMAP Mobility and JLR stones.
- **Editor** — the menu's edit tab edits intro text and every stop (text + photo).
  Edits save to the content API so every visitor sees them; without the API they stay in the browser.

## Develop

```bash
npm install --force
npm run dev        # local dev server
npm run build      # production build into dist/
```

Optional env (`.env`):

```
VITE_CONTENT_API=https://<content-api-host>   # server-side content sync
```

## Content API

`content-api/` is a tiny Express service that stores the editable content (single JSON
document, photos as data URLs). Deploy it with `render.yaml` (Render Blueprint), then set
`VITE_CONTENT_API` in `.env` (and in `.github/workflows/pages.yml` for the deployed build).

- `GET /api/content` — public read
- `POST /api/content` — write, `Authorization: Bearer <EDIT_TOKEN>`

## Credits

- World, engine and code: [Bruno Simon — folio-2025](https://github.com/brunosimon/folio-2025), MIT license.
- Music: Kounine, CC0 license (see `static/sounds/musics/license.md`).
- Fonts: Amatic SC & Nunito (Google Fonts), Pally.
- Physics: Rapier. Rendering: Three.js (TSL, WebGL/WebGPU). Audio: Howler.js.
