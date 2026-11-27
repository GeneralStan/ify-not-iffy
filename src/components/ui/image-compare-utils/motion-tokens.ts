/**
 * Springs for the image compare slider (src/components/ui/image-compare.tsx), written as Motion
 * time-defined springs. `snappy` moves the divider; `morph` reshapes the handle and swings the
 * divider when the orientation changes. Durations sit with the site's own `fast`/`base` timings
 * (docs: .claude/skills/site-motion).
 */
export const motionTokens = {
  spring: {
    snappy: { type: 'spring' as const, visualDuration: 0.32, bounce: 0.12 },
    morph: { type: 'spring' as const, visualDuration: 0.42, bounce: 0.18 },
  },
};
