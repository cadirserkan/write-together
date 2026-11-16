import { useEffect, useState } from 'react';
import { messageOf } from '../api/client';
import { disablePush, enablePush, getPushState, type PushState } from '../push';

export function NotificationButton() {
  const [state, setState] = useState<PushState>('unavailable');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPushState()
      .then(setState)
      .catch(() => setState('unavailable'));
  }, []);

  // No button at all when this browser or this server cannot send notifications.
  if (state === 'unavailable') {
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
