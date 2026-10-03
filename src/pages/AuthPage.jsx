import { useState } from 'react'
import { Button, Panel, TextInput } from '../ui/whetstone.jsx'
import { supabase } from '../lib/supabase.js'

const COPY = {
  signIn: {
    line: 'The System is watching. Identify yourself.',
    button: 'Sign in',
    switchPrompt: 'No record yet?',
    switchLabel: 'Sign up',
  },
  signUp: {
    line: 'A System has been assigned to you.',
    button: 'Sign up',
    switchPrompt: 'Already recorded?',
    switchLabel: 'Sign in',
  },
}

export default function AuthPage() {
  const [mode, setMode] = useState('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null) // { text, isError }
  const [busy, setBusy] = useState(false)

  const isSignUp = mode === 'signUp'
  const copy = COPY[mode]

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)

    if (error) setMessage({ text: error.message, isError: true })
    else if (isSignUp && !data.session) {
      setMessage({ text: 'Check your email to confirm your account.', isError: false })
    }
  }

  return (
    <div className="surface auth-page">
      <main className="auth">
        <div className="auth__hero">
          <h1 className="auth__name">Whetstone</h1>
          <div className="auth__ornament" aria-hidden="true">
            <span />
            <span className="auth__lozenge" />
            <span />
          </div>
          <p className="auth__line">{copy.line}</p>
          <p className="ws-small auth__blurb">
            Each day's deeds are written down and weighed. Body, Mind and Will rise only by what is recorded.
          </p>
        </div>

        <Panel as="form" className="auth__form" onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextInput
            label="Password"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            hint={isSignUp ? 'At least 6 characters.' : undefined}
          />
          {message && (
            <p className={message.isError ? 'form-error' : 'ws-small'} role={message.isError ? 'alert' : 'status'}>
              {message.text}
            </p>
          )}
          <Button type="submit" variant="primary" block disabled={busy}>
            {copy.button}
          </Button>
        </Panel>

        <p className="ws-small auth__switch">
          {copy.switchPrompt}{' '}
          <button
            type="button"
            className="ws-label text-link"
            onClick={() => {
              setMode(isSignUp ? 'signIn' : 'signUp')
              setMessage(null)
            }}
          >
            {copy.switchLabel}
          </button>
        </p>
      </main>
    </div>
  )
}
