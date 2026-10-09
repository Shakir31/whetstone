import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/whetstone.jsx'

// A scripted judgement for the landing page: visitors press the button, watch
// the System read the entry, and see the verdict and gains. No AI is called.
const SAMPLES = [
  {
    entry: '5 sets of weighted decline pushups, each to failure. Then read two chapters on Roman history.',
    verdict: 'Physical exertion recorded. Do not grow complacent.',
    gains: ['Body +0.7', 'Mind +0.3'],
  },
  {
    entry: 'Worked out and read a bit.',
    verdict: 'The System cannot judge what it cannot see.',
    gains: ['Body +0.2'],
  },
  {
    entry: 'Ran 8km before work in the rain, the last two at threshold pace.',
    verdict: 'Distance recorded. The cold is counted.',
    gains: ['Body +0.6'],
  },
  {
    entry: 'Two hours of Spanish grammar without my phone in the room, then twenty minutes of meditation.',
    verdict: 'Attention held. The System takes note.',
    gains: ['Mind +0.6'],
  },
]

const READING_MS = 1800

export default function LandingDemo() {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | reading | judged
  const timer = useRef(null)
  const sample = SAMPLES[index]

  useEffect(() => () => clearTimeout(timer.current), [])

  function judge() {
    setPhase('reading')
    timer.current = setTimeout(() => setPhase('judged'), READING_MS)
  }

  function nextSample() {
    setIndex((i) => (i + 1) % SAMPLES.length)
    setPhase('idle')
  }

  return (
    <figure className="ws-panel ws-grain ws-worn landing-sample" aria-label="Try a judgement">
      <div className="ws-micro landing-sample__head">
        <span>Today's deeds</span>
        <span>21:14</span>
      </div>

      <div className="landing-sample__field">
        <p className={`landing-sample__entry${phase === 'reading' ? ' landing-sample__entry--reading' : ''}`}>
          {sample.entry}
        </p>
        {phase === 'reading' && <div className="reading-line" aria-hidden="true" />}
      </div>

      <div className="landing-sample__result" aria-live="polite">
        {phase === 'idle' && <p className="ws-small landing-sample__hint">Press the button to see how the System judges this entry.</p>}
        {phase === 'reading' && <p className="reading-note">The System is reading…</p>}
        {phase === 'judged' && (
          <>
            <div className="landing-sample__verdict">
              <span className="system-tag">System</span>
              <p>{sample.verdict}</p>
            </div>
            <div className="ws-label landing-sample__gains">
              {sample.gains.map((gain, i) => (
                <span key={gain} style={{ animationDelay: `${600 + i * 300}ms` }}>
                  {gain}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="landing-sample__actions">
        {phase === 'judged' ? (
          <Button key="next" onClick={nextSample}>
            Another entry
          </Button>
        ) : (
          <Button key="judge" variant="primary" onClick={judge} disabled={phase === 'reading'}>
            {phase === 'reading' ? 'Judging' : 'Submit to judgement'}
          </Button>
        )}
      </div>
    </figure>
  )
}
