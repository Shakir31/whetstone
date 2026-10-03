# Button

The single action control: **primary** (dried-blood fill, two cut corners), **secondary** (iron outline, the default) and **ghost** (text only).

- Primary at most **once per screen**, for the thing the screen is for: "Submit to judgement", "Inscribe".
- Secondary for everything else; ghost for dismissive or low-stakes actions ("Discard", "Cancel").
- Labels are verbs, 1–3 words, written in sentence case (CSS sets them uppercase).
- `size="sm"` (32px) only inside panels and dense rows; the default 44px is the touch size. `block` fills the width — use it for the primary action on phones.
- Destructive actions use secondary, with the consequence in the label ("Erase all entries"), never a second red button.

Consumer provides: `children` (label), `onClick`, and any native button props (`type`, `disabled`, `aria-*`).
