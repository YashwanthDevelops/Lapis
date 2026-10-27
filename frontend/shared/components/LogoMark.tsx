/** Lapis gemstone mark, drawn in `currentColor` to adapt to its context. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <mask id="lapis-mark-cutout" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect width="100" height="100" fill="black" />
          <path d="M50 5 86 25v49L50 95 14 74V25L50 5Z" fill="white" />
          <path d="M37 29h11v29h19v11H37z" fill="black" />
        </mask>
      </defs>
      <g mask="url(#lapis-mark-cutout)" fill="currentColor">
        <path d="M50 5 86 25v49L50 95 14 74V25L50 5Z" />
        <path d="M50 5 73 26 50 43 27 26Z" opacity=".22" />
        <path d="M14 25 27 26 50 43v52L14 74Z" opacity=".12" />
        <path d="M86 25 73 26 50 43v52l36-21Z" opacity=".08" />
      </g>
    </svg>
  );
}
