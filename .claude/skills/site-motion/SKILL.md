---
name: site-motion
description: Use before adding or changing any animation, transition, hover state or scroll effect on Ify's portfolio (ify-not-iffy). It is the index for this project's motion rules: which engine to use, the shared timing values, and which installed motion skill to consult for which kind of work.
---

# Site motion: index and house rules

This project keeps its motion knowledge in `.claude/skills/`. Start here, then open the specific skill for the job. The rules are carried over from the Nnamdi Akajiobi site and adapted to this stack (Astro, plain CSS, no framework).

## Engine

- **CSS keyframes and transitions** for load-in, hover, focus and state changes (docked nav, hedges).
- **Web Animations API** (`element.animate()`) in small vanilla scripts for anything replayable on input: the logo spin (`src/scripts/hero-intro.ts`) and the polaroid pop (`src/scripts/polaroid.ts`).
- Do not add GSAP, Motion/React, Lenis, Lottie or Three.js without asking the owner.

## Shared values (`tokens/tokens.json` → `src/styles/tokens.css`)

- `--motion-ease-enter` `cubic-bezier(0.16, 1, 0.3, 1)` for anything entering; `--motion-ease-fade` `cubic-bezier(0.33, 0, 0.2, 1)` for opacity.
- `--motion-ease-spin` `cubic-bezier(0.3, 0, 0.1, 1)`: short ease-in, long settle. Used by the logo.
- Durations: `--motion-duration-reveal` 900ms (text lines), `--motion-duration-spin` 2000ms, `--motion-duration-pop` 720ms, plus `fast/base/slow/flap/hedge`.

## Hero load-in (home only)

`BaseLayout intro` adds `html.intro-wait` before paint (motion allowed only). `hero-intro.ts` waits for the fonts and the polaroid (capped at 1.8s), then swaps to `html.intro-play`:

1. Logo pops in (500ms) and spins one turn over 2s on `--motion-ease-spin`.
2. The three headline lines rise from a bottom-edge mask with a blur-to-sharp, 900ms, starting 150 / 240 / 330ms.
3. CTAs at 650ms, hedges from 700ms (45ms apart), polaroid at 1000ms, flaps from 1050ms (70ms apart).

A 3s inline timeout always removes `intro-wait`, so the page can never stay hidden.

## Interactions

- **Logo** (hero and docked): hover (fine pointer) or tap replays one 1.6s spin; a running spin is never restarted. The petals' hub is at (32, 33.22) of the 64 box, so the SVG spins with `transform-origin: 50% 51.9%`. Spinning around the box middle makes it bob.
- **Polaroid** (`Polaroid.astro`, any photo in `src/assets/polaroids/`): hover (fine pointer) scales the card to 1.1. Click or tap pops it to 1.2 and back (720ms, enter ease up, in-out down; the peak is divided by the hover scale so it never reaches 1.32) while a white sheen sweeps across once (`::before`, 760ms). Only the visible card takes the pointer, not the PNG's transparent margin. The Figma frames crop the middle ~65% of each PNG, so a Figma rect of 85x96 means a 131.8x148 PNG box.
- **Hedges**: tap shakes the bush and rustles its neighbours. Footer hedges pop up out of the bottom edge once, the first time the footer is 35% visible: middle bush first, 70ms apart, 820ms, rising to −4% then settling (the one place a small overshoot is allowed).
- **Flap nav** (`FlapNav.astro`, Figma component sets 4031:2832 / 4029:2506 / 4031:3203):
  - The slot is a zero-height `position: sticky; top: 0` line right under the hero. Hero flaps stand on it; docked flaps hang from it.
  - Docking is a hinge. Each flap is a two-sided card that rotates `rotate: x 180deg` around the line (760ms, `cubic-bezier(0.55,0,0.15,1)`, Work → About 80ms apart; undocking runs About → Work). The row slides right by `--dock-shift` at the same time, and the 48px logo fades in at the bar's left. It triggers when the line rises into the top 30% of the screen (48px hysteresis).
  - Hover: the shape stretches from 66 to 80 (`scale: 1 80/66`) away from the line, and the label moves 7 with it. Hero flaps grow up, docked flaps grow down. 240ms enter ease.
  - Press: Pressed colour, 80 tall, `scale: 0.96`. Release springs back (`cubic-bezier(0.34,1.4,0.64,1)`); the page navigates 220ms after release.
  - Once stuck, a scroll-edge band (page colour gradient plus three masked `backdrop-filter` layers, 1/3/8px) softens content sliding under the bar. There is no plate behind the flaps.

## House rules

- Animate `transform` and `opacity` only (the line blur is the one exception, and it ends at `filter: none`). No permanent `will-change`.
- No overshoot or bounce: calm and premium.
- Reduced motion: no intro and no spin; the polaroid keeps its sheen but does not scale; flaps swap faces instantly with no hinge or press scale; footer hedges are simply there.
- Sizes follow the Figma frames in section "WORK" (`4033:3766`) and the component sheet (`4031:3204`). Hedges scale from `--hedge-base` (720px reference). Flaps size from `--flap-unit` (240px, shrinking so logo + three flaps fit `--dock-bar`) and `--flap-h` (66px, never below 48px).
- Tokens come from the Figma variables. Re-sync `tokens/tokens.json` when they change, then run `npm run tokens`.

## Which skill for what

| Task | Skill |
|---|---|
| Text reveals, splitting by letter/word/line, masks | `kinetic-typography` |
| Choosing durations, easing, stagger, sequencing | `animation-principles` |
| Deciding what deserves motion and how much | `motion-art-direction` |
| Hover, press, focus, input feedback | `micro-interaction` |
| Jank, layout thrash, compositing problems | `60fps-animation` |
| Reduced-motion and accessibility | `accessible-animation` |
| Animating SVG (hedges, logo) | `svg-animation` |

The third-party skills end with a "Deliver & verify (standalone HTML)" section. Ignore it here: work in the Astro app and verify in `npm run dev`.
