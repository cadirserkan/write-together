import { useEffect, useState } from 'react';
import { messageOf } from '../api/client';
import { disablePush, enablePush, getPushState, PUSH_CHANGED, type PushState } from '../push';

export function NotificationButton() {
  const [state, setState] = useState<PushState>('unavailable');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const check = () => {
      getPushState()
        .then(setState)
        .catch(() => setState('unavailable'));
    };
    check();
    window.addEventListener(PUSH_CHANGED, check);
    return () => window.removeEventListener(PUSH_CHANGED, check);
  }, []);

  // No button when this browser or this server cannot send notifications.
  // On an iPhone the hint on the book page explains how to get them.
  if (state === 'unavailable' || state === 'needs-install') {
    return null;
  }

  if (state === 'blocked') {
    return <span className="topbar-note">Meldingen zijn geblokkeerd in je browser</span>;
  }

  async function toggle() {
    setBusy(true);
    setError('');
    try {
      if (state === 'on') {
        await disablePush();
        setState('off');
      } else {
        setState(await enablePush());
      }
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="text-button" onClick={() => void toggle()} disabled={busy}>
        {state === 'on' ? 'Meldingen uitzetten' : 'Meldingen aanzetten'}
      </button>
      {error && (
        <span className="topbar-note" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
