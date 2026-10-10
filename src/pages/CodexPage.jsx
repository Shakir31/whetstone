import { CLASS_DAILY_CAP, DAILY_CAP, DAYS_PER_WILL } from '../lib/stats.js'
import { DEMOTE_AFTER_DAYS, MAX_RANK, PHYSICAL_REST_DAYS_ALLOWED, REST_DAYS_ALLOWED, RUN_FOR_RANK, numeral } from '../lib/skills.js'
import { DAYS_PER_CLASS_RANK, EVOLVE_AT_RANK, FINAL_AT_RANK, WILL_FOR_CLASS } from '../lib/classes.js'
import { numberWord } from '../lib/format.js'

// The rules of the System, written as a short manual. The numbers come from
// the rule modules, so the Codex stays true if a rule changes. Achievements
// are deliberately left out.
const CHAPTERS = [
  { id: 'judgement', title: 'Judgement', body: Judgement },
  { id: 'measures', title: 'Body, Mind and Will', body: Measures },
  { id: 'limit', title: 'The daily limit', body: DailyLimit },
  { id: 'skills', title: 'Skills', body: Skills },
  { id: 'classes', title: 'Classes', body: Classes },
  { id: 'weekly', title: 'Weekly judgement', body: Weekly },
]

const CHAPTER_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI']

export default function CodexPage() {
  return (
    <main className="page page--codex">
      <div className="page-head page-head--ruled">
        <span className="ws-micro page-head__eyebrow">The rules of the System</span>
        <h1 className="ws-title">The Codex</h1>
      </div>

      <div className="codex">
        <nav aria-labelledby="toc-h" className="ws-panel ws-grain ws-worn codex__toc">
          <h2 id="toc-h" className="ws-micro codex__toc-title">
            Contents
          </h2>
          <ol>
            {CHAPTERS.map((chapter, i) => (
              <li key={chapter.id}>
                <a href={`#${chapter.id}`}>
                  <span className="codex__toc-num">{CHAPTER_NUMERALS[i]}</span>
                  <span className="ws-label codex__toc-name">{chapter.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="codex__chapters">
          {CHAPTERS.map(({ id, title, body: Body }, i) => (
            <li key={id} id={id} className="codex__chapter">
              <div className="codex__chapter-head">
                <span className="codex__num" aria-hidden="true">
                  {CHAPTER_NUMERALS[i]}
                </span>
                <h2 className="codex__chapter-title">{title}</h2>
              </div>
              <Body />
            </li>
          ))}
        </ol>
      </div>

      <div className="codex__end">
        <div className="auth__ornament" aria-hidden="true">
          <span />
          <span className="auth__lozenge" />
          <span />
        </div>
        <p>Not everything is written here.</p>
      </div>
    </main>
  )
}

function Judgement() {
  return (
    <>
      <p className="codex__text">
        Every entry is read in full. The System looks at what you did, how much of it, and how hard it was. Plans and
        good intentions earn nothing until they turn into deeds.
      </p>
      <p className="codex__text">
        Detail is rewarded. Counts, weights, distances and times give the System something to measure, so a specific
        entry can earn far more than a vague one. Writing more words does not help on its own.
      </p>
      <div className="codex__compare" aria-label="Two entries compared">
        <figure className="ws-panel ws-worn codex__example">
          <figcaption className="ws-micro">Vague</figcaption>
          <p className="codex__example-entry">Exercised and read a bit.</p>
          <p className="codex__example-verdict">The System cannot judge what it cannot see.</p>
          <span className="ws-micro codex__example-gains">Body +0.2</span>
        </figure>
        <figure className="ws-panel ws-worn codex__example">
          <figcaption className="ws-micro">Specific</figcaption>
          <p className="codex__example-entry">
            5 sets of weighted decline pushups, each to failure. Then read two chapters on Roman history.
          </p>
          <p className="codex__example-verdict">The exertion has been recorded. Do not grow complacent.</p>
          <span className="ws-micro codex__example-gains">
            <span>Body +0.7</span>
            <span>Mind +0.3</span>
          </span>
        </figure>
      </div>
      <p className="codex__text">A single entry can earn at most one point of Body and one of Mind.</p>
    </>
  )
}

function Measures() {
  return (
    <>
      <p className="codex__text">
        Three measures are kept, and each is shown as a level. Every level takes the same amount to fill.
      </p>
      <dl className="codex__terms">
        <div>
          <dt className="ws-label">Body</dt>
          <dd className="codex__text">
            Physical exertion: training, labour, distance, anything that taxes the body.
          </dd>
        </div>
        <div>
          <dt className="ws-label">Mind</dt>
          <dd className="codex__text">
            Deliberate mental effort: study, practice, and problems worked through. Watching or scrolling earns
            nothing.
          </dd>
        </div>
        <div>
          <dt className="ws-label">Will</dt>
          <dd className="codex__text">
            Discipline. Will rises by one for every {numberWord(DAYS_PER_WILL)} days in a row on which you record
            something of substance. Missing a day ends the streak, though Will you have already earned stays.
          </dd>
        </div>
      </dl>
    </>
  )
}

function DailyLimit() {
  return (
    <p className="codex__text">
      Body and Mind can each gain at most {DAILY_CAP} in a single day, however many entries you write. Once you
      receive a class, that limit rises to {CLASS_DAILY_CAP}. A day ends at midnight in your own time zone.
    </p>
  )
}

function Skills() {
  return (
    <>
      <p className="codex__text">
        When the same kind of deed is recorded {numberWord(RUN_FOR_RANK)} days in a row, the System gives it a name and
        it becomes a skill. Missing {REST_DAYS_ALLOWED === 1 ? 'a single day' : `up to ${numberWord(REST_DAYS_ALLOWED)} days`}{' '}
        between sessions will not break the run. Physical training such as lifting or running needs recovery, so it can
        rest for {numberWord(PHYSICAL_REST_DAYS_ALLOWED)} days in a row.
      </p>
      <p className="codex__text">
        Each further run of {numberWord(RUN_FOR_RANK)} days raises the skill one rank, up to Rank {numeral(MAX_RANK)}.
        A skill left alone for {DEMOTE_AFTER_DAYS === 7 ? 'a week' : `${numberWord(DEMOTE_AFTER_DAYS)} days`} loses a
        rank. If it falls below the first rank it is <em>Lost</em>, and another run brings it back.
      </p>
    </>
  )
}

function Classes() {
  return (
    <>
      <p className="codex__text">
        Once your Will reaches level {numberWord(WILL_FOR_CLASS)}, the System assigns you a class based on what you have
        done most, along with a title of its own choosing.
      </p>
      <p className="codex__text">
        The class gains a rank for every {numberWord(DAYS_PER_CLASS_RANK)} days you spend on its path. At Rank{' '}
        {numeral(EVOLVE_AT_RANK)} it changes form, shaped by whatever else you have been doing.
      </p>
      <p className="codex__text">
        At Rank {numeral(FINAL_AT_RANK)} it takes its final form. What you did after the first change matters, and so
        does how steadily you kept at it.
      </p>
    </>
  )
}

function Weekly() {
  return (
    <p className="codex__text">
      When a week ends, Monday to Sunday, the System looks back over it as a whole and writes a short judgement. You
      will find it at the top of the Journal, and it stays in the Chronicle. Each week is judged once.
    </p>
  )
}
