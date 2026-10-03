# Panel

The stone slab that holds content: `crypt` ground, `line` border, film grain beneath, worn chamfered corners and a header with an eyebrow, an uppercase title and a short pewter tick under the rule.

- Use one panel per idea: today's entry, the attributes, a past day. Stack them `space-6` apart; never nest panels.
- `eyebrow` carries context in `micro` ("Day 113 · Tuesday"); `title` names the content ("Today's deeds"); `actions` holds a Tag or a small button aligned right.
- `worn={false}` for panels inside tight grids where the chipped corners would look like a rendering fault.
- Fades in over `duration-fade` when mounted.

Consumer provides: `title`, `eyebrow`, `actions`, `children`, optionally `as` (section, article, div).
