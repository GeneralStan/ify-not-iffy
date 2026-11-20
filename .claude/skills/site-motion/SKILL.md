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

## Hero load-in (first load only)

`BaseLayout intro` adds `html.intro-wait` before paint (motion allowed, first load only; page changes keep the hero). `hero-intro.ts` waits for the fonts and the polaroid (capped at 1.8s), then swaps to `html.intro-play`:

1. 0ms: logo pops in (500ms) and spins one turn over 2s on `--motion-ease-spin`.
2. 200ms: headline words rise one by one from a bottom-edge mask, 70ms apart, 760ms each.
3. 600ms: the hero polaroid grows out of its own spot, 0 → 120% → 100% (no drop, no fade).
4. 1050 / 1130ms: the two CTA buttons rise in turn.
5. 1200ms: flaps slide up from behind the hero's bottom edge, 60ms apart, with no fade (clipped at the line).
6. ~1940ms (90% of the flap sequence, `HEDGE_POP_AT`): the hero hedges pop up from behind the flaps, all at once.

A 3s inline timeout always removes `intro-wait`, so the page can never stay hidden.

## Interactions

- **Logo** (hero and docked): hover (fine pointer) or tap replays one 1.6s spin; a running spin is never restarted. The petals' hub is at (32, 33.22) of the 64 box, so the SVG spins with `transform-origin: 50% 51.9%`. Spinning around the box middle makes it bob.
- **Polaroid** (`Polaroid.astro`, any photo in `src/assets/polaroids/`): hover (fine pointer) scales the card to 1.1. Click or tap pops it to 1.2 and back (720ms, enter ease up, in-out down; the peak is divided by the hover scale so it never reaches 1.32) while a white sheen sweeps across once (`::before`, 760ms). Only the visible card takes the pointer, not the PNG's transparent margin. The Figma frames crop the middle ~65% of each PNG, so a Figma rect of 85x96 means a 131.8x148 PNG box.
- **Hedges** (Figma `Hedges` 4029:2552, Desktop and Mobile variants, data in `src/data/hedges.ts`): tap shakes the bush and rustles its neighbours. Hover (fine pointer) and keyboard focus lift just that bush 3% of its height (`translate`, 280ms enter ease) as a clickable signifier; neighbours stay put. The pop (`hedge-pop`, 680ms) is the whole row at once: each bush grows from its base, 0 → 110% → 98% → 100%, a small bounce. The hero plays it during the intro; the footer plays it once, the first time its hedges are 30% visible.
- **Flap nav** (`FlapNav.astro`, Figma component sets 4031:2832 / 4029:2506 / 4031:3203):
  - Phones (<768): flaps cap at 88px wide (labels use Nav Mobile 16/24) and the hero hedge row spans the full width. Shapes are chamfered with 8px rounded corners (both chamfer ends and top right): Work's chamfer is 17.93 tall, Playground's and About's 21.80 (on the 66 shape). Playground idle is Plum/150; About idle is Blue/200 in the hero, Blue/150 docked and when current.
  - The slot is a zero-height `position: sticky; top: 0` line right under the hero. Hero flaps stand on it; docked flaps hang from it.
  - Docking is a hinge. Each flap is a two-sided card that rotates `rotate: x 180deg` around the line (760ms, `cubic-bezier(0.55,0,0.15,1)`, Work → About 80ms apart; undocking runs About → Work). The row slides right by `--dock-shift` at the same time, and the 48px logo fades in at the bar's left. It triggers only when the line reaches the top of the screen (the hero is fully gone) and reverses once the line is 24px back down.
  - Hover: the shape stretches from 66 to 80 (`scale: 1 80/66`) away from the line, and the label moves 7 with it. Hero flaps grow up, docked flaps grow down. 240ms enter ease.
  - Press: Pressed colour, 80 tall, `scale: 0.96`. Release springs back (`cubic-bezier(0.34,1.4,0.64,1)`); the page navigates 220ms after release.
  - Once stuck, a scroll-edge band fills the flaps' height with the page colour, then fades and un-blurs over the 48px just below them, so content disappears under the flaps and softens just beneath. There is no plate in a different colour.
- **Pages** (`SiteLayout.astro`): Work, Playground and About share the hero, flaps and footer, which persist across page changes (Astro `ClientRouter` + `transition:persist`). Changing page swaps only `<main>` with a fade, `<html data-page>` sets the page colour, and the current flap updates in place (its colours and height transition). Leaving from the docked view lands docked on the new page, with the hero just above.

## Scroll reveals (below the hero)

Ported from the Nnamdi site's `<Reveal>` to vanilla: `src/scripts/reveal.ts` + `src/styles/reveal.css`.

- Mark an element `data-reveal="rise|soft|scale|pop|words"` and optionally `style="--reveal-delay: 100ms"`. It animates in once, the first time it is 5% visible (8% bottom margin).
- `rise` lifts 18px; `soft` lifts 18px and un-blurs 6px (headings, leads); `scale` lifts 24px from 0.98 (cards); `pop` is the hero polaroid's 0 → 120% → 100% (pass `revealDelay` to `Polaroid`); `words` is the hero headline's per-word mask rise (`.reveal-word > .reveal-word__inner`, `--w` index).
- 900ms, enter ease for movement, fade ease for opacity. Siblings stagger 100-110ms; cards `min(i,2) × 110ms` style.
- Hidden only under `html.reveal-ready`, set inline in BaseLayout before paint (motion allowed + IntersectionObserver), and re-added after each page swap.
- Footer: "Let’s Connect" rises word by word, the mooncake polaroid pops at 260ms, the text at 360ms, buttons at 460/540ms. It plays once per visit (the footer persists).

## Buttons

- Padding comes from the Figma Button set: desktop 44 tall, 10/20 (16 on the icon side); mobile 40 tall, 8/12 (12 icon side, 16 text side).
- Every button on the site is the No Icon variant. Touch screens never show an icon, on press or otherwise. On hover (fine pointer only), a button morphs into its Trailing Icon variant: the arrow slot opens 0fr → 1fr and the padding moves to the trailing values (280ms enter ease), then the arrow pops (scale overshoot to about 1.1) and tilts 8deg clockwise and back (520ms). Exceptions to the house rules, asked for by the owner: the width change is layout animation on one small element, and the arrow pop overshoots.

- "Let’s Chat" (hero and footer) opens the Cal.com booking modal: `Button cal`, `src/scripts/cal.ts`, link details in `src/data/site.ts`. Cal's embed script loads only when someone points at, focuses or taps that button.

## Cursor tooltip

`src/scripts/cursor-tooltip.ts`: any `[data-tooltip="text"]` shows the Figma Tooltip pill (4042:3946) that trails the pointer (lerp 0.22, translate only) and scales in from 0.8. Fine pointers only. Case study cards use it ("View details").

## Logo home

Both logos (`a[data-home]`) go to Work with the hero in view: on Work they smooth-scroll to the top, elsewhere they change page without landing docked.

## House rules

- Animate `transform` and `opacity` only (the line blur is the one exception, and it ends at `filter: none`). No permanent `will-change`.
- No overshoot or bounce: calm and premium. Owner-approved exceptions: the polaroid pops, the hedge pop, the flap release spring and the button arrow pop.
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
