---
name: site-motion
description: Use before adding or changing any animation, transition, hover state or scroll effect on the Nnamdi Akajiobi site. It is the index for this project's motion rules: which engine to use, the shared timing values, and which installed motion skill to consult for which kind of work.
---

# Site motion: index and house rules

This project keeps its motion knowledge in `.claude/skills/`. Start here, then open the specific skill for the job.

## Engine

- **Motion** (`motion`, imported from `motion/react` and `motion/react-m`) drives load-in and scroll-triggered animation.
- Features are lazy-loaded: use `m.*` components from `motion/react-m`, never `motion.*`. `src/components/Providers.tsx` supplies `LazyMotion` (strict) and `MotionConfig reducedMotion="user"`.
- **Plain CSS** stays for hover, focus and press states, the fixed nav's scroll state, and the horizontal rails (native scrolling with snap; do not replace with Motion drag).
- Do not add GSAP, Lenis, Lottie or Three.js without asking the owner.

## Shared values (`src/lib/motion.ts`)

- `EASE_ENTER` `[0.16, 1, 0.3, 1]` for anything entering; `EASE_FADE` `[0.33, 0, 0.2, 1]` for opacity.
- `revealVariants` + `revealTransition`: `rise`, `soft` (text), `scale` (photos, cards), `right` (section illustrations), `up` (footer house).
- `HERO`: the hero load-in timings. Layers enter one at a time: the man first (solid by 0.45s), then the banner behind him (from 0.3s, growing up from the bottom), then the name. The name reveals letter by letter on `EASE_LETTER`; each letter takes 0.335s and the next starts 15.4% into it, so a letter is 50% of the way into the frame when the next is 15% in, and the 14 letters take about 1.0s. This overlap rule is the owner's and overrides the "cap reveals near 800ms" guidance in `kinetic-typography`.

Use `<Reveal>` (`src/components/Reveal.tsx`) for scroll reveals rather than writing new observers. Sizes and distances follow the fluid scale in `src/app/globals.css` and `fluid(mobile, desktop)` in `src/lib/fluid.ts`: the first value comes from the Figma mobile frame (393px, `22:968`), the second from the desktop frame (1440px, `6:987`).

## Edge effects

- **Top scroll edge** (`.nav-edge`): a plain paper-colour fade (no blur) under the nav bar once the page scrolls, 24→32px, smoothstep ramp, fades in with opacity.
- **Progressive blur** (`src/components/ProgressiveBlur.tsx`, `.pblur` in globals.css): four stacked backdrop blurs, each masked to a band. Used as a fixed strip at the bottom of the viewport (`.viewport-edge`, 32–42px tall, 6px max). Desktop: always on except at the end of the page. Touch devices: only while scrolling down and never while the hero is on screen; when hidden it is removed (`data-gone`, `display: none`), because iOS Safari tints the area behind its toolbar from any fixed element at the bottom edge. Fade it with `--pb-on`, never an ancestor's `opacity` (that cuts the backdrop off).
- **Rails**: no edge fades (the owner found them noisy). Project photos drift inside their cards against the rail's scroll (`ParallaxPhoto`: Motion `useScroll` on the rail via `useRail()`, a damped spring, ±5%); off for reduced motion.
- **Mobile menu**: panel height animates to `auto` with Motion, links stagger in 60ms apart; a dim, blurred scrim (`.menu-scrim`) covers the page and closes the menu on tap; page scroll is locked while open.

## House rules

- The hero waits for the backdrop, the portrait and the display font before anything moves. Keep that gate; it is what prevents flashes.
- The name always sits behind the portrait, and the portrait must be fully opaque before the first letter appears.
- Animate `transform` and `opacity` only. No permanent `will-change`.
- No overshoot or bounce: the tone is calm and premium.
- Reduced motion: movement is removed and fades are kept. Check both Motion and CSS paths.
- Server-rendered hidden states need a `<noscript>` override (see `src/app/layout.tsx`).

## Which skill for what

| Task | Skill |
|---|---|
| Text reveals, splitting by letter/word/line, masks | `kinetic-typography` |
| Choosing durations, easing, stagger, sequencing | `animation-principles` |
| Deciding what deserves motion and how much | `motion-art-direction` |
| Hover, press, focus, input feedback | `micro-interaction` |
| Jank, layout thrash, compositing problems | `60fps-animation` |
| Reduced-motion and accessibility | `accessible-animation` |
| Animating the line illustrations (draw-on etc.) | `svg-animation` |

## Using the third-party skills here

They were installed from `iart-ai/*` (see `skills-lock.json`). Each ends with a "Deliver & verify (standalone HTML)" section that tells you to write a single demo `.html` file, load libraries from a CDN and run Playwright screenshots. **Ignore those sections in this repo.** Work in the Next.js app and verify in the running preview instead.
