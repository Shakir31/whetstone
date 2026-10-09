import { Link } from 'react-router-dom'
import { BackIcon } from '../components/Icons.jsx'
import { LogoMark } from '../components/Logo.jsx'
import { CONTACT_EMAIL, LEGAL_UPDATED } from '../lib/site.js'

// The privacy policy (/privacy) and terms (/terms). Plain reading pages that
// work whether or not the person is signed in.
export default function LegalPage({ doc }) {
  const { title, sections } = DOCS[doc]

  return (
    <div className="legal">
      <header className="legal__header">
        <div className="legal__bar">
          <Link to="/" className="brand">
            <LogoMark size={24} />
            Whetstone
          </Link>
          <nav aria-label="Legal">
            <ul className="legal__tabs">
              <li>
                <Link to="/privacy" className="legal__tab" aria-current={doc === 'privacy' ? 'page' : undefined}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="legal__tab" aria-current={doc === 'terms' ? 'page' : undefined}>
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="legal__main">
        <div className="page-head page-head--ruled">
          <span className="ws-micro page-head__eyebrow">Legal</span>
          <h1 className="ws-title">{title}</h1>
          <p className="ws-small">Last updated {LEGAL_UPDATED}</p>
        </div>

        <nav aria-labelledby="legal-toc" className="legal__toc">
          <h2 id="legal-toc" className="ws-micro">
            Contents
          </h2>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="legal__section">
            <h2 className="ws-heading">
              {i + 1}. {s.title}
            </h2>
            {s.body}
          </section>
        ))}
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <Link to="/" className="ws-micro site-footer__link site-footer__back">
            <BackIcon />
            Back to Whetstone
          </Link>
        </div>
      </footer>
    </div>
  )
}

function Contact() {
  return CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  ) : (
    <span className="legal__placeholder">[contact email]</span>
  )
}

const DOCS = {
  privacy: {
    title: 'Privacy policy',
    sections: [
      {
        id: 'collected',
        title: 'What is collected',
        body: (
          <>
            <p>When you create an account, Whetstone stores your email address and a securely hashed form of your password.</p>
            <p>When you use Whetstone, it stores:</p>
            <ul>
              <li>the entries you write, with the date and time of each;</li>
              <li>the judgements, gains, skills, class, achievements and weekly summaries that come from them;</li>
              <li>small preferences, such as the title you have chosen to wear.</li>
            </ul>
            <p>
              Your device's time zone is used to work out where your days begin and end. A few conveniences, such as an
              unsent draft, are kept only in your browser.
            </p>
          </>
        ),
      },
      {
        id: 'used',
        title: 'How it is used',
        body: (
          <>
            <p>
              Your entries are used to produce the judgements and progress shown in your account. Your email address is
              used to sign you in and to send account emails, such as password reset links.
            </p>
            <p>
              To judge an entry, its text is sent to Google's Gemini service, which returns the scores and the System's
              verdict. The same happens once a week for the weekly judgement, using that week's entries. Whetstone
              currently uses Gemini's free tier, under which Google may use the content it receives to improve its
              products. Avoid writing anything in an entry that you would not want shared on those terms.
            </p>
          </>
        ),
      },
      {
        id: 'shared',
        title: 'Who it is shared with',
        body: (
          <>
            <p>Your entries are never sold, and they are never shown to other people.</p>
            <p>A few services handle data so that Whetstone can run:</p>
            <ul>
              <li>Supabase stores your account and entries, and runs the code that judges them.</li>
              <li>Vercel hosts the website itself.</li>
              <li>Google processes entries through Gemini, as described above.</li>
            </ul>
            <p>These services may store or process data outside your country.</p>
          </>
        ),
      },
      {
        id: 'kept',
        title: 'How long it is kept',
        body: (
          <p>
            Your data is kept for as long as your account exists. When you delete your account from Settings, your
            entries, judgements, skills, class and achievements are erased straight away. Copies may remain in the
            service providers' backups for a limited time before they are overwritten.
          </p>
        ),
      },
      {
        id: 'choices',
        title: 'Your choices',
        body: (
          <p>
            From Settings you can export your journal as a file, change your email address or password, and delete your
            account. For anything else about your data, get in touch using the address below.
          </p>
        ),
      },
      {
        id: 'contact',
        title: 'Contact',
        body: (
          <p>
            Questions about this policy can be sent to <Contact />.
          </p>
        ),
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    sections: [
      {
        id: 'using',
        title: 'Using Whetstone',
        body: (
          <p>
            Whetstone is a journal that turns what you record into stats, skills and progress. By creating an account,
            you agree to these terms. If you do not agree, please do not use Whetstone.
          </p>
        ),
      },
      {
        id: 'account',
        title: 'Your account',
        body: (
          <p>
            You are responsible for keeping your password safe and for what is done with your account. Use an email
            address you can access, since it is how you recover the account.
          </p>
        ),
      },
      {
        id: 'entries',
        title: 'Your entries',
        body: (
          <p>
            What you write belongs to you. You allow Whetstone to store your entries and to process them, including
            through the services listed in the privacy policy, so that it can judge them and show your progress. You
            can export or delete them at any time.
          </p>
        ),
      },
      {
        id: 'judgements',
        title: "The System's judgements",
        body: (
          <p>
            Judgements, scores and summaries are produced automatically by an AI model. They can be wrong, and they are
            part of a game. Nothing in Whetstone is medical, fitness or professional advice. Train and study within your
            own limits.
          </p>
        ),
      },
      {
        id: 'conduct',
        title: 'Fair use',
        body: (
          <p>
            Please do not try to break, overload or misuse Whetstone, interfere with other people's accounts, or use it
            to store anything unlawful.
          </p>
        ),
      },
      {
        id: 'availability',
        title: 'Availability and changes',
        body: (
          <p>
            Whetstone is provided as it is, without guarantees that it will always be available or free of errors.
            Features and rules may change over time. If these terms change in an important way, the date at the top of
            this page will change too.
          </p>
        ),
      },
      {
        id: 'ending',
        title: 'Ending your account',
        body: (
          <p>
            You can delete your account at any time from Settings. Accounts that break these terms may be suspended or
            removed.
          </p>
        ),
      },
      {
        id: 'contact',
        title: 'Contact',
        body: (
          <p>
            Questions about these terms can be sent to <Contact />.
          </p>
        ),
      },
    ],
  },
}
