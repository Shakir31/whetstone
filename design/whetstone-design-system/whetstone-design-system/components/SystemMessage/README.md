# SystemMessage

The voice of the System: a `crypt` block with pewter bracket corners, a square sigil, the SYSTEM label, optional timestamp, title, body, an italic verdict line and an itemised ledger of awards with dotted leaders.

- `kind="verdict"` after a day is judged — include `verdict` (one line) and `awards` for Body, Mind, Will in that order.
- `kind="notice"` (default) for neutral rules and reminders.
- `kind="warning"` for decay, missed days or limits: `blood-deep` ground, blood brackets. Use sparingly; never for errors in a form.
- Write every word in the System's voice: third person, present tense, no exclamation marks, no emoji, no praise.
- Fades in over `duration-fade`.

Consumer provides: `kind`, `meta` (e.g. "Day 113 · 23:52"), `title`, `children` (paragraphs), `verdict`, `awards` (`[{stat, amount, positive?}]`; `positive: false` greys the amount).
