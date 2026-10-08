import { Link } from 'react-router-dom'

// Shown for any address Whetstone doesn't know.
export default function NotFoundPage({ signedIn }) {
  return (
    <div className="surface auth-page">
      <main className="not-found">
        <span className="ws-micro not-found__eyebrow">Error 404</span>
        <h1 className="not-found__title">Not recorded</h1>
        <div className="auth__ornament" aria-hidden="true">
          <span />
          <span className="auth__lozenge" />
          <span />
        </div>
        <p className="auth__line">The System has no record of this place.</p>
        <Link to="/" className="ws-btn ws-btn--primary not-found__action">
          {signedIn ? 'Return to the Journal' : 'Return to Whetstone'}
        </Link>
      </main>
    </div>
  )
}
