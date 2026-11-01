import { Link } from 'react-router-dom'
import { LockIcon } from '../components/Icons.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import LandingDemo from '../components/LandingDemo.jsx'
import { LogoMark } from '../components/Logo.jsx'

const STEPS = [
  { label: 'Write', line: 'Write what you did today.', note: 'Write it however you like, as a list or a few sentences.' },
  { label: 'Weigh', line: 'The System weighs it.', note: 'Each deed is scored for the effort it took.' },
  { label: 'Rise', line: 'Body, Mind and Will rise.', note: 'They grow a little with each day you write.' },
]

// The public front page for visitors who aren't signed in.
export default function LandingPage() {
  return (
    <div className="surface landing">
      <main>
        <section className="landing-hero" aria-labelledby="hero-name">
          <LogoMark size={72} className="landing-hero__mark" />
          <span className="ws-micro landing-hero__eyebrow">Day 1</span>
          <h1 id="hero-name" className="landing-hero__name">
            Whetstone
          </h1>
          <div className="auth__ornament landing-hero__ornament" aria-hidden="true">
            <span />
            <span className="auth__lozenge" />
            <span />
          </div>
          <p className="landing-hero__line">Write down what you did each day, and the System will judge it.</p>
          <div className="landing-hero__actions">
            <Link to="/signup" className="ws-btn ws-btn--primary landing-cta">
              Begin
            </Link>
            <Link to="/signin" className="ws-micro text-link">
              Sign in
            </Link>
          </div>
          <span className="landing-hero__descent" aria-hidden="true" />
        </section>

        <section className="landing-section" aria-labelledby="how-h">
          <div className="page-head page-head--ruled">
            <span className="ws-micro page-head__eyebrow">How it works</span>
            <h2 id="how-h" className="ws-title">
              The daily rite
            </h2>
          </div>
          <div className="landing-how">
            <ol className="landing-steps">
              {STEPS.map((step, i) => (
                <li key={step.label} className="landing-step">
                  <span className="landing-step__number" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="landing-step__body">
                    <span className="ws-label landing-step__label">{step.label}</span>
                    <p className="landing-step__line">{step.line}</p>
                    <p className="landing-step__note">{step.note}</p>
                  </div>
                </li>
              ))}
            </ol>

            <LandingDemo />
          </div>
        </section>

        <section className="landing-section landing-section--glimpses" aria-labelledby="await-h">
          <div className="page-head page-head--ruled">
            <span className="ws-micro page-head__eyebrow">Glimpses</span>
            <h2 id="await-h" className="ws-title">
              What awaits
            </h2>
          </div>
          <ul className="landing-glimpses">
            <li className="ws-panel ws-grain ws-worn glimpse">
              <h3 className="ws-heading">Levels</h3>
              <div className="glimpse__well">
                <span className="ws-numeral glimpse__level">Lv. 7</span>
                <div className="meter glimpse__meter" aria-hidden="true">
                  <div className="meter__fill" style={{ width: '40%' }} />
                </div>
              </div>
              <p className="glimpse__text">Body, Mind and Will each climb one level at a time.</p>
            </li>
            <li className="ws-panel ws-grain ws-worn glimpse">
              <div className="glimpse__head">
                <h3 className="ws-heading">Skills</h3>
                <span className="ws-tag">Sealed</span>
              </div>
              <div className="glimpse__well" aria-hidden="true">
                <div className="sealed__slots glimpse__slots">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <p className="glimpse__text">Keep doing something for long enough and it becomes a named skill.</p>
            </li>
            <li className="ws-panel ws-grain ws-worn glimpse">
              <div className="glimpse__head">
                <h3 className="ws-heading">Class</h3>
                <span className="ws-tag">Sealed</span>
              </div>
              <div className="glimpse__well glimpse__well--lock">
                <LockIcon />
                <span className="glimpse__bars" role="img" aria-label="Class name sealed">
                  <span style={{ width: 72 }} />
                  <span style={{ width: 44 }} />
                </span>
              </div>
              <p className="glimpse__text">Once your Will is strong enough, you're given a class, and it changes with what you do after.</p>
            </li>
            <li className="ws-panel ws-grain ws-worn glimpse">
              <div className="glimpse__head">
                <h3 className="ws-heading">Judgement</h3>
                <span className="ws-tag">Weekly</span>
              </div>
              <div className="glimpse__well glimpse__well--week">
                <div className="ws-divider ws-divider--ornament" aria-hidden="true">
                  <span className="ws-divider__label ws-micro">Week I</span>
                </div>
                <span className="glimpse__bars glimpse__bars--stacked" role="img" aria-label="Verdict sealed">
                  <span style={{ width: 150 }} />
                  <span style={{ width: 96 }} />
                </span>
              </div>
              <p className="glimpse__text">At the end of each week, the System looks back over it.</p>
            </li>
          </ul>
        </section>

        <section className="landing-close" aria-labelledby="close-h">
          <span className="system-tag">System</span>
          <h2 id="close-h" className="landing-close__line">
            The System keeps a record of every day you write.
          </h2>
          <Link to="/signup" className="ws-btn ws-btn--primary landing-cta">
            Begin
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
