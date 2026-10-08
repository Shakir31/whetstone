import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Panel, TextInput } from '../ui/whetstone.jsx'
import { supabase } from '../lib/supabase.js'
import AuthHero from '../components/AuthHero.jsx'

// Sends a password reset link. The link opens /reset-password.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setBusy(false)
    // Supabase doesn't reveal whether an address exists, and neither do we.
    if (sendError) setError(sendError.message)
    else setSent(true)
  }

  return (
    <div className="surface auth-page">
      <main className="auth">
        <AuthHero line="The System will send you a way back in." />

        {sent ? (
          <>
            <Panel className="auth__notice" role="status">
              <span className="system-tag">System</span>
              <p className="auth__notice-text">If that address is on record, a link has been sent to it.</p>
              <p className="ws-small">
                Nothing arrived? Check your spam folder, or{' '}
                <button type="button" className="inline-link" onClick={() => setSent(false)}>
                  send it again
                </button>
                .
              </p>
            </Panel>
            <Link to="/signin" className="ws-btn ws-btn--secondary">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <Panel as="form" className="auth__form" onSubmit={handleSubmit}>
              <TextInput
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" variant="primary" block disabled={busy}>
                Send link
              </Button>
            </Panel>
            <p className="ws-small auth__switch">
              Remembered it?{' '}
              <Link to="/signin" className="ws-label text-link">
                Sign in
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  )
}
