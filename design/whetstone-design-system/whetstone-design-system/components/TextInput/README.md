# TextInput

A single-line field with an uppercase label above, a sunken `slate` well and an optional hint below.

- Always give a `label`; placeholders are examples, not labels, and are set italic in `ash-faint`.
- `hint` explains a rule; when `error` is true the border turns `blood-bar` and the hint becomes the error, in `blood-ink`, stating the fact plainly ("A day must be named before it is judged.").
- Use for settings and short names only; journal writing always uses TextArea.

Consumer provides: `label`, `hint`, `error`, and native input props (`value`, `onChange`, `placeholder`, `type`).
