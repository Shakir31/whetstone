import { useState } from 'react'

export default function EntryForm({ onSubmit }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(text.trim())
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="panel entry-form" onSubmit={handleSubmit}>
      <label htmlFor="entry">What did you do today?</label>
      <textarea
        id="entry"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ran 5km this morning, legs were dead by the end. Studied Spanish for an hour…"
        rows={6}
        maxLength={5000}
        disabled={submitting}
      />
      {error && <p className="form-message">{error}</p>}
      <button type="submit" className="primary" disabled={!text.trim() || submitting}>
        {submitting ? 'The System is judging…' : 'Submit Entry'}
      </button>
    </form>
  )
}
