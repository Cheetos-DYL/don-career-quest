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

**Design read:** turn the same 13-stop life timeline into a long, wide, dead-straight highway. Keep the drive-to-discover story popups, but replace the tiny isometric track with a fast perspective road, visible lane markings, checkpoint gantries, scenery, a clearer car, speedometer, steering, throttle, brake, and boost. Keep it self-contained in Canvas 2D; no copied assets or full 3D engine.

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

The canvas is the primary surface and occupies the viewport. A compact top HUD holds identity and milestone progress; the speedometer and mission panel stay readable over the broad road, and touch controls sit at the lower edge. Keep interface copy brief so it does not obscure the checkpoint. **Falsifiable test:** at 375px wide, the car, full-width road, HUD, mission panel, and all five touch controls remain inside the viewport without horizontal scrolling or blocking checkpoint text.

## Elevation & Depth

Create a clear perspective: distant horizon, layered hills, broad three-lane asphalt road, solid edge lines, animated dashed lane markers, roadside trees and reflective posts, and a numbered gantry for the next milestone. Use a fixed rear-view car whose position moves between lanes while the road scrolls beneath it. The track stays straight; only depth and speed animate.

## Shapes

Use a wide straight perspective road, crisp lane markings, simple checkpoint gantries, roadside silhouettes, and an original rear-view EV shape. Keep hit targets at least 44px.

## Components

- **Driving canvas:** long straight perspective highway; W/↑ accelerates, A/D or ←/→ steers, S/↓ brakes, Shift boosts.
- **Mission HUD:** speedometer plus next milestone and visited progress.
- **Checkpoint gate:** draws the next stop ahead; passing it opens the story popup in order.
- **Touch controls:** accelerate, brake, steer and boost buttons on phones.
- **Reduced motion:** respect `prefers-reduced-motion`; game movement remains user-controlled.

## Do's and Don'ts

- Do make the route and all interactions understandable without 3D or audio.
- Do provide a direct Explore button and a non-driving way to read every profile stop.
- Do use Don's known professional focus: EV charging partnerships, CPO/eMSP/OEM/map-navigation integrations, and emerging markets.
- Don't invent employers, personal contact details, achievements, or numerical impact.
- Don't copy Bruno Simon's code, logo, exact copy, color treatment, or assets.
- Don't block the portfolio behind a difficult game; provide accessible profile content and clear controls.