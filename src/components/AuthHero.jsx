import { Link } from 'react-router-dom'

// The WHETSTONE name, ornament and a line from the System: the top of the
// sign-in, sign-up and password pages. The name leads back to the landing page.
export default function AuthHero({ line, as: Heading = 'h1', children }) {
  return (
    <div className="auth__hero">
      <Link to="/" className="auth__name">
        Whetstone
      </Link>
      <div className="auth__ornament" aria-hidden="true">
        <span />
        <span className="auth__lozenge" />
        <span />
      </div>
      <Heading className="auth__line">{line}</Heading>
      {children}
    </div>
  )
}
