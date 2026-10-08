import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Panel, TextInput } from '../ui/whetstone.jsx'
import { supabase } from '../lib/supabase.js'
import AuthHero from '../components/AuthHero.jsx'

const COPY = {
  signIn: {
    line: 'The System is watching. Identify yourself.',
    button: 'Sign in',
    switchPrompt: 'No record yet?',
    switchLabel: 'Sign up',
    switchTo: '/signup',
  },
  signUp: {
    line: 'A System has been assigned to you.',
    button: 'Sign up',
    switchPrompt: 'Already recorded?',
    switchLabel: 'Sign in',
    switchTo: '/signin',
  },
}

// Sign in (/signin) or sign up (/signup).
export default function AuthPage({ mode }) {
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
        <AuthHero line={copy.line}>
          <p className="ws-small auth__blurb">
            Each day's deeds are written down and weighed. Body, Mind and Will rise with what you record.
          </p>
        </AuthHero>

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
          {!isSignUp && (
            <Link to="/forgot-password" className="ws-small auth__forgot">
              Forgot your password?
            </Link>
          )}
        </Panel>

        <p className="ws-small auth__switch">
          {copy.switchPrompt}{' '}
          <Link to={copy.switchTo} className="ws-label text-link">
            {copy.switchLabel}
          </Link>
        </p>
      </main>
    </div>
  )
}
