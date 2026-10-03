Whetstone is a journal that judges. The person writes what they did today; an impersonal **System** weighs it and awards experience to three stats — **Body**, **Mind**, **Will** — shown as levels with progress bars. The interface is grim, cold and weathered: dark stone, ash, tarnished iron and one colour of dried blood. Nothing glows. Nothing bounces. Everything feels heavy and earned.

## Principles

- **Weight over sparkle.** Rewards are shown with restraint: a bar filling slowly, a dark band, a word set in carved capitals. Never confetti, sparkles, glows or warm light.
- **The System is not your friend.** It is impartial, terse and exact. It neither praises nor scolds; it records.
- **The person's words are sacred.** Journal text is the most readable thing on every screen: `entry` style, `bone` on `slate` or `crypt`, generous line height, nothing laid over it.
- **One red thing.** `blood` marks the one action or reward that matters on a screen. If two things are red, one of them is wrong.

## Voice and copy

Two voices, never mixed:

- **The System** speaks in the third person, present tense, short declarative sentences. No "you did great", no exclamation marks, no emoji. It names facts, then the verdict. It refers to itself as "the System", never "I" or "we".
  - "Three deeds recorded. The run in the cold is counted twice."
  - "Effort noted. Discipline insufficient."
  - "No entry was submitted yesterday. Will decays by 3 XP for each day left unrecorded."
- **The interface** (buttons, labels, hints) is plain and imperative: "Submit to judgement", "Save draft", "View chronicle". Labels name the thing ("Today's deeds", "Name to be recorded").
- Casing: every display-face string — headings, labels, buttons, tags, nav, stat names — is set **UPPERCASE** by CSS; write it in sentence case in the source so screen readers read words, not letters. Body text is sentence case.
- Numbers: "Lv. 7" (capital L, full stop, space); experience as "+14 XP"; progress as a whole percentage "62%". Days are counted: "Day 113". Weeks may use Roman numerals in dividers only ("Week XVII").
- Stat names are always **Body**, **Mind**, **Will** in that order.

## Colour

One theme, **Night**. There is no light mode: the app lives in the dark.

- Grounds, darkest to lightest: `void` (page) → `crypt` (panels, nav, system messages) → `slate` (inputs, text areas) → `grave` (pressed, selected). Never put a lighter ground under a darker one.
- Text: `bone` for everything that must be read, `ash` for secondary text and hints, `ash-faint` only for placeholders and disabled labels. All three pass 4.5:1 on `void`, `crypt` and `slate`.
- Accent: `blood` is the fill of the primary button and nothing else large. `blood-bar` is a mark (progress fill, LEVEL UP rules, active-nav underline). `blood-ink` is the accent as text (XP gains, warnings, the active tab icon) — on `void`, `crypt` or `blood-deep` only. `blood-deep` is the ground for warnings, blood tags and the LEVEL UP band.
- Iron and pewter are the secondary metal: `iron` for control borders (3:1 on every ground), `pewter` for icons, inactive nav and the bracket corners of system messages, `pewter-light` for secondary-button labels and the SYSTEM label.
- `line` is for decorative dividers only; anything that must be seen to be used (an input edge, a tag edge) uses `iron` or stronger.
- Focus: a 2px solid `focus` (bone) outline with 2px offset on every interactive element. It is the only bright edge in the system and is never removed.

## Typography

- **Display — Libre Caslon Condensed** (500/600/700, `--font-display`). A sharp, condensed old-style serif, always **uppercase**, always tracked: `display-xl` (LEVEL UP only), `title` (page titles), `heading` (panel heads), `numeral` (levels), `label` (buttons, fields, stat names, nav), `micro` (tags, eyebrows, percentages). Nothing in the display face is smaller than 12px.
- **Text — Source Serif 4** (variable 200–900, roman and italic, `--font-text`). Optical sizing is automatic. `entry` (19/31, 17/28 on phones) for journal writing and reading, `body` for UI prose, `verdict` (italic) for the System's one-line judgement, `small` for hints and timestamps.
- Keep journal measure at 68ch or less. Never set journal text in the display face, and never set a full sentence in uppercase.
- Figures are lining and tabular in the display face, so levels and percentages align in columns.

## Space, edges and depth

- Spacing runs `space-1` (4px) to `space-8` (64px). Panels pad `space-5` on desktop, `space-4` on phones; panels stack `space-6` apart; page gutters are `space-6` desktop, `space-4` phone.
- Edges are hard. `radius-none` everywhere; `radius-hair` (1px) on inputs only. Rounded pills and circles do not exist in Whetstone.
- **Worn edges:** panels carry the `ws-worn` clip — irregular chamfers on all four corners (`chip`-sized and a little larger), like chipped stone. Primary buttons carry two cut corners. Do not add worn edges to inputs, tags or bars.
- **Dividers:** 1px `line` rules. `heavy` is a double rule (iron over line) to close a section; `ornament` sets a small pewter lozenge or a micro label in the middle. One ornament per screen at most.
- Depth comes from grounds and borders, not shadows. `shadow-panel` presses a panel onto the void; `shadow-well` sinks inputs and bar tracks; `shadow-press` is the pressed button. No coloured or glowing shadows.

## Textures

- **Film grain** (`ws-grain`): a tiled fractal-noise layer at `grain` opacity (0.06), painted *beneath* content so letterforms stay crisp. On `Surface`, `Panel`, `SystemMessage` and the LEVEL UP band. Never above 0.08.
- **Vignette** (`ws-vignette`): a radial darkening to `vignette` (0.6) at the page corners, on `Surface` only. It darkens — it never adds light or colour.
- Never put grain or vignette inside a text area or over journal text, and never layer two grains.

## Motion

Slow, heavy, final. Things fade and fill; nothing scales, springs, wiggles or overshoots.

- Hover and focus colour changes: `duration-quick` (160ms), `ease-weight`.
- Panels and system messages fade in over `duration-fade` (600ms), `ease-weight`. No slide.
- Progress bars fill from their previous value over `duration-fill` (1400ms), `ease-grind` — a slow start and a long, heavy stop.
- LEVEL UP is a ceremony of `duration-ceremony` (2400ms): the band fades in, the two rules draw outward from the centre, the words settle as their tracking tightens, then the stat line and the note fade in. Shown once, held until dismissed or navigated away; never looped.
- Under `prefers-reduced-motion: reduce`, every fade, draw and fill is instant.

## Layout and responsiveness

- Desktop: the `Nav` bar runs across the top (brand left, four pages right). Content is a single column up to 720px for the journal, or a two-column grid (journal + stats) from 1024px.
- Phones (640px and below): `Nav` with `layout="auto"` becomes a fixed bottom tab bar with icons and labels, 64px tall, respecting the safe-area inset; leave 80px at the bottom of the page for it. Type steps down (`display-xl` 40px, `title` 28px, `entry` 17px), panels pad `space-4`.
- Touch targets are at least 44px tall (buttons, inputs, tabs at 64px).

## The four pages

1. **Journal** — today's `TextArea` in a `Panel`, the primary button "Submit to judgement", and after judgement the `SystemMessage` verdict with awards.
2. **Chronicle** — past days as `Panel`s, newest first, each with its day `Tag`, the entry and the verdict line.
3. **Stats** — Body, Mind, Will as `StatBar`s; a `LevelUp` appears here when a threshold is crossed.
4. **Settings** — `TextInput`s and secondary buttons; no red except a destructive action.

## Iconography

Four nav icons ship inside `Nav`: journal (ruled page), chronicle (ledger calendar), stats (three bars), settings (two sliders). They are drawn on a 24px grid with 1.5px strokes, square caps and mitred joins, in `currentColor` — `pewter` at rest, `bone` when hovered, `blood-ink` when current. Any new icon follows the same rules: geometric, no curves where a corner will do, no fills, no skulls, runes, candles or mystical symbols. No emoji anywhere.

## Logo

There is no logo mark yet. The name is set as text: **WHETSTONE** in Libre Caslon Condensed 700, uppercase, tracked 0.18em, in `bone` (as in the `Nav` brand).
