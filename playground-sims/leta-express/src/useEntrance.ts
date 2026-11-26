/**
 * Entrance choreography for the home screen (Reanimated).
 *
 * The page loads in its default layout (Figma 5270:83241, no banner), then the navy
 * "Riders are available" banner slides out from under the address card and pushes the
 * body down into the banner layout (Figma 5233:78553).
 *
 * 0–600ms     skeleton shimmers; rider hidden
 * 600ms       skeleton → content cross-fade (180ms)
 * 700ms       discount icon pops 0 → 1.1 → 1
 * 650ms       rider rises from behind the address card (340ms)
 * 850ms+      category illustrations glide in from the bottom-right, 65ms apart (320ms);
 *             each card's label scales 0.8 → 1 and fades in with its illustration
 * 950ms       waving hand waves once (ends 1400ms)
 * 1650ms      banner slides down from under the card while the body moves down 44 (480ms)
 * 1950ms      moon pops 0 → 1.1 → 1
 *
 * Every move eases in and out; only the shimmer sweep is linear.
 */
import { useCallback, useEffect, useRef } from 'react';
import {
  Easing,
  cancelAnimation,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

export const EASE = Easing.inOut(Easing.ease);
/** Crisper in-out (easeInOutCubic) for the banner's layout change. */
export const EASE_LAYOUT = Easing.bezier(0.65, 0, 0.35, 1);
const t = (toValue: number, duration: number) => withTiming(toValue, { duration, easing: EASE });
const tl = (toValue: number, duration: number) => withTiming(toValue, { duration, easing: EASE_LAYOUT });

export const SKELETON_MS = 600;
export const SHIMMER_MS = 900;
export const ILLUSTRATION_START = [850, 915, 980, 1045];
/** How far the banner pushes the body down: banner 56 tall, tucked 12 under the card. */
export const BANNER_SHIFT = 44;

export const BANNER = { at: 1650, ms: 480, moonAt: 1950 };

export const DISCOUNT_AT = 700;

/** Loop mode (web showcase / recording): entrance, banner, hold, then back to the skeleton. */
export const LOOP = {
  retractAt: 4100, // moon shrinks away first…
  moonOutMs: 160,
  retractMs: 420, // …then the banner tucks back under the card and the body moves up (ends 4680)
  fadeAt: 4760, // content → skeleton
  fadeMs: 260,
  cycle: 5400, // fade ends at 5020; skeleton rests until the next run
};

export type Entrance = ReturnType<typeof useEntrance>;

export function useEntrance({ loop = false, record = false }: { loop?: boolean; record?: boolean } = {}) {
  const skeleton = useSharedValue(1);
  const content = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const riderY = useSharedValue(48);
  const riderScale = useSharedValue(0.92);
  const riderOpacity = useSharedValue(0);
  const wave = useSharedValue(0);
  /** 0 = default layout (no banner), 1 = banner layout. Drives the banner and the body together. */
  const banner = useSharedValue(0);
  const moon = useSharedValue(0);
  const discount = useSharedValue(0);
  const ill = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)];
  const press = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  const all: SharedValue<number>[] = [
    skeleton, content, shimmer, riderY, riderScale, riderOpacity, wave, banner, moon, discount, ...ill, ...press,
  ];

  /** Linear sweep, starting part-way through a pass when `phase` > 0. */
  const startShimmer = (phase = 0) => {
    const linear = (to: number, duration: number) => withTiming(to, { duration, easing: Easing.linear });
    const pass = withSequence(linear(0, 0), linear(1, SHIMMER_MS));
    shimmer.value = phase;
    shimmer.value = withSequence(linear(1, (1 - phase) * SHIMMER_MS), withRepeat(pass, -1, false));
  };

  const reset = () => {
    all.forEach((v) => cancelAnimation(v));
    skeleton.value = 1;
    content.value = 0;
    riderY.value = 48;
    riderScale.value = 0.92;
    riderOpacity.value = 0;
    wave.value = 0;
    banner.value = 0;
    moon.value = 0;
    discount.value = 0;
    ill.forEach((v) => (v.value = 0));
    press.forEach((v) => (v.value = 0));
    startShimmer();
  };

  const play = () => {
    reset();
    skeleton.value = withDelay(SKELETON_MS, t(0, 180));
    content.value = withDelay(SKELETON_MS, t(1, 180));

    discount.value = withDelay(DISCOUNT_AT, withSequence(t(1.1, 180), t(1, 120)));

    riderY.value = withDelay(650, t(0, 340));
    riderScale.value = withDelay(650, t(1, 340));
    riderOpacity.value = withDelay(650, t(1, 240));

    ill.forEach((v, i) => (v.value = withDelay(ILLUSTRATION_START[i], t(1, 320))));
    wave.value = withDelay(950, withSequence(t(18, 110), t(-8, 110), t(12, 110), t(0, 120)));

    // After the page has settled: banner in, layout shifts.
    banner.value = withDelay(BANNER.at, tl(1, BANNER.ms));
    moon.value = withDelay(BANNER.moonAt, withSequence(t(1.1, 180), t(1, 120)));
  };

  const pressIn = (i: number) => {
    press[i].value = t(1, 160);
  };
  const pressOut = (i: number) => {
    press[i].value = t(0, 160);
  };

  /** Moon shrinks away, then the banner tucks back under the card and the body moves back up. */
  const retract = () => {
    moon.value = t(0, LOOP.moonOutMs);
    banner.value = withDelay(LOOP.moonOutMs, tl(0, LOOP.retractMs));
  };

  /** Content fades back to the skeleton; the rider sinks behind the card. */
  const fadeOut = () => {
    const d = LOOP.fadeMs;
    // Phase chosen so the sweep lands back on 0 exactly when the next cycle starts (seamless loop).
    const remaining = (LOOP.cycle - LOOP.fadeAt) / SHIMMER_MS;
    startShimmer(1 - (remaining % 1));
    content.value = t(0, d);
    skeleton.value = t(1, d);
    riderY.value = t(48, d);
    riderScale.value = t(0.92, d);
    riderOpacity.value = t(0, d);
    discount.value = t(0, d);
  };

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const runCycle = useCallback(() => {
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    const cycle = () => {
      clearTimers();
      play();
      at(LOOP.retractAt, retract);
      at(LOOP.fadeAt, fadeOut);
      at(LOOP.cycle, cycle);
    };
    cycle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Logo tap: start over from the skeleton. */
  const replay = useCallback(() => {
    if (loop) runCycle();
    else {
      clearTimers();
      play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop]);

  useEffect(() => {
    // Recording (web, ?record=1): hold the skeleton until the recorder starts the clock.
    if (record) {
      reset();
      (globalThis as { __letaStart?: () => void }).__letaStart = replay;
      return clearTimers;
    }
    replay();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replay, record]);

  return {
    skeleton, content, shimmer, riderY, riderScale, riderOpacity, wave, banner, moon, discount, ill, press,
    pressIn, pressOut, replay,
  };
}
