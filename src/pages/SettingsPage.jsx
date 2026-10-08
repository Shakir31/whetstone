import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Button, TextInput } from '../ui/whetstone.jsx'
import { supabase } from '../lib/supabase.js'
import { deleteAccount } from '../lib/entries.js'
import { downloadJournal } from '../lib/export.js'
import { plural } from '../lib/format.js'
import { DownloadIcon, SignOutIcon } from '../components/Icons.jsx'

const CONFIRM_WORD = 'DELETE'

// "UTC+08:00" for the device's current offset.
function utcOffset() {
  const minutes = -new Date().getTimezoneOffset()
  const sign = minutes >= 0 ? '+' : '-'
  const abs = Math.abs(minutes)
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`
}

export default function SettingsPage() {
  const { email, entries, classDay } = useOutletContext()
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <main className="page page--settings">
      <div className="page-head page-head--ruled">
        <span className="ws-micro page-head__eyebrow">Account and record</span>
        <h1 className="ws-title">Settings</h1>
      </div>

      <SettingsSection title="Account">
        <EmailRow email={email} />
        <Row label="Password">
          <span className="settings-row__value settings-row__value--hidden" aria-label="Hidden">
            ••••••••••
          </span>
          <Link to="/reset-password" className="ws-btn ws-btn--secondary settings-row__action">
            Change password
          </Link>
        </Row>
      </SettingsSection>

      <SettingsSection title="Time">
        <Row label="Time zone">
          <div className="settings-row__value">
            <p>
              Days are counted in {timeZone} <span className="settings-row__muted">({utcOffset()})</span>.
            </p>
            <p className="ws-small">
              This comes from your device. Streaks, skills and weekly judgements all follow it, and each day ends at
              midnight here.
            </p>
          </div>
        </Row>
      </SettingsSection>

      <SettingsSection title="Your record">
        <Row label="Export">
          <p className="settings-row__value">
            Download all {plural(entries.length, 'entry', 'entries')} as a text file, each with its date, time, gains
            and verdict. Your record stays here as well.
          </p>
          <Button
            className="settings-row__action"
            onClick={() => downloadJournal(entries, { email, classDay })}
            disabled={entries.length === 0}
          >
            <DownloadIcon />
            Export journal
          </Button>
        </Row>
        <Row label="Guide">
          <p className="settings-row__value">The rules of the System, written down.</p>
          <Link to="/codex" className="ws-btn ws-btn--secondary settings-row__action">
            Open the Codex
          </Link>
        </Row>
      </SettingsSection>

      <SettingsSection title="Session">
        <Row label="This device">
          <p className="settings-row__value">
            Signed in. Your entries are saved to your account and follow you to any device.
          </p>
          <Button className="settings-row__action" onClick={() => supabase.auth.signOut()}>
            <SignOutIcon />
            Sign out
          </Button>
        </Row>
      </SettingsSection>

      <DeleteSection />

      <p className="ws-small settings__legal">
        <Link to="/privacy">Privacy policy</Link> · <Link to="/terms">Terms of use</Link>
      </p>
    </main>
  )
}

function SettingsSection({ title, danger, children }) {
  const id = `settings-${title.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <section aria-labelledby={id} className={`ws-panel ws-grain ws-worn settings-section${danger ? ' settings-section--danger' : ''}`}>
      <h2 id={id} className="ws-heading settings-section__title">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ label, children }) {
  return (
    <div className="settings-row">
      <span className="ws-micro settings-row__label">{label}</span>
      {children}
    </div>
  )
}

function EmailRow({ email }) {
  const [editing, setEditing] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [message, setMessage] = useState(null) // { text, isError }
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: `${window.location.origin}/settings` },
    )
    setBusy(false)
    if (error) setMessage({ text: error.message, isError: true })
    else {
      setEditing(false)
      setNewEmail('')
      setMessage({ text: 'A confirmation link has been sent. The change applies once it is opened.', isError: false })
    }
  }

  return (
    <Row label="Email">
      <div className="settings-row__value">
        <span className="settings-row__email">{email}</span>
        {editing && (
          <form className="settings-row__form" onSubmit={handleSubmit}>
            <TextInput
              label="New email"
              type="email"
              autoComplete="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <div className="settings-row__buttons">
              <Button type="submit" size="sm" disabled={busy}>
                Send confirmation
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
        {message && (
          <p className={message.isError ? 'form-error' : 'ws-small'} role={message.isError ? 'alert' : 'status'}>
            {message.text}
          </p>
        )}
      </div>
      {!editing && (
        <Button className="settings-row__action" onClick={() => setEditing(true)}>
          Change email
        </Button>
      )}
    </Row>
  )
}

function DeleteSection() {
  const [confirming, setConfirming] = useState(false)
  const [typed, setTyped] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleDelete(e) {
    e.preventDefault()
    if (typed !== CONFIRM_WORD) return
    setBusy(true)
    setError(null)
    try {
      await deleteAccount()
      await supabase.auth.signOut()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <SettingsSection title="Delete account" danger>
      <Row label="Permanent">
        <div className="settings-row__value">
          <p>
            Erases every entry, level, skill and class. Nothing can be recovered afterwards, so export your journal
            first if you want a copy.
          </p>
          {confirming && (
            <form className="settings-row__form" onSubmit={handleDelete}>
              <TextInput
                label={`Type ${CONFIRM_WORD} to confirm`}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                autoFocus
              />
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="settings-row__buttons">
                <Button type="submit" variant="primary" size="sm" disabled={typed !== CONFIRM_WORD || busy}>
                  Delete everything
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setConfirming(false)
                    setTyped('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
        {!confirming && (
          <Button variant="primary" className="settings-row__action" onClick={() => setConfirming(true)}>
            Delete account
          </Button>
        )}
      </Row>
    </SettingsSection>
  )
}
