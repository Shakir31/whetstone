import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/whetstone.jsx'
import { LockIcon } from '../components/Icons.jsx'

const SEEN_KEY = 'whetstone.introSeen'

// Whether this browser has already shown the introduction.
export function introSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === 'yes'
  } catch {
    return true // storage unavailable: don't trap the person in the intro
  }
}

function markIntroSeen() {
  try {
    localStorage.setItem(SEEN_KEY, 'yes')
  } catch {
    // Nothing to do; the intro may show again next time.
  }
}

const STEPS = [Assigned, Write, Grow, Sealed]

// A short introduction shown once to someone with no entries yet.
export default function IntroPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const Step = STEPS[step]
  const last = step === STEPS.length - 1

  function finish() {
    markIntroSeen()
    navigate('/', { replace: true })
  }

  return (
    <div className="surface intro">
      <button type="button" className="ws-micro text-link intro__skip" onClick={finish}>
        Skip
      </button>
      <main className="intro__step" key={step}>
        <Step />
        <Button variant="primary" className="intro__next" onClick={last ? finish : () => setStep(step + 1)}>
          {last ? 'Begin' : 'Continue'}
        </Button>
        <div className="intro__progress" role="img" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <span key={i} className={i < step ? 'is-done' : i === step ? 'is-current' : ''} />
          ))}
        </div>
      </main>
    </div>
  )
}

function Assigned() {
  return (
    <>
      <span className="system-tag">System</span>
      <h1 className="intro__big">A System has been assigned to you.</h1>
      <p className="intro__note">From today, it will read what you record and weigh what you have done.</p>
    </>
  )
}

function Write() {
  return (
    <>
      <h1 className="intro__heading">Write</h1>
      <div className="intro__message">
        <span className="system-tag">System</span>
        <p className="intro__big intro__big--medium">Write down what you did today.</p>
        <p className="intro__note">
          Be specific. Sets, distances, pages and hours give the System something to weigh.
        </p>
      </div>
      <ul className="ws-panel ws-worn intro__compare" aria-label="Two entries compared">
        <li>
          <span className="intro__compare-text intro__compare-text--dim">Worked out.</span>
          <span className="ws-micro intro__compare-mark">Unseen</span>
        </li>
        <li>
          <span className="intro__compare-text">5 sets of weighted decline pushups, each to failure.</span>
          <span className="ws-micro intro__compare-mark intro__compare-mark--weighed">Weighed</span>
        </li>
      </ul>
    </>
  )
}

function Grow() {
  return (
    <>
      <h1 className="intro__heading">Grow</h1>
      <div className="intro__message">
        <span className="system-tag">System</span>
        <p className="intro__big intro__big--medium">
          Body grows with physical effort and Mind with mental effort. Will grows each day you return.
        </p>
      </div>
      <ul className="ws-panel ws-worn intro__levels" aria-label="Starting levels">
        {['Body', 'Mind', 'Will'].map((name) => (
          <li key={name}>
            <span className="ws-label">{name}</span>
            <span className="ws-numeral intro__level">Lv. 0</span>
            <div
              className="meter"
              role="progressbar"
              aria-label={`${name}, progress to Lv. 1`}
              aria-valuenow={0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </li>
        ))}
      </ul>
    </>
  )
}

function Sealed() {
  return (
    <>
      <span className="system-tag">System</span>
      <h1 className="intro__big">Some things stay hidden until you earn them.</h1>
      <div className="intro__sealed">
        <div className="ws-panel ws-worn intro__sealed-card">
          <span className="ws-micro">Skills</span>
          <div className="glimpse__well" role="img" aria-label="Skills, sealed">
            <div className="sealed__slots glimpse__slots">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
        <div className="ws-panel ws-worn intro__sealed-card">
          <span className="ws-micro">Class</span>
          <div className="glimpse__well glimpse__well--lock" role="img" aria-label="Class, sealed">
            <LockIcon />
            <span className="glimpse__bars">
              <span style={{ width: 56 }} />
              <span style={{ width: 32 }} />
            </span>
          </div>
        </div>
      </div>
      <p className="intro__note">Keep recording and they will open.</p>
    </>
  )
}
