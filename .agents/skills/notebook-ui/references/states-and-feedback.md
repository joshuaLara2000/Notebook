# States and Feedback

Portable recipes for trustworthy product UI. Encode behavior, not a specific
module's components or tokens.

## Why this matters

Users trust an interface that tells the truth about data. Lying loaders,
skeleton-on-error, and conflating “no rows” with “no permission” destroy
confidence faster than weak styling.

## LoadState contract

Prefer an explicit triad for fetched units:

- `loading` — no renderable data yet for this unit
- `error` — fetch or derive failed
- `idle` — data is available to render (including empty collections)

Optional companion flag:

- `isRefreshing` — a refetch is in flight while prior data remains shown

### Hard rules

1. **Never collapse error into loading.** Do not write
   `isPending = loading || error`. Error must show failure UI, not an endless
   skeleton or pulse.
2. **`loading` only when there is nothing trustworthy to show.** If previous
   data exists (filter change, refetch, placeholder retention), keep it and
   treat the in-flight work as refresh.
3. **Independent units own their state.** In multi-panel screens (dashboards,
   detail with several widgets), each panel that fetches independently exposes
   its own load/error/empty. Do not block the whole page on the slowest panel
   unless the page is meaningless without that data.

## Loader geometry

Match the placeholder to the content shape:

| Content | First-load affordance |
|---|---|
| Large metric / KPI value | Pulse blocks sized like value + meta |
| Chart / graph body | Chart-shaped skeleton (axes/series silhouette) |
| Table body | Row stubs or table skeleton |
| Dense form section | Field-shaped placeholders if useful |

Do not use a generic centered spinner as the default for rich panels when a
shaped skeleton preserves layout.

## Refresh with data

When refetching while prior content is valid:

- Keep the existing content visible
- Add a non-blocking affordance (subtle overlay, quiet spinner, or inline
  refreshing cue)
- Do not replace the whole panel with a skeleton unless the data is gone or
  the unit has no prior payload

### Comparability rule

Prior data may stay visible only while it is still comparable to what the
user asked for. When the user changes a dimension, breakdown, grouping, or
context so that the previous payload no longer answers the new question:

- do not present the old data as if it belonged to the new context;
- use a local loading affordance (skeleton or shaped placeholder) for that
  unit instead;
- never show an empty state before the corresponding load has completed —
  "no rows yet" and "no rows" are different claims.

Filter changes that narrow or widen the same question (same dimensions) can
keep prior data visible as a refresh; changes that alter the question cannot.

## Empty vs locked vs coming-soon

These are different states. Do not reuse one layout for all.

| State | Meaning | UI intent |
|---|---|---|
| Empty | Entitled, loaded, no rows for current filters/range | Explain why and what to change next |
| Locked / permission | The user's role cannot access this | Explain the gate; do not look like “no data” |
| Not entitled | The plan or contract does not include the feature | A showcase, upgrade path, or access request is valid; do not render a generic empty |
| Coming soon | Feature stub / not shipped | Temporary honesty; lighter than locked |

Locked/permission, not-entitled, and coming-soon are **product states**;
empty is a data state, listed here for contrast. A unit can be entitled and
empty, or entitled and erroring; never collapse product availability,
permission, and data presence into one generic layout.

## Panel chrome on empty and error

For a titled panel (chart, table, metric group):

- Keep title, subtitle, and header controls when possible
- Swap only the body for empty copy or error + recovery
- Wire **Retry** when a refetch action exists and recovery is realistic
- Lightweight hero metrics may show an honest placeholder (`—`) without full
  error chrome; do not leave them pulsing on error

## Expected zero vs failure

If a zero or empty series is a valid product outcome (mode, config, or domain
rule), explain it near the metric. Do not imply system failure.

## Page-level vs panel-level

- **Page-level** full-page empty/error shells fit list/admin screens where the
  whole view is one dataset.
- **Panel-level** shells fit multi-query dashboards and composite detail pages.
- Prefer the nearest established shell in the module or `shared/ui`. Do not
  invent a third feedback system in the same view without a reason.

## Blocking failures

Treat as blockers for substantial UI:

- Skeleton or pulse that never ends because error was mapped to loading
- Missing empty or error treatment for fetched panels in scope
- Locked/permission presented as generic empty
- Refresh that wipes readable prior data without necessity
