import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

// True when someone asked their system for less motion. Animations written in
// JavaScript (like the typing demo) use this; CSS animations use the media query itself.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}
