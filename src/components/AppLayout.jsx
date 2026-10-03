import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { ChronicleIcon, JournalIcon, SignOutIcon, StatusIcon } from './Icons.jsx'

const PAGES = [
  { to: '/', label: 'Journal', Icon: JournalIcon },
  { to: '/status', label: 'Status', Icon: StatusIcon },
  { to: '/chronicle', label: 'Chronicle', Icon: ChronicleIcon },
]

// The frame around every signed-in page: header with navigation (a bottom tab
// bar on phones), and the page itself. `context` is shared with every page.
export default function AppLayout({ context }) {
  return (
    <div className="surface">
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/" className="brand">
            Whetstone
          </NavLink>
          <nav aria-label="Primary">
            <ul className="nav-list">
              {PAGES.map(({ to, label, Icon }) => (
                <li key={to}>
                  <NavLink to={to} end className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
                    <Icon />
                    {label}
                  </NavLink>
                </li>
              ))}
              <li className="nav-item--signout">
                <button type="button" className="nav-link" onClick={() => supabase.auth.signOut()}>
                  <SignOutIcon />
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <Outlet context={context} />
    </div>
  )
}
