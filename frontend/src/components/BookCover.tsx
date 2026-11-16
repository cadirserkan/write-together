import type { ReactNode } from 'react';

// The cloth colours a new book can get.
export const COVER_COLORS = [
  { value: '#3b62a8', name: 'Blauw' },
  { value: '#4c8c5a', name: 'Groen' },
  { value: '#8a3d63', name: 'Pruim' },
  { value: '#d39b22', name: 'Oker' },
  { value: '#b9502f', name: 'Baksteen' },
  { value: '#6a56b0', name: 'Paars' },
  { value: '#56616c', name: 'Leisteen' },
];

interface BookCoverProps {
  title: string;
  color: string;
  // The red bookmark ribbon: this book is waiting for your piece.
  ribbon?: boolean;
  children?: ReactNode;
}

export function BookCover({ title, color, ribbon = false, children }: BookCoverProps) {
  return (
    <span className="cover" style={{ backgroundColor: color, color: readableTextColor(color) }}>
      <span className="cover-title">{title}</span>
      <span className="cover-foot">{children}</span>
      {ribbon && <span className="ribbon" aria-hidden="true" />}
    </span>
  );
}

// Dark text on a light cover, light text on a dark one.
function readableTextColor(hex: string): string {
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
  return brightness > 150 ? '#1f2428' : '#fbfaf4';
}
