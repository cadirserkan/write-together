export function BellIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="bell">
      <path
        d="M12 3a6 6 0 0 0-6 6v3.6L4.3 15.4a1 1 0 0 0 .85 1.6h13.7a1 1 0 0 0 .85-1.6L18 12.6V9a6 6 0 0 0-6-6z"
        fill="currentColor"
      />
      <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0z" fill="currentColor" />
    </svg>
  );
}
