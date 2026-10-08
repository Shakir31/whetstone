import { Link } from 'react-router-dom'

// Footer for the public pages: the name, and links to the legal pages.
export default function SiteFooter({ showSignIn = true }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link to="/" className="site-footer__brand">
          Whetstone
        </Link>
        <nav aria-label="Footer">
          <ul className="site-footer__links">
            <li>
              <Link to="/privacy" className="ws-micro site-footer__link">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="ws-micro site-footer__link">
                Terms
              </Link>
            </li>
            {showSignIn && (
              <li>
                <Link to="/signin" className="ws-micro site-footer__link">
                  Sign in
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
