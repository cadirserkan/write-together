// The logo: an open book with the W on one page and the T on the other, one page for each writer.
// The same drawing is in public/favicon.svg, there on a dark green square.
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Write Together">
      <path d="M4 17.5C13 14 25 14.5 32 19c7-4.5 19-5 28-1.5V53c-9-3-21-2.5-28 2-7-4.5-19-5-28-2z" fill="#c9a06a" />
      <path d="M7 15c8-3.5 19-3 25 1.5V50c-6-4-17-4.5-25-1.5z" fill="#fbfaf4" />
      <path d="M57 15c-8-3.5-19-3-25 1.5V50c6-4 17-4.5 25-1.5z" fill="#efecdf" />
      <path d="M29.5 49h5v13L32 59.5l-2.5 2.5z" fill="#e0452f" />
      <g fill="none" stroke="#213b3a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.5 24l3.5 14 4-9.5 4 9.5 3.5-14" />
        <path d="M37.5 24h14M44.5 24v14" />
      </g>
    </svg>
  );
}
