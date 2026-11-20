import { useEffect, useState } from 'react';

// After this long, the backend is most likely waking up from sleep.
const WAKING_AFTER_MS = 4_000;
// After this long, something is probably really wrong: offer a reload.
const STUCK_AFTER_MS = 100_000;

type Stage = 'loading' | 'waking' | 'stuck';

export function LoadingScreen() {
  const [stage, setStage] = useState<Stage>('loading');

  useEffect(() => {
    const waking = window.setTimeout(() => setStage('waking'), WAKING_AFTER_MS);
    const stuck = window.setTimeout(() => setStage('stuck'), STUCK_AFTER_MS);
    return () => {
      window.clearTimeout(waking);
      window.clearTimeout(stuck);
    };
  }, []);

  return (
    <div className="loading-screen" role="status">
      <span className="flip-book" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>

      {stage === 'loading' ? (
        <p>Even laden...</p>
      ) : (
        <>
          <p className="loading-title">De server wordt wakker</p>
          <p>
            Als niemand de app een tijdje gebruikt, valt de server in slaap. Opstarten duurt meestal minder dan een
            minuut. Daarna gaat alles weer vlot.
          </p>
        </>
      )}

      {stage === 'stuck' && (
        <>
          <p>Dit duurt langer dan normaal.</p>
          <button type="button" className="button" onClick={() => window.location.reload()}>
            Pagina opnieuw laden
          </button>
        </>
      )}
    </div>
  );
}
