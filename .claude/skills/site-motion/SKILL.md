---
name: site-motion
description: Use before adding or changing any animation, transition, hover state or scroll effect on Ify's portfolio (ify-not-iffy). It is the index for this project's motion rules: which engine to use, the shared timing values, and which installed motion skill to consult for which kind of work.
---

# Site motion: index and house rules

This project keeps its motion knowledge in `.claude/skills/`. Start here, then open the specific skill for the job. The rules are carried over from the Nnamdi Akajiobi site and adapted to this stack (Astro, plain CSS, no framework).

## Engine

- **CSS keyframes and transitions** for load-in, hover, focus and state changes (docked nav, hedges).
- **Web Animations API** (`element.animate()`) in small vanilla scripts for anything replayable on input: the logo spin and the polaroid pop (`src/scripts/hero-intro.ts`).
- Do not add GSAP, Motion/React, Lenis, Lottie or Three.js without asking the owner.

## Shared values (`tokens/tokens.json` → `src/styles/tokens.css`)

- `--motion-ease-enter` `cubic-bezier(0.16, 1, 0.3, 1)` for anything entering; `--motion-ease-fade` `cubic-bezier(0.33, 0, 0.2, 1)` for opacity.
- `--motion-ease-spin` `cubic-bezier(0.3, 0, 0.1, 1)`: short ease-in, long settle. Used by the logo.
- Durations: `--motion-duration-reveal` 900ms (text lines), `--motion-duration-spin` 2000ms, `--motion-duration-pop` 720ms, plus `fast/base/slow/flap/hedge`.

## Hero load-in (home only)

`BaseLayout intro` adds `html.intro-wait` before paint (motion allowed only). `hero-intro.ts` waits for the fonts and the polaroid (capped at 1.8s), then swaps to `html.intro-play`:

1. Logo pops in (500ms) and spins one turn over 2s on `--motion-ease-spin`.
2. The three headline lines rise from a bottom-edge mask with a blur-to-sharp, 900ms, starting 150 / 240 / 330ms.
3. CTAs at 650ms, hedges from 700ms (45ms apart), polaroid at 1000ms, flaps at 1050ms.

A 3s inline timeout always removes `intro-wait`, so the page can never stay hidden.

## Interactions

- **Logo**: hover (fine pointer) or tap replays one 1.6s spin; a running spin is never restarted.
- **Polaroid**: click/tap scales the card 1 → 1.2 → 1 (720ms, enter ease up, in-out down) while a white sheen sweeps across once (`::before`, 760ms). Its position is measured at runtime from the end of the headline's first line.
- **Hedges**: tap shakes the bush and rustles its neighbours.
- **Flap nav**: the slot is `position: sticky`; an IntersectionObserver on the hero's bottom sentinel flips `data-docked`. Docking only cross-fades shapes, fades the plate and slides labels 7/80 of the flap height. Nothing changes `position`, so there is no jump.

## House rules

- Animate `transform` and `opacity` only (the line blur is the one exception, and it ends at `filter: none`). No permanent `will-change`.
- No overshoot or bounce: calm and premium.
- Reduced motion: no intro and no spin; the polaroid keeps its sheen but does not scale; flaps fade without sliding.
- Sizes follow the Figma frames in section "Main Pages" (`4026:1139`). Hedges and flaps scale from `--flap-w` (the 720px nav), so their relationship matches the frame at every width.

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
