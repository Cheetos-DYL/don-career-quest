---
version: alpha
name: Don Lee — Charge Quest
description: "An original, playful EV-charging portfolio game: immersive driving-world discovery with a clear, readable interface."
colors:
  primary: "#071B20"
  secondary: "#15343A"
  tertiary: "#C7F27A"
  neutral: "#F1F4E8"
  muted: "#A5B7AE"
  border: "#36535A"
  sky: "#83D8D0"
  warm: "#FFB86B"
typography:
  display:
    fontFamily: system-ui
    fontSize: 3rem
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  heading:
    fontFamily: system-ui
    fontSize: 1.25rem
    fontWeight: 800
    lineHeight: 1.15
  body:
    fontFamily: system-ui
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: system-ui
    fontSize: 0.75rem
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: 8px
  md: 14px
  lg: 24px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 14px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.md}"
    padding: 14px
  panel:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.lg}"
    padding: 24px
  status-chip:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.sky}"
    rounded: "{rounded.sm}"
    padding: 8px
  secondary-copy:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: 8px
  milestone-chip:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.warm}"
    rounded: "{rounded.sm}"
    padding: 8px
  separator:
    backgroundColor: "{colors.border}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    height: 1px
---

## Overview

**Design read:** preserve the full-screen drive-to-discover pattern, compact HUD, map panel, and keyboard/touch controls. Use a first-person view down a straight, wide highway—not a loop—with rapid acceleration, lane steering, braking, and boost. Keep the 13 chronological life milestones as gates along the road. Settings edits the introduction and all chapter copy and adds/removes one photo per milestone; browser-local text and photo storage includes a restore-defaults action for text.

Reference: [Bruno Simon Folio 2025](https://github.com/brunosimon/folio-2025), with its full-screen driving world, exploration-first introduction, map, and interactive points. This version keeps the drive-to-discover idea and adapts it to a 13-stop life timeline; the code, copy, artwork, and interface here are original. The lighter Canvas 2D scene keeps the game phone-friendly without rebuilding the reference’s 3D renderer or physics system.

## Colors

- **Primary (#071B20):** deep ink-teal for the world and high-contrast interface.
- **Secondary (#15343A):** raised surfaces and roads; keeps the scene subdued.
- **Tertiary (#C7F27A):** charging/mission accent reserved for progress and primary actions.
- **Neutral (#F1F4E8):** readable text and vehicle highlights.
- **Muted (#A5B7AE):** secondary labels and contextual copy.
- **Sky (#83D8D0):** route/network details; **Warm (#FFB86B):** milestones and callouts.

## Typography

Use the system sans-serif stack so the game remains fast and works offline. Display text is heavy and tightly tracked; body copy stays comfortably spaced and legible. Uppercase labels are short and never carry essential instructions alone.

## Layout

The canvas is the primary surface and occupies the viewport. In driver POV, the straight road narrows toward a horizon and lane markings rush toward the lower edge; no third-person car sprite is drawn. A compact HUD holds identity, speed, and mission progress; story/settings panels stay scrollable. **Falsifiable test:** at 375px wide, the road, HUD, settings editor, and touch controls remain usable without horizontal scrolling.

## Elevation & Depth

Create speed with scrolling lane dashes, roadside markers, subtle high-speed streaks, and bold checkpoint gates. Avoid turns, loops, photographic scenery, and heavy post-processing; the scene uses original Canvas shapes.

## Shapes

Use rounded-but-not-pill panels (8–24px radii), crisp geometric roads, simple blocky charger/vehicle silhouettes, and small circular progress markers. Keep hit targets at least 44px.

## Components

- **Driving canvas:** first-person straight highway; W/↑ accelerates, S/↓ brakes, A/D or ←/→ steers, Shift boosts. Speed caps: 600 km/h normally, 950 km/h while boosting.
- **Mission HUD:** shows the next chronological chapter and route progress.
- **Story popup:** opens automatically when the car reaches the next timeline stop; story text reveals progressively. The map remains a direct-reading alternative.
- **Touch controls:** visible on narrow screens and large enough for thumb use.
- **Settings:** edit the introduction and all 13 chapters; upload/remove a photo per chapter. Persist text in localStorage and photos in IndexedDB; provide a reset to original copy.
- **Reduced motion:** respect `prefers-reduced-motion`; game movement remains user-controlled.

## Do's and Don'ts

- Do make the route and all interactions understandable without 3D or audio.
- Do provide a direct Explore button and a non-driving way to read every profile stop.
- Do use Don's known professional focus: EV charging partnerships, CPO/eMSP/OEM/map-navigation integrations, and emerging markets.
- Don't invent employers, personal contact details, achievements, or numerical impact.
- Don't copy Bruno Simon's code, logo, exact copy, color treatment, or assets.
- Don't block the portfolio behind a difficult game; provide accessible profile content and clear controls.