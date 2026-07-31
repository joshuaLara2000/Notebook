# UI Review Checklist

## Review method

Review structure before styling. Evaluate the screen in this order:

1. User job and primary action.
2. Reading order and hierarchy.
3. Pattern fit and information relationships.
4. Language and information value.
5. Grouping, density, and alignment.
6. Surface semantics and card usage.
7. Interaction states and feedback.
8. Accessibility and responsive behavior.
9. Visual polish and repository consistency.

Answer every check with one of: **yes / no / not applicable / needs
validation**. A check that cannot be answered objectively is a sign the
underlying decision was never made.

## Scoring rubric

Score each dimension from 1 to 5:

| Score | Meaning |
|---|---|
| 1 | Blocks comprehension or task completion. |
| 2 | Significant friction or inconsistency. |
| 3 | Usable but generic, uneven, or incomplete. |
| 4 | Clear, coherent, and production-ready. |
| 5 | Exceptional clarity, efficiency, restraint, and domain fit. |

Dimensions:

- Task clarity.
- Primary action clarity.
- Visual hierarchy.
- Reading flow.
- Pattern selection.
- Grouping and density.
- Card and surface discipline.
- Typography and alignment.
- States and feedback.
- Accessibility and responsiveness.
- Repository consistency.
- Domain relevance and visual distinction.

## Evidence-based issue format

For each high-impact issue, use:

```text
Issue:
Evidence:
User impact:
Smallest effective correction:
Priority: blocker / high / medium / low
```

Do not give generic feedback such as "make it cleaner" or "improve spacing." Name the exact relationship, hierarchy, or behavior that is failing.

## Squint test

At a glance or when visually blurred, the screen should still communicate:

1. Where the user is.
2. What matters now.
3. What the main work area is.
4. What action dominates.
5. What is secondary or optional.

If every container has equal weight, reduce surfaces and increase hierarchy.

## Language and information value checks

- Technical or backend terms visible to end users are translated to the
  concept the user acts on; the technical term stays as support (parentheses,
  tooltip, description, or detail) only where it still helps.
- Units are legible and appropriate (durations as time, not raw seconds;
  compact numbers where precision is not the task).
- Empty or unknown keys are represented honestly (an explicit "no data"
  label), not as blanks or fabricated values.
- Every visible column, field, metric, or block can name the decision, task,
  risk, or necessary context it supports; explanatory or low-frequency
  content is behind disclosure instead of occupying primary space.
- Differences between the admin and user surface for the same entity are
  justified by task set (operation vs comprehension), not accidental.

## Interaction checks

- One primary action per context.
- Destructive actions are separated, labeled, and confirmed appropriately.
- Delete/teardown copy names owned side effects (external deprovision, releasing pools) when the product owns them.
- Create vs edit paths use distinct labels and preload current values on edit/reassign.
- Replace flows define what happens to the previous provisioned resource.
- Disabled controls explain prerequisites when needed.
- Filters clearly affect the nearby dataset.
- Each filter sits next to the context it affects; local-scope filters are
  not presented as global (and scope is visible when ambiguous).
- Hard, stable input limits are prevented by the control itself when it can
  communicate the reason accessibly; dynamic or permission-dependent limits
  use validation with explicit feedback instead.
- Product states (locked, permission, entitlement, coming-soon) are not
  collapsed with data states (loading, empty, error).
- Prior data stays visible during refresh only while comparable; a dimension
  or breakdown change shows local loading, and empty never appears before
  the load completes.
- Selection reveals contextual bulk actions.
- Loading uses content-shaped placeholders and preserves layout where useful.
- Error is never presented as endless loading, skeleton, or pulse.
- Refresh with prior data keeps content visible and uses a non-blocking cue.
- Empty states explain what the user can do next.
- Locked/permission and coming-soon are not rendered as generic empty.
- Errors preserve entered data and provide recovery (Retry when refetch exists).
- Partial data is distinguishable from zero data; expected zeros are explained.
- Panel empty/error keeps title/controls when possible and swaps the body only.
- Success feedback is proportional and does not interrupt unnecessarily.

## Visual lift checks

- One dominant visual anchor answers the primary job at a glance.
- Typography ladder is intentional (display/title/body/meta do not compete).
- Comparable metrics use tabular numbers where appropriate.
- Status colors follow one consistent semantic dictionary across the screen;
  controls and chrome stay neutral enough for color to keep meaning.
- Filter and secondary chrome stay quieter than primary content.
- Density feels operational: stable rhythm, alignment, no decorative empty air.
- Lift comes from hierarchy and semantic status, not glass/glow/gradient theater.
- Squint test still reveals place, priority, main work, and primary action.

## Accessibility checks

- Logical heading structure.
- Labels are programmatically associated with controls.
- Keyboard order follows visual order.
- Visible focus is not removed.
- Icon-only actions have accessible names and tooltips when useful.
- Color is not the only status signal.
- Contrast and hit targets are sufficient.
- Dialogs and sheets manage focus and return it on close.
- Tables preserve headers and meaningful row actions.
- Responsive layouts preserve priority and do not hide critical actions without an alternative.

## Repository checks

- Existing primitives and variants are reused.
- The nearest analogous feature was inspected.
- New strings use i18n.
- Route, view, hooks, service, and utility responsibilities remain separated.
- New tokens or abstractions have a repeated use case.
- Relevant tests, type checks, lint, and build checks pass.

## Completion rule

Fix blockers and high-priority structural issues inside scope before polishing low-priority cosmetics. A polished wrong pattern is still the wrong interface.
