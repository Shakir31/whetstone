# StatBar

A stat's name, its level ("Lv. 7"), and progress to the next level as a hard-edged bar with quarter notches, a bone "honed edge" where the fill stops, and the percentage below.

- Always show the three stats together in the order **Body, Mind, Will**, `space-5` apart.
- `value` is 0–100 progress to the next level. Pass `from` (the previous value) after a judgement so the bar fills from where it was over `duration-fill`; without `from` it fills from zero on mount.
- `compact` drops the footer and thins the bar — for nav summaries and lists. `tone="iron"` fills in pewter for a stat that is dormant or locked.
- The percentage is always shown as text: colour is never the only signal of progress.

Consumer provides: `name`, `level`, `value`, optionally `from`, `caption` (replaces "to Lv. N"), `compact`, `tone`.
