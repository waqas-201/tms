# One motion vocabulary, with CSS-native route transitions

Status: accepted

Step, route, and surface transitions used to be ad hoc: each wizard swapped its
body with `{step === N && …}` plus a 250 ms fade, tabs swapped instantly, dialogs
and drawers each carried their own Framer Motion spring, and route navigation had
no transition at all (`app/template.tsx` documented one that was never built).
The result read as quirky rather than deliberate.

We decided that every transition draws from a single small token set (`fast` 120 ms,
`base` 240 ms, `slow` 360 ms, one decelerating easing, one 20 px travel distance)
and that each transition type has exactly one implementation:

- **Step transitions** animate direction (forward slides in from the right, back
  from the left), animate the container height, and reset the step's scroll
  position before the enter animation starts.
- **Route transitions** are a CSS-only fade keyed on `pathname`, not on navigation
  events, so filter and query-string updates never re-animate the page.
- **Surface transitions** are a short opacity fade for tab panels and token-based
  tweens for dialogs and drawers.

Rejected alternatives: keeping per-component Framer Motion orchestration (loses
consistency and makes every new surface a new animation decision), and using
React's `<ViewTransition>` for route changes (a true crossfade, but it depends on
client JavaScript and on browser support landing consistently, which we did not
want as the floor for the whole site).

Consequence: a route change cannot crossfade the old and new pages; the new page
fades in while the old one is already gone. That is deliberate — no stale page, no
hydration dependency, and no flash on slow connections. Adding a shared-element
morph for product cards later is still possible without reworking this.
