# House rules

How we write code in Tameer-e-Sehat. These are the rules we actually enforce in
review, so they are short and specific on purpose. If a rule here conflicts with
something you have seen elsewhere in the codebase, this file wins and the older
code is the thing that is wrong.

## 1. Forms belong to react-hook-form

A form is not a pile of `useState` calls. Every field having its own state, its
own `onChange`, and its own copy of the same validation logic is how a form ends
up with three different error messages for one field.

So: one `useForm` per form, fields registered against it, validation declared
once, errors read from one place.

```tsx
// One source of truth for the whole form. Field values never live in
// component state, so nothing can drift out of sync with what gets submitted.
const form = useForm<ProductDraft>({
  defaultValues: emptyProductDraft,
  mode: "onBlur",
});

<input
  {...form.register("name", { required: "Please enter a product title." })}
/>
{form.formState.errors.name && <p>{form.formState.errors.name.message}</p>}
```

**Multi-step wizards are one form, not several.** The Hijama booking flow, the
inline Hijama calendar flow, and the product wizard are each a single `useForm`
whose fields happen to be rendered in groups. Two consequences worth stating
because both have already bitten us:

- Never unmount a step and expect its values to survive. Keep the form at the
  wizard level and let the step render the fields it owns.
- "Next" validates only the current step's fields — `form.trigger(["name",
  "category"])` — so a user is not blocked by a field three screens away.

Validation rules live next to the field they belong to, or in a shared schema
when the same rule is enforced again in an API route. Never write the same rule
twice with different wording.

## 2. A draft is never lost

If a person has typed something, closing the tab, refreshing, or stepping
backwards must not throw it away. The booking wizard is five steps long and the
product form asks for photos, variants, and pricing — losing that is the single
most expensive thing this site can do to someone.

Persist the draft (localStorage keyed by form name, or a draft row for anything
that must follow the user across devices), restore it on mount, and clear it
only after a successful submit or an explicit "start over".

```tsx
// Start from the saved draft so the form never flashes empty and then fills
// itself in.
const form = useForm<ProductDraft>({
  defaultValues: readDraft(DRAFT_KEY) ?? emptyProductDraft,
});

// Subscribe to changes rather than watching values in a dependency array:
// `form.watch()` in deps re-subscribes on every render, and watching values
// would re-render the whole form on every keystroke.
useEffect(() => {
  const subscription = form.watch((values) => scheduleDraftSave(DRAFT_KEY, values));
  return () => subscription.unsubscribe();
}, [form]);
```

**What we do not persist.** Passwords, auth tokens, card details, and the health
screening answers (blood thinners, pregnancy, anaemia) stay out of storage. A
booking form on a shared clinic computer is not the place to leave someone's
medical answers behind. Persist the parts that make the form tiring to retype —
dates, names, addresses, quantities — and ask again for the sensitive parts.

## 3. Server state belongs to TanStack Query

Anything that came from the network is cache, and we treat it as cache: one
owner, one lifetime, one place that decides when it is stale.

```tsx
// Cached, deduplicated, and shared by every component that needs it. No
// manual loading/error booleans, no refetch on every mount.
const { data: dates, isPending } = useQuery({
  queryKey: ["hijama", "sunnah-dates", months],
  queryFn: () => fetchJson<HijamaDateAvailability[]>(
    `/api/hijama/sunnah-dates?months=${months}`
  ),
});
```

- **Never** fetch inside `useEffect`. If you are writing `useEffect` + `fetch` +
  `useState`, you are reimplementing Query badly and you should stop.
- Choose `staleTime` deliberately: reference data (categories, units) can sit
  for minutes, availability should be short, anything the user just changed
  should be invalidated rather than waited out.
- A mutation invalidates the queries it affected; it does not refetch the whole
  world and it does not set state by hand.
- Prefer fetching on the server where the page only needs the data once. Query
  is for data the browser needs to refresh, paginate, or refetch after a write.

`useEffect` is still the right tool for things that are not data — wiring an
event listener, measuring a DOM node, syncing a third-party widget. The rule is
about server state, not about banning the hook.

## 4. Code should read like prose

Someone joining this project should be able to open a file and follow it
top-to-bottom without a map. That is the actual standard; everything below is
just what it takes to hit it.

- **Name things the way the business names them.** The glossary in
  `GLOSSARY.md` is not decoration — if the domain says "ward", the variable is
  `ward`, not `roomType2`. Avoid the words the glossary tells you to avoid.
- **Comments explain why, not what.** `// step 3 renders the receipt` is noise;
  the code already says that. `// Height is animated because the surrounding
  card would otherwise jump by 40px between steps` is the kind of comment that
  saves the next person an hour. Every non-obvious decision earns one. Comments
  that restate the code are garbage and we delete them in review.
- **No dead code.** No commented-out blocks, no unused props kept "just in
  case", no `any` used to silence a real type problem. Delete it; git remembers.
- **Small functions with one job.** If a component is 900 lines, the fix is to
  split it, not to add another comment banner.
- **Consistent shape.** Imports grouped the way the surrounding files group
  them, the same `fetch` helper everywhere, the same motion tokens rather than
  a new duration invented per component.

## 5. Where we stand today

These rules apply to new code and to any file being changed for other reasons.
Existing code is migrated as it is touched — there is no big-bang rewrite
planned, because a 38-file refactor of working screens is how a working product
stops working.

Neither library is installed yet. Install at first use:

```bash
pnpm add react-hook-form @tanstack/react-query
```

Known debt, in rough priority order, if you are looking for something to pay
down:

- 37 files call `fetch(` directly, and 32 of them also import `useEffect` — that
  overlap is where the hand-rolled fetching lives.
- Three forms lose a real draft on refresh: `HijamaCalendarSection`,
  `HijamaBookingModal`, `ProductFormModal`. All hold their fields in local
  state. (`AuthModal` is deliberately not on this list — credentials are never
  persisted.)
- `app/checkout/page.tsx` is a single 1000-line form with no step structure.
  When it is touched it should become a wizard on one `useForm`, not a set of
  separate forms.
