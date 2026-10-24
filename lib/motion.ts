/**
 * The single set of motion tokens for the whole app.
 *
 * Every transition — step, route, or surface — draws from these values so the
 * motion vocabulary stays consistent. Values are in seconds to match Framer
 * Motion's `transition` API; the CSS mirror lives in `app/globals.css`
 * (`--motion-*`) and the two must stay in sync.
 */
export const MOTION = {
  /** Confirmations and micro-changes. Tabs, inline feedback. */
  fast: 0.12,
  /** The default. Step changes, dialogs, toasts. */
  base: 0.24,
  /** Large surfaces that travel further. Drawers, sheets. */
  slow: 0.36,
  /** Travel distance in px for step transitions. */
  distance: 20,
  /** One decelerating curve: quick start, soft landing. */
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
} as const;

/** CSS mirror of `MOTION.ease` for places that cannot import JS values. */
export const MOTION_EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
