import { Link } from 'react-router-dom'
import { shortDay, time } from '../lib/format.js'
import Gains from './Gains.jsx'

const SHOWN = 3

export default function RecentEntries({ entries }) {
  return (
    <section aria-labelledby="recent-title" className="recent">
      <div className="section-head">
        <h2 id="recent-title" className="ws-heading">
          Recent entries
        </h2>
        {entries.length > 0 && (
          <Link to="/chronicle" className="ws-micro text-link">
            View chronicle
          </Link>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="empty">Nothing has been recorded. The System waits.</p>
      ) : (
        <ol className="recent__list">
          {entries.slice(0, SHOWN).map((entry) => (
            <li key={entry.id} className="recent__row">
              <div className="recent__when">
                <span className="ws-micro recent__day">{shortDay(entry.createdAt)}</span>
                <span className="ws-small">{time(entry.createdAt)}</span>
              </div>
              <p className="ws-entry recent__text">{entry.text}</p>
              <Gains entry={entry} />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
