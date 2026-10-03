// Date and number formatting, matching the page designs ("Saturday, 3 October",
// "Thu 1 Oct", "21:14"). Built by hand because browsers disagree on details
// like commas and "Sep" vs "Sept".

import { dayKey } from './stats.js'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// "Saturday, 3 October"
export function longDate(date) {
  const d = new Date(date)
  return `${WEEKDAYS[d.getDay()]}, ${dayMonth(d)}`
}

// "3 October"
export function dayMonth(date) {
  const d = new Date(date)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

// "21:14"
export function time(date) {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// "Today", "Yesterday", or "Thu 1 Oct"
export function shortDay(date) {
  const key = dayKey(date)
  if (key === dayKey(new Date())) return 'Today'
  if (key === dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000))) return 'Yesterday'
  const d = new Date(date)
  return `${WEEKDAYS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`
}

// [{ stat: 'Body', amount: 0.7 }, ...] for whichever of Body/Mind are above zero.
export function gainsOf({ body, mind }) {
  const gains = []
  if (body > 0) gains.push({ stat: 'Body', amount: body })
  if (mind > 0) gains.push({ stat: 'Mind', amount: mind })
  return gains
}

// plural(1, 'day') → "1 day", plural(3, 'entry', 'entries') → "3 entries"
export function plural(n, word, pluralWord = `${word}s`) {
  return `${n} ${n === 1 ? word : pluralWord}`
}
