export default function SystemMessage({ message, onDismiss }) {
  return (
    <div className="system-message" role="status">
      <span className="system-label">[ SYSTEM ]</span>
      <p>{message}</p>
      <button type="button" className="dismiss" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
