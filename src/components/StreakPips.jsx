// Small blocks showing progress through the current Will cycle: filled for each
// day done, hollow for each day still needed.
export default function StreakPips({ done, total }) {
  return (
    <div className="pips" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < done ? 'pip' : 'pip pip--empty'} />
      ))}
    </div>
  )
}
