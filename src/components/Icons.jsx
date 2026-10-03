// Icons from the page designs: 24px grid, 1.5px square-capped strokes, currentColor.

function Icon({ size = 20, children }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {children}
    </svg>
  )
}

export const JournalIcon = () => (
  <Icon>
    <path d="M5 3h14v18H5z" />
    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
  </Icon>
)

export const StatusIcon = () => (
  <Icon>
    <path d="M4 13h4v8H4zM10 4h4v17h-4zM16 9h4v12h-4z" />
  </Icon>
)

export const ChronicleIcon = () => (
  <Icon>
    <path d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2" />
  </Icon>
)

export const SignOutIcon = () => (
  <Icon>
    <path d="M11 3H4v18h7" />
    <path d="M15 8l4 4-4 4M9 12h10" />
  </Icon>
)

export const LockIcon = () => (
  <Icon size={28}>
    <path d="M5 11h14v10H5z" />
    <path d="M8 11V6h8v5" />
    <path d="M12 15v2" />
  </Icon>
)
