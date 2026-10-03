# LevelUp

The LEVEL UP ceremony: a dark `blood-deep` band that fades at both ends, two `blood-bar` rules that draw outward, the words in `display-xl` settling into place, then the stat line ("Will  Lv. 7 → Lv. 8") and an optional System note in italic.

- Show it once, when a judgement crosses a level threshold, above the stats it affects. Hold it until the person navigates or dismisses; never loop or repeat it.
- One LevelUp per judgement: if two stats rise, list both in the `note` rather than stacking banners.
- No sound, no shake, no particles, no glow. The weight is the reward.
- Announced politely to screen readers (`role="status"`).

Consumer provides: `stat`, `from`, `to`, optionally `note` and `word` (defaults to "Level up").
