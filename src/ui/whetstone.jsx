// Whetstone design system components, ported from
// design/whetstone-design-system/components/bundle.js. Styles: src/styles/whetstone.css.

import { useId } from 'react'

const cx = (...classes) => classes.filter(Boolean).join(' ')

// primary: dried-blood fill, once per screen. secondary (default): iron outline. ghost: text only.
export function Button({ variant = 'secondary', size, block, className, type = 'button', ...rest }) {
  return (
    <button
      type={type}
      {...rest}
      className={cx(
        'ws-btn',
        `ws-btn--${variant}`,
        size === 'sm' && 'ws-btn--sm',
        block && 'ws-btn--block',
        className,
      )}
    />
  )
}

export function TextInput({ label, hint, error, id, className, ...rest }) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = hint ? `${inputId}-hint` : undefined
  return (
    <div className={cx('ws-field', error && 'ws-field--error', className)}>
      {label && (
        <div className="ws-field__top">
          <label htmlFor={inputId} className="ws-field__label ws-label">
            {label}
          </label>
        </div>
      )}
      <input
        type="text"
        {...rest}
        id={inputId}
        className="ws-input"
        aria-describedby={hintId}
        aria-invalid={error || undefined}
      />
      {hint && (
        <p id={hintId} className="ws-field__hint">
          {hint}
        </p>
      )}
    </div>
  )
}

// A grained, chipped-stone panel. Pass `as` to render a different element (e.g. a form).
export function Panel({ title, eyebrow, actions, worn = true, as: Tag = 'section', className, children, ...rest }) {
  const hasHead = title || eyebrow || actions
  return (
    <Tag {...rest} className={cx('ws-panel ws-grain', worn && 'ws-worn', className)}>
      {hasHead && (
        <header className="ws-panel__head">
          <div>
            {eyebrow && <span className="ws-panel__eyebrow ws-micro">{eyebrow}</span>}
            {title && <h2 className="ws-heading">{title}</h2>}
          </div>
          {actions && <div className="ws-panel__actions">{actions}</div>}
        </header>
      )}
      {children}
    </Tag>
  )
}

export function LevelUp({ stat, from, to, note, word = 'Level up', className }) {
  return (
    <div className={cx('ws-levelup', className)} role="status" aria-live="polite">
      <div className="ws-levelup__band ws-grain" aria-hidden="true" />
      <span className="ws-levelup__rule ws-levelup__rule--top" aria-hidden="true" />
      <span className="ws-levelup__rule ws-levelup__rule--bottom" aria-hidden="true" />
      <p className="ws-levelup__word ws-display">{word}</p>
      {stat && (
        <div className="ws-levelup__line ws-label">
          <span className="ws-levelup__stat">{stat}</span>
          {from != null && <span>Lv. {from}</span>}
          {from != null && (
            <span className="ws-levelup__arrow" aria-label="to">
              →
            </span>
          )}
          {to != null && <span className="ws-levelup__stat">Lv. {to}</span>}
        </div>
      )}
      {note && <p className="ws-levelup__note">{note}</p>}
    </div>
  )
}

export function SystemMessage({ kind = 'notice', label, meta, title, verdict, className, children }) {
  const who =
    label ?? (kind === 'warning' ? 'System · Warning' : kind === 'verdict' ? 'System · Verdict' : 'System')
  return (
    <aside className={cx('ws-sys ws-grain', `ws-sys--${kind}`, className)} role={kind === 'warning' ? 'alert' : 'note'}>
      {['tl', 'tr', 'bl', 'br'].map((corner) => (
        <span key={corner} className={`ws-sys__corner ws-sys__corner--${corner}`} aria-hidden="true" />
      ))}
      <div className="ws-sys__head">
        <span className="ws-sys__sigil" aria-hidden="true" />
        <span className="ws-sys__who ws-micro">{who}</span>
        {meta && <span className="ws-sys__meta ws-micro">{meta}</span>}
      </div>
      {title && <h3 className="ws-sys__title ws-heading">{title}</h3>}
      {children && <div className="ws-sys__body">{children}</div>}
      {verdict && <p className="ws-sys__verdict">{verdict}</p>}
    </aside>
  )
}

export function Tag({ tone = 'neutral', className, children }) {
  return <span className={cx('ws-tag', tone !== 'neutral' && `ws-tag--${tone}`, className)}>{children}</span>
}

// plain rule, heavy double rule, or ornament (a small lozenge, or a label, in the middle).
export function Divider({ variant = 'plain', label, className }) {
  if (variant === 'ornament') {
    return (
      <div className={cx('ws-divider ws-divider--ornament', className)} role="separator">
        {label ? (
          <span className="ws-divider__label ws-micro">{label}</span>
        ) : (
          <span className="ws-divider__mark" aria-hidden="true" />
        )}
      </div>
    )
  }
  return <hr className={cx('ws-divider', variant === 'heavy' && 'ws-divider--heavy', className)} />
}

// A progress meter in the style of the page designs: iron track, blood fill.
export function Meter({ label, progress, className }) {
  return (
    <div
      className={cx('meter', className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="meter__fill" style={{ width: `${progress}%` }} />
    </div>
  )
}
