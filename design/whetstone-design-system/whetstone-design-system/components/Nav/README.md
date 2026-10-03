# Nav

Navigation for the four pages — **Journal, Chronicle, Stats, Settings** — as a top bar on desktop and a fixed bottom tab bar on phones.

- `layout="auto"` (default) switches at 640px: a bar with the WHETSTONE wordmark and uppercase links above, a 64px tab bar with icons and labels below (fixed, safe-area aware). Leave 80px of bottom padding on the page for it.
- `layout="bar"` or `"tabs"` forces one form (for previews or embedded shells).
- The current page gets `aria-current="page"`, `bone` text and a 2px `blood-bar` underline (bar) or overline (tabs); its tab icon turns `blood-ink`.
- Do not add a fifth item. Do not add badges or counters to nav items.

Consumer provides: `active` (item id), `onNavigate(id)` or `href` per item, optionally `items` (`[{id, label, icon?, href?}]`, icons: journal, chronicle, stats, settings) and `brand`.
