# TextArea

The journal writing surface: `entry` type (19/31; 17/28 on phones) on a sunken `slate` well with faint ledger rules.

- One per screen. It is the most important thing on the Journal page — give it at least 6 rows and the full column width (max 68ch measure).
- `showCount` with `maxLength` shows "143 / 2000" in the label row; over the limit it turns `blood-ink`.
- The placeholder speaks in the interface voice: "Write what you did. Plainly. The System reads everything."
- No grain, overlays or icons inside the field. Resizing is vertical only.

Consumer provides: `label`, `hint`, `showCount`, `maxLength`, `rows`, and native textarea props (`value`/`defaultValue`, `onChange`).
