import { Fragment, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Button, Divider, Panel } from '../ui/whetstone.jsx'
import { entriesByDay } from '../lib/stats.js'
import { classDayOf } from '../lib/classes.js'
import { dayMonth, longDate, plural, time } from '../lib/format.js'
import { weekKeyOf } from '../lib/weekly.js'
import Gains from '../components/Gains.jsx'
import WeeklySummary from '../components/WeeklySummary.jsx'

const DAYS_PER_PAGE = 7

export default function ChroniclePage() {
  const { entries, playerClass, weeklySummaries } = useOutletContext()
  const classDay = classDayOf(playerClass)
  const days = useMemo(() => entriesByDay(entries, classDay), [entries, classDay])
  const [shownDays, setShownDays] = useState(DAYS_PER_PAGE)
  const visible = days.slice(0, shownDays)

  return (
    <main className="page page--chronicle">
      <div className="page-head page-head--ruled page-head--split">
        <div className="page-head">
          <span className="ws-micro page-head__eyebrow">Record of deeds</span>
          <h1 className="ws-title">The chronicle</h1>
        </div>
        {days.length > 0 && <span className="ws-small">Newest first</span>}
      </div>

      {days.length === 0 && (
        <p className="empty">
          The chronicle is empty. <Link to="/">Record today's deeds.</Link>
        </p>
      )}

      {visible.map((day, i) => {
        // Newest first, so a week's judgement sits above that week's days.
        const week = weekKeyOf(day.date)
        const weekStartsHere = i === 0 || weekKeyOf(visible[i - 1].date) !== week
        return (
          <Fragment key={day.key}>
            {weekStartsHere && weeklySummaries[week] && (
              <WeeklySummary weekKey={week} summary={weeklySummaries[week]} />
            )}
            <Panel aria-label={longDate(day.date)} className="day">
              <div className="day__head">
                <h2 className="ws-heading day__title">
                  {longDate(day.date)} <span className="ws-micro day__count">{plural(day.entries.length, 'entry', 'entries')}</span>
                </h2>
                {day.body > 0 || day.mind > 0 ? (
                  <Gains entry={day} className="day__totals" />
                ) : (
                  <p className="ws-label day__none">No gains</p>
                )}
              </div>
              <ol className="day__entries">
                {day.entries.map((entry) => (
                  <li key={entry.id} className="chronicle-row">
                    <span className="ws-small chronicle-row__time">{time(entry.createdAt)}</span>
                    <div className="chronicle-row__body">
                      <p className="ws-entry">{entry.text}</p>
                      {entry.systemMessage && (
                        <p className="chronicle-row__verdict">
                          <span className="ws-micro">System</span>
                          {entry.systemMessage}
                        </p>
                      )}
                    </div>
                    <Gains entry={entry} className="chronicle-row__gains" />
                  </li>
                ))}
              </ol>
            </Panel>
          </Fragment>
        )
      })}

      {visible.length > 0 && (
        <div className="chronicle-foot">
          <Divider variant="ornament" />
          {days.length > shownDays && (
            <Button onClick={() => setShownDays((n) => n + DAYS_PER_PAGE)}>Load older entries</Button>
          )}
          <span className="ws-small">
            Showing {dayMonth(visible[0].date)}
            {visible.length > 1 && ` to ${dayMonth(visible[visible.length - 1].date)}`}
          </span>
        </div>
      )}
    </main>
  )
}
