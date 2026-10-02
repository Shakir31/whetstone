import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function AuthForm() {
  const [mode, setMode] = useState('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  const isSignUp = mode === 'signUp'

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)

    if (error) setMessage(error.message)
    else if (isSignUp && !data.session) setMessage('Check your email to confirm your account.')
  }

  return (
    <form className="panel auth-form" onSubmit={handleSubmit}>
      <h2>{isSignUp ? 'Begin your journey' : 'Return to the journal'}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <input
        type="password"
        placeholder="Password (6+ characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        autoComplete={isSignUp ? 'new-password' : 'current-password'}
      />
      <button type="submit" className="primary" disabled={busy}>
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </button>
      {message && <p className="form-message">{message}</p>}
      <button
        type="button"
        className="link"
        onClick={() => {
          setMode(isSignUp ? 'signIn' : 'signUp')
          setMessage(null)
        }}
      >
        {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
      </button>
    </form>
  )
}
