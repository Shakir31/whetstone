import { useEffect, useState } from 'react'
import { Button, Panel } from '../ui/whetstone.jsx'
import { plural } from '../lib/format.js'

const DRAFT_KEY = 'whetstone.draft'
const MAX_LENGTH = 5000

// The unsent entry is kept in this browser, so a refresh doesn't lose it.
function readDraft() {
  try {
    return localStorage.getItem(DRAFT_KEY) ?? ''
  } catch {
    return ''
  }
}

function writeDraft(text) {
  try {
    if (text) localStorage.setItem(DRAFT_KEY, text)
    else localStorage.removeItem(DRAFT_KEY)
  } catch {
    // Storage unavailable — the draft just won't survive a refresh.
  }
}

export default function EntryForm({ onSubmit }) {
  const [text, setText] = useState(readDraft)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => writeDraft(text), [text])

  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!trimmed || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(trimmed)
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Panel as="form" className="entry-form" onSubmit={handleSubmit}>
      <label htmlFor="entry" className="entry-form__label">
        What did you do today?
      </label>
      <textarea
        id="entry"
        className="ws-textarea entry-form__text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Set down the day as it happened."
        maxLength={MAX_LENGTH}
        disabled={submitting}
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="entry-form__foot">
        <span className="ws-small">{plural(words, 'word')} · An entry cannot be altered once judged.</span>
        <Button type="submit" variant="primary" disabled={!trimmed || submitting}>
          Submit to judgement
        </Button>
      </div>
    </Panel>
  )
}
