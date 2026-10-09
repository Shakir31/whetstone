// The Whetstone mark: the divider lozenge with its right corner ground flat,
// the shaving beside it, and a solid core. The core takes the text colour
// (bone on dark), so the mark adapts to its background. Master file:
// design/logo/whetstone-mark.svg.
export function LogoMark({ size = 24, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <polygon
        points="15,3.5 24,12.5 24,19.5 15,28.5 2.5,16"
        fill="none"
        stroke="var(--blood-bar)"
        strokeWidth="2.5"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
      />
      <polygon points="15,10 20.5,15.5 20.5,16.5 15,22 9,16" fill="currentColor" />
      <polygon points="27,12 29.5,14.5 29.5,17.5 27,20" fill="var(--blood-bar)" />
    </svg>
  )
}
