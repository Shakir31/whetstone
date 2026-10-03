import { gainsOf } from '../lib/format.js'

// "BODY +0.7  MIND +0.3", or "None" when nothing was gained.
export default function Gains({ entry, className = '' }) {
  const gains = gainsOf(entry)
  if (gains.length === 0) {
    return <div className={`gains gains--none ws-micro ${className}`}>None</div>
  }
  return (
    <div className={`gains ws-micro ${className}`}>
      {gains.map(({ stat, amount }) => (
        <span key={stat}>
          {stat} +{amount}
        </span>
      ))}
    </div>
  )
}
