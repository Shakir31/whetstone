import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Panel, TextInput } from '../ui/whetstone.jsx'
import { supabase } from '../lib/supabase.js'
import AuthHero from '../components/AuthHero.jsx'

const MIN_LENGTH = 6

// Choose a new password. Reached from the reset email (the link signs the
// person in) or from Settings → Change password. Without a session, the link
// has expired or was already used.
export default function ResetPasswordPage({ signedIn }) {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const mismatch = confirm.length > 0 && confirm !== password

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) return
    setBusy(true)
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (updateError) setError(updateError.message)
    else setDone(true)
  }

  if (!signedIn) {
    return (
      <div className="surface auth-page">
        <main className="auth">
          <AuthHero line="This link has expired or has already been used." />
          <Link to="/forgot-password" className="ws-btn ws-btn--primary">
            Send a new link
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="surface auth-page">
      <main className="auth">
        <AuthHero line={done ? 'The new password is set.' : 'Choose a new password.'} />

        {done ? (
          <Button variant="primary" onClick={() => navigate('/')}>
            Go to the Journal
          </Button>
        ) : (
          <Panel as="form" className="auth__form" onSubmit={handleSubmit}>
            <TextInput
              label="New password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={MIN_LENGTH}
              hint={`At least ${MIN_LENGTH} characters.`}
            />
            <TextInput
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              error={mismatch}
              hint={mismatch ? 'The passwords do not match.' : undefined}
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" block disabled={busy || mismatch}>
              Set password
            </Button>
          </Panel>
        )}
      </main>
    </div>
  )
}
