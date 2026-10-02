export default function SystemMessage({ entry, onDismiss }) {
  const gains = []
  if (entry.body > 0) gains.push(`BODY +${entry.body}`)
  if (entry.mind > 0) gains.push(`MIND +${entry.mind}`)

  return (
    <div className="system-message" role="status">
      <span className="system-label">[ SYSTEM ]</span>
      <p>{entry.systemMessage}</p>
      {gains.length > 0 && <p className="system-gains">{gains.join('  ·  ')}</p>}
      <button type="button" className="dismiss" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
